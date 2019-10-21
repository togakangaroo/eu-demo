import React, {useState} from 'react'
import styled from 'styled-components'
import {Labeled} from '../ui/Labeled.js'
import {SemanticForm} from '../ui/SemanticForm.js'
import {useCurrentUser} from '../current-user/CurrentUserContext.js'

export const SendMessageFormContainer = styled.section`
    font-size: 120%;
    form {
        display: flex;
        align-items: flex-start;
        & > * + * { margin-left: 10px; }
    }
    textarea { flex: 1; }
`
export const SendMessageForm = ({onSend, users}) => {
    const me = useCurrentUser()
    const [message, setMessage] = useState(``)
    const [to, setTo] = useState(``)
    const sendableMessage = message.trim()
    const otherUsers = users.filter(u => u !== me.username)
    const send = () => {
        onSend(sendableMessage, to)
        setMessage(``) //TODO - GM - Error handling, if the message doesn't send successfully don't clear it
    }
    return (
        <SendMessageFormContainer>
          <SemanticForm>
            <Labeled label="To">
              <select value={to} onChange={e => setTo(e.target.value)}>
                <option value="">Everyone</option>
                {otherUsers.map(u => (
                    <option key={u}>{u}</option>
                ))}
              </select>
            </Labeled>
            <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} required />
            <button onClick={send} disabled={!sendableMessage}>Send</button>
          </SemanticForm>
        </SendMessageFormContainer>
    )
}

