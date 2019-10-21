import React from 'react'
import styled from 'styled-components'
import {Username, UsernameContainer} from '../ui/Username.js'

const BroadcastMessageFromContainer = styled.div`
    display: inline-block;
`
const PrivateMessageFromContainer = styled(BroadcastMessageFromContainer)`
    font-style: italic;
    color: #833;
    &:after {
        font-size: .7em;
    }
`
export const MessageFrom = ({from, to}) => (
    React.createElement(to ? PrivateMessageFromContainer : BroadcastMessageFromContainer, null, (
        <Username username={from} />
    ))
)

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
