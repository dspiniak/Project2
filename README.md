# Project 2

Web Programming with Python and JavaScript

*STATIC*
**channel.js**
Loads existing messages in server, sends and receives messages via websocket, and adds delete buttons to messages.

**channels.js**
Adds channel when the form is submitted.

**login.js**
stores username on localStorage

**redirect_channel.js**
When user clicks to go back to the channels list from a specific channel it sends to the server the current channel, signaling the user is going to the channels list via the button.

**style.css**
Stylesheet that adds formatting to the footer, messages, and buttons.

*TEMPLATES*

**apology.html**
Renders a message as specified by server parameter.

**channel.html**
Allows user to submit messages in the current channel. Uses channel.js and socket.io. Renders the channel title, an empty div that will contain messages, and a form to submit new messages.

**channels.html**
Allow user to create and access channels. Uses channels.js.

**layout.html**
Allows user to go to the channels list and logout. Imports bootstrap 3 and stylesheet.

**login.html**
Allows user to login by submitting username via a form.


*application.py*

Imports flask, flask_session, and flask_socketio

1. Uses global variables to store users, channels, and messages, and uses message counter to identify with unique messages across all channels

2. `MANAGE CHANNELS`

- index: Checks where is user coming from to redirect him to last page visited if user closed the browser, getting the last page visited from session variable.

- create_channel: gets new channel via post, adds it to channel list and sends back to client. Returns success false if channel already exists, true if it doesn't.

3. `INDIVIDUAL CHANNEL`

- view_channel: receives the channel_id via GET and remmbers the last channel visited by the user via session. Returns current channel id and its messages.

- load_messages: gets channel id via POST and returns all the current channel's messages

- delete_message: gets channel id and message id via POST. Finds matching message in server and deletes it. Returns true if succesfully finds message or false otherwise.

- message: submits message, storing in server and sending it back to client. Gets channel id, username, time, and message from socket. Saves message in server. The function also maintains messages stored in server at a maximum of 100, deleting any over that number.

4. `MANAGE USER SESSIONS`

- login: clears session. If reached via get it renders login.html. If reached via POST it gets the username via POST and ensures the username was submitted, that user does not exist, and remembers the user in session and stores the user in users list.

- logout: clears the session and redirects to "/"

*Helpers.py*

- login_required: decorates routes to redirect to login if user is not logged in.
