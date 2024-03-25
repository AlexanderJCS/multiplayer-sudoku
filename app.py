from flask import Flask, render_template
from flask_socketio import SocketIO, emit


app = Flask(__name__)
# TODO: Add the SECRET_KEY configuration to the app object.
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("updateBoard")
def handle_message(message):
    print(f"Received message: {message}")
    emit("updateBoard", message, broadcast=True)


@socketio.on("connect")
def handle_connect():
    # send the correct board to the client when they connect. the correct board is [0] * 81
    emit("correctBoard", [1] * 81)
    emit("updateBoard", [0] * 81)
    print("Received connection")


if __name__ == "__main__":
    socketio.run(app, host="localhost", use_reloader=False, log_output=True)
