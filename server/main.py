import asyncio
import websockets
import logging
import json
import os

log_level = "DEBUG"
if os.getenv("LOG_LEVEL"):
    logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL")))


connections = {}


async def send_message(from_username, to, message, _type="message", **additional_fields):
    websockets = connections.get(to, None)
    if not websockets:
        return
    to_send = {"from": from_username, "message": message, "type": _type, **additional_fields}
    logging.debug(f"{to} << {to_send}")
    msg = json.dumps(to_send)
    await asyncio.wait([ws.send(msg) for ws in websockets])


async def broadcast_message(from_username, message, _type="message", **additional_fields):
    logging.debug(f"broadcast {from_username=} {message=}, connections: {[(k, len(s)) for k, s in connections.items()]}")
    await asyncio.wait([
        send_message(from_username, to, message, _type=_type, **additional_fields)
        for to in connections.keys()
        if to != from_username
    ])


async def broadcast_userlist():
    await broadcast_message(None, None, _type="user list updated", userList=list(connections.keys()))


async def chat(websocket, path):
    username = path.lstrip("/ws/")
    logging.debug(f"{username} connected")

    try:
        # TODO - GM - is this thread safe? I *think* it is cause GIL, but should be checked
        if username in connections:
            connections[username].add(websocket)
        else:
            connections[username] = set([websocket])
            await broadcast_userlist()

        while True:
            received_msg = await websocket.recv()
            r = json.loads(received_msg)
            logging.debug(f"{username} >> {r}")
            if "to" in r:
                await send_message(username, r["to"], r.get("message", None))
            else:
                await broadcast_message(username, r.get("message", None))
    except:
        logging.exception("An unforseen error!")
        raise
    finally:
        connections[username].remove(websocket)
        # TODO - GM - again, thread saftey?
        if len(connections[username]) == 0:
            connections.pop(username, None)
            await broadcast_userlist()
        logging.debug(f"{username} disconnected")

start_server = websockets.serve(chat, "*", 8765)

logging.debug(f"server started")
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
