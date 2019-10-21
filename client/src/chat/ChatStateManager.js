import React from 'react'
import {createWebsocketManager} from './createWebsocketManager.js'
import {CurrentUserContext} from '../current-user/CurrentUserContext.js'
import {Chat} from './Chat.js'

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
export const ChatStateManager = class extends React.Component {
    // Requires a single username prop - since propTypes is now its own library its silly to import it for one thing
    state = {
        messages: null,
        users: null,
        send: null,
    }
    render = () => (
        <CurrentUserContext.Provider value={{username: this.props.username}}>
          <Chat {...this.state} />
        </CurrentUserContext.Provider>
    )
    componentDidMount = () => this.componentDidUpdate()
    componentDidUpdate = (prevProps={}) => {
        if(this.props.username === prevProps.username)
            return
        this.wsManager.initialize(this.props.username)
    }
    componentWillUnmount = () => this.wsManager.dispose()
    wsManager = createWebsocketManager((...x) => this.setState(...x))
}
