from dataclasses import dataclass
import hashlib
import random

import flask
import flask_socketio as sio


def hash_sid(sid):
    return hashlib.sha256(sid.encode()).hexdigest()


class PlayerList:
    def __init__(self):
        self.players: dict[str, Player] = {}
        self.player_counter = 1

    def modify_player(self, sid: str, name: str, color: str):
        self.players[sid].name = name
        self.players[sid].color = color

    def get_player(self, sid: str):
        return self.players[sid]

    def add_player(self, sid):
        hashed = hash_sid(sid)
        self.players[sid] = Player(f"Player {self.player_counter}", hashed)
        self.player_counter += 1

    def remove_player(self, sid):
        del self.players[sid]

    def as_dict(self):
        # Hash the SID for security reasons: other clients should not know the session ID of the player
        # Not sure if the SID matters too much, but it's best not to expose it
        return {hash_sid(sid): profile.__dict__ for sid, profile in self.players.items()}
    
    def close_room(self, flask_app: flask.Flask, room_id: str) -> None:
        """
        Closes the room and removes all players from it.
        
        :param flask_app: The flask app to close the room on
        :param room_id: The room ID to close
        """
        
        # flask_app.test_request_context is kind of a hack, but it works
        # It's used to set the context to the room ID so that the room can be closed
        # This is validated by this StackOverflow forum:
        # https://stackoverflow.com/questions/31647081/flask-python-and-socket-io-multithreading-app-is-giving-me-runtimeerror-work
        with flask_app.test_request_context(f"/{room_id}"):
            sio.emit("room_timeout", to=room_id, namespace=f"/")
            sio.close_room(room_id, namespace=f"/")
            
            for player in self.players.keys():
                sio.disconnect(sid=player, namespace=f"/")


@dataclass
class Player:
    name: str
    hashed_sid: str
    color: str = None
    pos: int = -1

    def __post_init__(self):
        self.color = (
            f"rgb("
            f"{random.randint(0, 255)},"
            f"{random.randint(0, 255)},"
            f"{random.randint(0, 255)}"
            f")"
        )
