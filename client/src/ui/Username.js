import React  from 'react'
import styled from 'styled-components'
import {useCurrentUser} from  '../current-user/CurrentUserContext.js'

export const UsernameContainer = styled.div`
  display: inline-block;
  font-family: monospace;
`
const MyUsernameContainer = styled(UsernameContainer)`
    font-weight: bold;
`
export const Username = ({username}) => {
    const me = useCurrentUser()
    return React.createElement(me.username === username ? MyUsernameContainer : UsernameContainer, null, username)
}
