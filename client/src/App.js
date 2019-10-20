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

// This is a very rare case of something making more sense as a component then a
// hook. The issue is that when implemented as a hook you only want to register the
// websocket event listener once. This would be done in a `useEffect` closure.
// However you don't want to re-run the event registration code whenver messages change
// (which is frequently), so you would not add `messages` as a dependency. But! that means
//  that due to how closures capture scope, `messages` within the effect callback
//  will be the same instance as it was *when the effect first ran*. Rather than
//  figuringout hacks around this, it actually makes sense to use a component since
//  itgives us an additional onbject-instance-level scope (`this`) to work with.
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
        if(this.ws) {
            this.ws.close()
            this.ws({send: null})
        }
        // TODO - GM - I've only used ws via signalr, there's probably some nice library that wraps reconnect logic and stuff I should investigate
        this.ws = new WebSocket(`ws:localhost:8765/ws/${this.props.username}`)
        this.ws.addEventListener(`open`, () => {
            const send = (message, to) => this.ws && this.ws.send(JSON.stringify({message, to}))
            this.setState({send})
        })

        this.ws.addEventListener('message', ({data}) => {
            const ev = JSON.parse(data)
            console.log(`recieved`, ev)
            if(`user list updated` === ev.type)
                this.setState({users: ev.userList})
            if(`message sync` === ev.type)
                this.setState({messages: ev.messages})
            if(`message` === ev.type)
                this.setState(({messages}) => ({messages: [...messages, ev]}))
        })
    }
    componentWillUnmount = () => {
        this.ws && this.ws.close()
        this.ws = null
    }
}

const UsersList = ({users}) => (
    <ul>
      {users.map(u => (
          <li key={u}>
            <Username username={u} />
          </li>
      ))}
    </ul>
)

const Chat = ({messages, users, send}) => {
    const {username} = useContext(CurrentUser)
    return (
        <When value={users} render={() => (
            <article>
              <header>Logged in as: {username}</header>
              <When value={users} render={() => (
                  <UsersList users={users} />
              )}/>
              <When value={messages} render={() => (
                  <ChatHistory messages={messages} />
              )}/>
              <When value={send} render={() => (
                  <SendMessageForm onSend={send} />
              )}/>
            </article>
        )} />
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
