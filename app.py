from dataclasses import dataclass
import hashlib

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

from player_list import PlayerList
import board


board = board.Board()

app = Flask(__name__)
# TODO: Add the SECRET_KEY configuration to the app object.
socketio = SocketIO(app, cors_allowed_origins="*")

player_list = PlayerList()


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("updateBoard")
def handle_message(message):
    if (not isinstance(message, dict)  # check data type of primary object
            or "loc" not in message or "value" not in message  # check keys
            or not isinstance(message["loc"], int) or not isinstance(message["value"], int)  # check data types of keys
            or message["loc"] < 0 or message["loc"] >= 81  # check bounds of location
            or message["value"] < 0 or message["value"] > 9):  # check bounds of value
        
        print(f"ERROR: Invalid message received {message}")
        return
    
    board.update_from_request(message)
    emit("updateBoard", message, broadcast=True)


@socketio.on("pencil_mark")
def handle_pencil_mark(message):
    if (not isinstance(message, dict)  # check data type of primary object
            or "loc" not in message or "value" not in message  # check keys
            or not isinstance(message["loc"], int) or not isinstance(message["value"], str)  # check data types of keys
            or message["loc"] < 0 or message["loc"] >= 81  # check bounds of location
            or (not message["value"].isdigit() and len(message) == 0) or "0" in message["value"]):

        print(f"ERROR: Invalid pencilMark message received {message}")
        return

    board.pencil_mark(message)
    emit("pencil_mark", message, broadcast=True)


@socketio.on("disconnect")
def handle_disconnect():
    print(f"Received disconnection from {request.sid}")
    player_list.remove_player(request.sid)
    emit("players", player_list.as_dict(), broadcast=True)


@socketio.on("requestInitData")
def handle_request_init_data():
    emit("boardData", board.get_init_data())
    emit("players", player_list.as_dict())


@socketio.on("connect")
def handle_connect():
    print(f"Received connection from {request.sid}")
    player_list.add_player(request.sid)
    emit("players", player_list.as_dict(), broadcast=True)


if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", use_reloader=False, log_output=True)
