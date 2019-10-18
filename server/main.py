import asyncio
import websockets
import logging
import json
import os

log_level = "DEBUG"
if os.getenv("LOG_LEVEL"):
    logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL")))

connected_users = {}


async def send_message(from_username, to, message):
    ws = connected_users.get(to, None)
    if not ws or not message:
        return
    to_send = {"from": from_user, "message": message}
    logging.debug(f"{to} << {to_send}")
    ws.send(json.dumps(to_send))


async def broadcast_message(from_username, message):
    await asyncio.wait([
        send_message(from_username, to, message)
        for to in connected_users.keys()
        if to != from_username
    ])


async def chat(websocket, username):
    logging.debug(f"{username} connected")

    try:
        connected_users[username] = websocket

        while True:
            r = json.loads(await websocket.recv())
            logging.debug(f"{username} >> {r}")
            to = r.get("to", None)
            if to:
                await send_message(username, to, r.get("message", None))
            else:
                await broadcast_message(username, r.get("message", None))

    finally:
        connected_users.pop(username, None)

start_server = websockets.serve(chat, "*", 8765)

logging.debug(f"server started")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
