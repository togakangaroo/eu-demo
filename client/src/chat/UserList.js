import React from 'react'
import styled from 'styled-components'
import {Username} from '../ui/Username.js'

export const UserListContainer = styled.ul`
    overflow-y: auto;
`
export const UserList = ({users}) => (
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
