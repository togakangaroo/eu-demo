import React from 'react'
import styled from 'styled-components'
import {UserList, UserListContainer} from './UserList.js'
import {ChatHistory, ChatHistoryContainer} from './ChatHistory.js'
import {SendMessageForm, SendMessageFormContainer} from './SendMessageForm.js'
import {useCurrentUser} from '../current-user/CurrentUserContext.js'
import {When} from '../ui/When.js'

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
export const Chat = ({messages, users, send}) => {
    const {username} = useCurrentUser()
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
