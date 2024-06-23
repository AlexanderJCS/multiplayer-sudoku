from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

import consts
from games import Games
import gen_key

from consts import CONFIG


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins=CONFIG["server"]["cors_allowed_origins"])

try:
    with open("secret_key.txt", "r") as f:
        app.config["SECRET_KEY"] = f.read()
except FileNotFoundError:
    consts.LOGGER.warn(
        "\nSecret key file not found.\n"
        "Generating a temporary secret key for this session. It is highly recommended to set a permanent key.\n"
        "Please run the gen_key.py script to generate a permenant key"
        "\n"
    )
    
    app.config["SECRET_KEY"] = gen_key.gen_key()


games = Games()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/<game_code>")
def game_code_req(game_code):
    games.add_game(game_code, app)
    return render_template(
        "game.html",
        websocket_connection_url=CONFIG["server"]["websocket_connection_url"],
        game_id=game_code
    )


@socketio.on("update_board")
def handle_message(message):
    if (not isinstance(message, dict)  # check data type of primary object
            or "loc" not in message or "value" not in message  # check keys
            or not isinstance(message["loc"], int) or not isinstance(message["value"], int)  # check data types of keys
            or message["loc"] < 0 or message["loc"] >= 81  # check bounds of location
            or message["value"] < 0 or message["value"] > 9):  # check bounds of value

        consts.LOGGER.debug(f"Invalid message received {message}")
        return

    game = games.game_from_player(request.sid)

    if game is None:  # player did not properly connect to a game
        return

    points = game.board.update_from_request(message)
    
    player = game.player_list.get_player(request.sid)
    player.points = max(0, player.points + points)  # ensure points are not negative
    
    emit("update_board", message, to=game.id)
    emit("update_player", game.player_list.get_player(request.sid).__dict__, to=game.id)


@socketio.on("pencil_mark")
def handle_pencil_mark(message):
    if (not isinstance(message, dict)  # check data type of primary object
            or "loc" not in message or "value" not in message  # check keys
            or not isinstance(message["loc"], int) or not isinstance(message["value"], str)  # check data types of keys
            or message["loc"] < 0 or message["loc"] >= 81  # check bounds of location
            or (not message["value"].isdigit() and len(message) == 0) or "0" in message["value"]):
        consts.LOGGER.debug(f"Invalid pencilMark message received {message}")
        return

    game = games.game_from_player(request.sid)
    
    if game is None:  # player did not properly connect to a game
        return
    
    game.board.pencil_mark(message)
    emit("pencil_mark", message, to=game.id)


@socketio.on("disconnect")
def handle_disconnect():
    consts.LOGGER.debug(f"Received disconnection from {request.sid}")

    game = games.game_from_player(request.sid)

    if game is None:  # player did not properly connect to a game
        return

    game.player_list.remove_player(request.sid)
    emit("players", game.player_list.as_dict(), to=game.id)


@socketio.on("join_game")
def handle_join_game(game_code):
    consts.LOGGER.debug(f"Received join_game request for code {game_code}")

    if not games.has_game(game_code):
        consts.LOGGER.debug(f"Client tried connecting to game {game_code} which does not exist")
        return

    games.add_player(request.sid, game_code)
    game = games.game_from_player(request.sid)

    emit("board_data", game.board.get_init_data())
    emit("your_color", game.player_list.get_player(request.sid).color)
    emit("timeout_time", game.timeout_time, to=request.sid)
    emit("players", game.player_list.as_dict(), to=game.id)


@socketio.on("update_player")
def update_player(player_data):
    if "name" in player_data and "color" in player_data \
            and isinstance(player_data["name"], str) and isinstance(player_data["color"], str) \
            and 0 < len(player_data["name"]) < 25:
        game = games.game_from_player(request.sid)
        
        if game is None:  # player did not properly connect to a game
            return
        
        game.player_list.modify_player(request.sid, player_data["name"], player_data["color"])

        emit("update_player", game.player_list.get_player(request.sid).__dict__, to=game.id)


@socketio.on("move_cursor")
def handle_move_cursor(cursor_data):
    if "pos" not in cursor_data or \
            not (isinstance(cursor_data["pos"], int) or cursor_data["pos"] is None) \
            or cursor_data["pos"] < -1 \
            or cursor_data["pos"] >= 81:
        consts.LOGGER.debug(f"Invalid cursor data: {cursor_data}")
    
    game = games.game_from_player(request.sid)
    
    if game is None:  # player did not properly connect to a game
        return
    
    player = game.player_list.get_player(request.sid)
    player.pos = cursor_data["pos"]
    emit("move_cursor", {"player": player.hashed_sid, "pos": cursor_data["pos"]}, to=game.id)


@socketio.on("connection_error")
def handle_connection_error(message):
    consts.LOGGER.warn(f"Received connection_error message: {message}")


@socketio.on("connect")
def handle_connect():
    consts.LOGGER.debug(f"Received connection from {request.sid}")


if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", use_reloader=True, log_output=True)
