import os

from collections import defaultdict

from flask import Flask, session, render_template, request, redirect, jsonify
from flask_session import Session

from flask_socketio import SocketIO, emit

from helpers import login_required

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

users = {}
channels = []
messages = defaultdict(list)
pressed_button = "FALSE"


""" MANAGE CHANNELS """
@app.route("/", methods=["GET", "POST"])
@login_required
def index(pressed_button="FALSE"):

    # get channel via POST
    if request.method == "GET":

        # check were is user coming from (if closed browser)
        if not session.get("user_id") or not session.get("last_page"):
            session["last_page"] = "/"
            print("1")
            return render_template("channels.html", channels=channels), 200

        else:
            if session.get("last_page") == "/":
                print('2')
                return render_template("channels.html", channels=channels), 200
            else:
                print('3')
                return redirect(session.get("last_page")), 302

    else:
        print('4')
        session["last_page"] = "/"
        pressed_button = request.form.get("pressed_button")
        return redirect("/"), 302


@app.route("/add_channel", methods=["POST"])
def create_channel():

    # get channel via POST and send back to client
    if request.method == "POST":

        # get new channel from form and add to channels
        new_channel = request.form.get("new_channel")

        if new_channel in channels:
            return jsonify({"success": False})

        else:
            channels.append(new_channel)

        # send channel back to client
        return jsonify({"success": True, "new_channel": new_channel})

    else:
        return render_template(
                              "apology.html",
                              message="entered through GET method, only POST"
                              "allowed"
                              ), 400


"""INDIVIDUAL CHANNEL"""
@app.route("/channel/<channel_id>", methods=["GET", "POST"])
@login_required
def view_channel(channel_id):

    # get current channel
    this_channel_messages = messages[str(channel_id)]

    # remember last channel visited by user
    session["last_page"] = "/channel/"+str(channel_id)

    return render_template("channel.html", channel_id=channel_id,
                           messages=this_channel_messages), 200


@app.route("/load_messages", methods=["POST"])
@login_required
def load_messages(channel_id):
    this_channel_messages = messages[str(channel_id)]
    return jsonify({"success": True, "messages": this_channel_messages})


@socketio.on("submit message")
def message(data):
    # Get the channel_id, username, time, message from socket
    channel_id = data["channel_id"]
    username = session.get("user_id")
    time = data["time"]
    message = data["message"]

    # Save message in server
    messages[channel_id].append({"time": time,
                                 "username": username,
                                 "text": message
                                 })

    # Delete if there are >= 100 messages
    while len(messages[channel_id]) > 100:
        del(messages[channel_id][0])

    # send message to all users
    emit("send message",
         {"time": time,
          "username": username,
          "message": message},
         broadcast=True)


""" MANAGE USER SESSIONS """
@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        username = request.form.get("username")

        # Ensure username was submitted
        if not username:
            return render_template(
                                   "apology.html",
                                   message="must provide username"
                                   ), 400

        # Check if username already used
        if username in users:
            return render_template(
                                  "apology.html",
                                  message="username already used"
                                  ), 400

        # Remember which user has logged in and store username in user dict
        else:
            session["user_id"] = username
            users[session["user_id"]] = username

        # Redirect user to home page
        return redirect('/'), 302

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html"), 200


@app.route("/logout")
def logout():
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/"), 302
