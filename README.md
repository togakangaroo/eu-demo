A simple client/server single-room chat server written for an interview prompt.

Features supported:
- Send messages to everyone connected
- See everyone online in real time
- The same user can connect from multiple windows
- Ability to send and recieve private message
- See latest broadcast messages when you connect for the first time

Features not supported:
- Authentication, you put in what name you are and the assumption is that you're not lying (IRC style)
- Persistence accross server restarts
- Any sort of server-side persistence of private messages
- Automatic websocket reconnect if a connection is lost or interrupted
- Not running on production-quality web servers.
- Any sort of error handling - if a message fails to send you will not necessarily know about it

To start:

```
##    docker-compose up client
```

Then [open your browser to localhost:3008](http://localhost:3008)

Why is this on the `main` and not `master` branch? Because this is for an interview and I believe github search works only over `master` branches.

# Problem Prompt:

## Let’s Continue the Conversation!

We’ve enjoyed chatting and want to continue the conversation. This simple exercise is one of the best ways we’ve found to learn more about each other.

Before you get started:

There is a lot of flexibility to this exercise... and it’s intentional. We always appreciate clean, well-documented code, but we’re also looking to see how you approach problems and make tradeoffs. We’re just as interested to discuss your design and architecture choices as we are to see a working app.

## A Basic Chat App

Create a web-based chat application where a user can send and receive messages. It’s up to you whether this runs client-side or uses a server. You can use whatever technology you feel is most appropriate (we use React client-side with Node and Python server-side). If you do not have time to finish an entire application, focus on what you think is most important. We know you’re busy and appreciate that you’re spending time on this.

## What should the application do?

At the very least there should be a UI for a user to type in and send a message (mocked or actual) and a UI for another user to see incoming messages. The more real and usable the application the better. We’ve seen everything from both views running in the same browser to
multi-device chat.

## What about using open source?

Where it makes sense to augment your own code with open source libraries or frameworks, go for it - just be sure to properly attribute other people’s work.

## How should the application be submitted?

Please do the following:
- Create a Github repository(s) for the application with relevant instructions on how to run it
- Please email a link to the repository along with a brief description of the application.

We are excited to see what you build!

# Getting started

This application features a reactjs (create-react-app) UI and a python websockets backend. To make it easier to run, both are dockerized into their own containers which are set up via a docker-compose file. You will need a reasonably modern docker installed. In the process of setting itself up, the application will download ~400mb of images and dependencies.

To start:

```
    docker-compose up client
```

Then [open your browser to localhost:3008](http://localhost:3008)

You will also need port 8765 to be available on your host. This is due to a bug in setting up the create-react-app proxy which I was unable to track down in the time available (see `setupProxy.js` for more info**. As a result, the websocket is served directly from the `server *application rather than being proxied via the CRA dev server.

# Domain

The client only really sends messages to the server that give message test and who they want to send a message to. The current user is identified by the pathname

The most important thing to understand are the message types sent by the server.

## `message`

An actual chat message either sent privately (it has a non-empty `to` field**, or broadcast to the group.

## `user list updated**

A change in the connected user list occurred. Here is the new user list.

## `message sync`

Here are all the messages the server knows about. This is typically sent after a user's browser connects for the first time so the user can see a limited backscroll.


# TODOs:

- The server is extremely simple at the moment - to the point that I didn't want to use more than one file for it. I also had not used python websockets before and long-term need to review that everything is working correctly
- The CRA proxy is not working for websockets. For more see `setupProxy.js`
- I've only used websockets via signalr in production. Here I am using them natively. There's probably some nice library that wraps reconnect logic and stuff I should investigate.
- The ChatStateManager has to make use of some unusual (for this day and age** React patterns to work reliably. There are likely other patterns that could work
- There is currently no error handling or checking if a message actually sent successfully
- I am 70% sure that the server right now is thread-safe but there are some areas which I'm not certain about and would need investigation
- It can certainly be prettied up some.
- It would be nice to [render messages entered in markdown](https://www.npmjs.com/package/react-markdown)

# But Why No Tests?!!

I am a big fan of testing and TDD. However it *does* take time and that was something I didn't have a luxury of here. It can save time in situations where you don't know exactly what you're building, but again, in this case I did.

There are barely any actual workflows or business logic worth writing tests for here and those that are are pretty clear cut. Worse the most benefit would be in exploratory tests and, places such as `ChatStateManager`; thse would need infrastructure stubbed out in a useful manner - and stubbing out infrastructure is almost always a sizable time sink. With more time I absolutely would have done it.
