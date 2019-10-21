export const createWebsocketManager = (setState) => {
    let ws
    const initialize = (username) => {
        if(ws) {
            ws.close()
            setState({send: null})
        }
        //TODO - GM - I've only used websockets via signalr, there's probably some nice library that wraps reconnect logic and stuff I should investigate
        //TODO - GM - this port number means we're not going through the backend proxy but through an open port in the server docker-compose. This is not what we want. See setupProxy.js for more
        ws = new WebSocket(`ws://localhost:8765/ws/${username}`)
        ws.addEventListener(`open`, () => {
            const send = (message, to) => ws && ws.send(JSON.stringify({message, to}))
            setState({send})
        })

        ws.addEventListener('message', ({data}) => {
            const ev = JSON.parse(data)
            if(`user list updated` === ev.type)
                setState({users: ev.userList})
            if(`message sync` === ev.type)
                setState({messages: ev.messages})
            if(`message` === ev.type)
                setState(({messages}) => ({messages: [...messages, ev]}))
        })
    }
    const dispose = () => {
        if(!ws)
            return
        ws.close()
        ws = null
        setState({send: null})
    }
    return {initialize, dispose}
}
