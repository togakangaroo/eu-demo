import asyncio
import websockets
import logging
import json
import os

log_level = "DEBUG"
if os.getenv("LOG_LEVEL"):
    logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL")))


# server state
connections = {}
messages_broadcast = []


async def send(type_, recipient, **fields):
    """
    Core "send anything on the websocket to a connected user message" abstraction
    """
    # fields might contain a "to" field which is not necessarily the recipient of this ws send
    websockets = connections.get(recipient, None)
    if not websockets:
        return
    msg = {"type": type_, "to": recipient, **{k.rstrip("_"): v for k, v in fields.items()}}
    logging.debug(f"{recipient} << {msg}")
    to_send = json.dumps(msg)
    await asyncio.wait([ws.send(to_send) for ws in websockets])
    return msg


async def send_message(from_, to, message, **additional_fields):
    """
    Send private chat messages directly to an connected user
    """
    return await send("message", to, from_=from_, message=message, **additional_fields)


async def broadcast(type_, **fields):
    """
    Core "send anything on the websocket to everyone" abstraction
    """
    logging.debug(f"broadcast type={type_} | {fields=} | connections: {[(k, len(s)) for k, s in connections.items()]}")
    await asyncio.wait([
        send(type_, to, **fields)
        for to in connections.keys()
    ])


async def broadcast_message(from_, message, **additional_fields):
    """
    Broadcast chat messages to everyone connected. Use this function rather than your own to do this as it also records state.
    """
    global messages_broadcast
    await broadcast("message", from_=from_, message=message, **additional_fields)
    messages_broadcast = [*messages_broadcast, {"from": from_, "message": message, "type": "message"}][:10]


async def broadcast_userlist():
    await broadcast("user list updated", userList=list(connections.keys()))


async def send_message_sync(to):
    await send("message sync", to, messages=messages_broadcast)


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
        await send_message_sync(username)

        while True:
            received_msg = await websocket.recv()
            r = json.loads(received_msg)
            logging.debug(f"{username} >> {r}")
            message = r.get("message", "")
            to = r.get("to", None)
            if to:  # Direct message
                dm = await send_message(username, to, message)  # recipient
                await send("message", username, **dm)  # sender
            else:
                await broadcast_message(username, message)
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
