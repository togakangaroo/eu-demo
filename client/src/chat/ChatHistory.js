import React from 'react'
import styled from 'styled-components'
import {MessageContainer, MessageText} from './Messages.js'
import {Username} from '../ui/Username.js'

export const ChatHistoryContainer = styled.section`
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
export const ChatHistory = ({messages}) => (
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
