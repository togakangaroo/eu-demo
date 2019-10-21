import styled from 'styled-components'
import {UsernameContainer} from '../ui/Username.js'

export const MessageContainer = styled.div`
    display: contents;
    ${UsernameContainer}:after {
        content: ":";
        margin-right: .7em;
    }
`
export const MessageText = styled.pre`
    margin: 0;
    padding: 0;
    font-family: inherit;
`
