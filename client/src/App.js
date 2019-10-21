import React from 'react'
import {Router} from '@reach/router'
import {NameEntry} from './current-user/NameEntry.js'
import {ChatStateManager} from './chat/ChatStateManager.js'
import './App.css'

const App = () => {
    return (
        <Router>
          <ChatStateManager path="/:username" />
          <NameEntry path="/" />
        </Router>
    )
}

export default App;
