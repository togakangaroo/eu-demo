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

const MessageContainer = styled.div`
    display: contents;
    ${UsernameContainer}:after {
        content: ":";
        margin-right: .7em;
    }
`
const MessageText = styled.div``
const ChatHistoryContainer = styled.section`
    overflow-y: scroll;
`
const ChatHistoryList = styled.ul`
    display: grid;
    grid-template-columns: min-content 1fr;
    grid-template-rows: min-content;
    & > li {
        display: contents;
    }
`
const ChatHistory = ({messages}) => (
    //GM - there is no unique identifier form messages, the correct thing to do is to spread, but the react babel jsx transform does not support spreading children
    <ChatHistoryContainer>
      {React.createElement(ChatHistoryList, null, ...messages.map(m => (
          <li>
            <MessageContainer>
              <Username username={m.from} />
              <MessageText>{m.message}</MessageText>
            </MessageContainer>
          </li>
      )))}
    </ChatHistoryContainer>
)
const SendMessageFormContainer = styled.section``
const SendMessageForm = ({onSend, users}) => {
    const me = useContext(CurrentUser)
    const [message, setMessage] = useState(``)
    const [to, setTo] = useState(``)
    const sendableMessage = message.trim()
    const otherUsers = users.filter(u => u !== me.username)
    const send = () => {
        onSend(sendableMessage, to)
        setMessage(``) //TODO - GM - if the message never sends don't clear it
    }
    return (
        <SendMessageFormContainer>
          <SemanticForm>
            <Labeled label="To">
              <select value={to} onChange={setVal(setTo)}>
                <option value="">Everyone</option>
                {otherUsers.map(u => (
                    <option key={u}>{u}</option>
                ))}
              </select>
            </Labeled>
            <input placeholder="Message" value={message} onChange={setVal(setMessage)} required />
            <button onClick={send} disabled={!sendableMessage}>Send</button>
          </SemanticForm>
        </SendMessageFormContainer>
    )
}

const createWebsocketManager = (getUsername, setState) => {
    let ws
    const initialize = () => {
        if(ws) {
            ws.close()
            setState({send: null})
        }
        //TODO - GM - I've only used ws via signalr, there's probably some nice library that wraps reconnect logic and stuff I should investigate
        //TODO - GM - this port number means we're not going through the backend proxy but through an open port in the server docker-compose. This is not what we want. See setupProxy.js for more
        ws = new WebSocket(`ws://localhost:8765/ws/${getUsername()}`)
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

// This is a very rare case of something making more sense as a component then a
// hook. The issue is that when implemented as a hook you only want to register the
// websocket event listener once. This would be done in a `useEffect` closure.
// However you don't want to re-run the event registration code whenver messages change
// (which is frequently), so you would not add `messages` as a dependency. But! that means
// that due to how closures capture scope, `messages` within the effect callback
// will be the same instance as it was *when the effect first ran*. Rather than
// figuringout hacks around this, it actually makes sense to use a component since
// it gives us an additional onbject-instance-level scope (`this`) to work with.
//
// TODO - GM - explore other ways of achieving a similar effect by for example using a redux-style pattern
const ChatStateManager = class extends React.Component {
    // Requires a single username prop - since propTypes is now its own library its silly to import it for one thing
    state = {
        messages: null,
        users: null,
        send: null,
    }
    render = () => (
        <CurrentUser.Provider value={{username: this.props.username}}>
          <Chat {...this.state} />
        </CurrentUser.Provider>
    )
    componentDidMount = () => this.componentDidUpdate()
    componentDidUpdate = (prevProps={}) => {
        if(this.props.username === prevProps.username)
            return
        this.wsManager.initialize()
    }
    componentWillUnmount = () => this.wsManager.dispose()
    wsManager = createWebsocketManager(() => this.props.username, (...x) => this.setState(...x))
}

const UserListContainer = styled.ul`
    overflow-y: auto;
`
const UserList = ({users}) => (
    <UserListContainer>
      <ul>
        {users.map(u => (
            <li key={u}>
              <Username username={u} />
            </li>
        ))}
      </ul>
    </UserListContainer>
)

const ChatContainer = styled.article`
    height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    display: grid;
    grid-gap: 10px;
    grid-template-areas:
        "header       header   "
        "chat-history user-list"
        "send-message user-list";
    grid-template-columns: 1fr min-content;
    grid-template-rows: min-content 1fr min-content;
    ${UserListContainer} {
       grid-area: user-list;
    }
    ${ChatHistoryContainer} {
       grid-area: chat-history;
    }
    ${SendMessageFormContainer} {
       grid-area: send-message;
    }
`

const Chat = ({messages, users, send}) => {
    const {username} = useContext(CurrentUser)
    return (
        <ChatContainer>
          <header>Logged in as: {username}</header>
          <When value={users} render={() => (
              <UserList users={users} />
          )}/>
          <When value={messages} render={() => (
              <ChatHistory messages={messages} />
          )}/>
          <When value={send && users} render={() => (
              <SendMessageForm onSend={send} users={users} />
          )}/>
        </ChatContainer>
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
          <ChatStateManager path="/:username" />
          <NameEntry path="/" />
        </Router>
    )
}

export default App;
