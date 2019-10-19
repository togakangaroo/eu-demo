import React, {useState, useEffect, useContext} from 'react'
import styled from 'styled-components'
import {Router, navigate} from '@reach/router'
import './App.css'

const Label = styled.div`
    display: inline-block;
    &:after {
        content: ":";
        margin-right: 0.6em;
    }
`

export const Labeled = ({label, children}) =>(
    <label>
      <Label>{label}</Label>
      {children}
    </label>
)
export const When = ({value, render}) => {
    if(value)
        return render(value)
    return "Please wait..."
}

const CurrentUser = React.createContext(null)

const UsernameContainer = styled.div`
  display: inline-block;
  font-family: monospace;
`
const MyUsernameContainer = styled(UsernameContainer)`
    font-weight: bold;
`
const Username = ({username}) => {
    const me = useContext(CurrentUser)
    return React.createElement(me.username === username ? MyUsernameContainer : UsernameContainer, null, username)
}

const ChatHistory = ({messages}) => (
    //GM - there is no unique identifier form messages, the correct thing to do is to spread, but the react babel jsx transform does not support spreading children
    React.createElement(`ul`, null, ...messages.map(m => (
        <li>
          <Username username={m.from} />:
          {m.message}
        </li>
    )))
)
const SendMessageForm = ({onSend}) => {
    const [message, setMessage] = useState(``)
    const sendableMessage = message.trim()
    return (
        <SemanticForm>
          <input placeholder="Message" value={message} onChange={setVal(setMessage)} required />
          <button onClick={() => onSend(sendableMessage)} disabled={!sendableMessage}>Send</button>
        </SemanticForm>
    )
}

const Chat = ({username}) => {
    const [users, setUsers] = useState(null)
    const [messages, setMessages] = useState([])
    const [send, setSend] = useState(null)
    useEffect(() => {
        // TODO - GM - I've only used ws via signalr, there's probably some nice library that wraps reconnect logic and stuff I should investigate
        const socket = new WebSocket(`ws:localhost:8765/ws/${username}`)
        setSend(() => (message, to) => socket.send(JSON.stringify({message, to})))

        socket.addEventListener('message', ({data}) => {
            const ev = JSON.parse(data)
            console.log(`recieved`, ev)
            if(`user list updated` === ev.type)
                setUsers(ev.userList)
            if(`message sync` === ev.type)
                setMessages(ev.messages)
            if(`message` === ev.type)
                setMessages([...messages, ev])
        })
        return () => {
            socket.close()
            setSend(null)
        }
        //we really want this to rerun only when the username changes so disable checking for any other dependencies
    }, [username]) //eslint-disable-line react-hooks/exhaustive-deps

    return (
        <CurrentUser.Provider value={{username}}>
          <When value={users} render={() => (
              <article>
                <header>Logged in as: {username}</header>
                <ul>
                  {users.map(u => (
                      <li key={u}>
                        <Username username={u} />
                      </li>
                  ))}
                </ul>
                <When value={messages} render={() => (
                    <ChatHistory messages={messages} />
                )}/>
                <When value={send} render={() => (
                    <SendMessageForm onSend={send} />
                )}/>
              </article>
          )} />
        </CurrentUser.Provider>
    )
}

const preventDefault = e => e.preventDefault()
const SemanticForm = (props) => React.createElement(`form`, {onSubmit: preventDefault, ...props})

const setVal = setFn => e => setFn(e.target.value)

const NameEntry = () => {
    const [name, setName] = useState(``)
    const go = () => {

        if(!name.trim())
            return
        navigate(`/${name}`)
    }
    return (
        <article>
          <SemanticForm>
            <Labeled label="Enter username">
              <input onChange={setVal(setName)} required />
            </Labeled>
          </SemanticForm>
          <button onClick={go}>Go</button>
        </article>
    )
}


const App = () => {
    return (
        <Router>
          <Chat path="/:username" />
          <NameEntry path="/" />
        </Router>
    )
}

export default App;
