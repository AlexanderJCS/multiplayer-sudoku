from dataclasses import dataclass

import threading
import string
import time

import flask
import flask_socketio as sio

from player_list import PlayerList
from board import Board

import consts


@dataclass
class Game:
    player_list: PlayerList
    board: Board
    id: str
    timeout_time: int


class Games:
    def __init__(self):
        self.id_games_map: dict[str, Game] = {}
        self.players_game_id_map: dict[str, str] = {}

    def get_new_room_id(self):
        game_id = "NOT_UNIQUE"

        for _ in range(100):
            game_id = "".join([string.ascii_uppercase[i] for i in range(5)])

            if not self.has_game(game_id):
                return game_id

        return game_id

    def has_game(self, game_id) -> bool:
        return game_id in self.id_games_map

    def add_game(self, game_id: str, flask_app: flask.Flask):
        if self.id_games_map.get(game_id):
            return  # exit silently

        self.id_games_map[game_id] = Game(
            PlayerList(),
            Board(),
            game_id,
            time.time() + consts.CONFIG["game"]["timeout"]
        )
        
        consts.LOGGER.info(f"Created game ID: {game_id}")
        
        threading.Timer(consts.CONFIG["game"]["timeout"], self.remove_game, args=[flask_app, game_id]).start()

    def add_player(self, player_sid: str, game_id: str):
        if not self.id_games_map.get(game_id):
            raise KeyError(f"Game ID {game_id} does not exist, but {player_sid} tried joining it")

        self.players_game_id_map[player_sid] = game_id
        self.game_from_player(player_sid).player_list.add_player(player_sid)  # add the player to the player list
        sio.join_room(game_id, sid=player_sid)

    def remove_player(self, player_sid):
        sio.leave_room(self.players_game_id_map[player_sid], sid=player_sid)
        del self.players_game_id_map[player_sid]

    def game_from_player(self, player_sid) -> Game | None:
        """
        Get the game that a player is in
        :param player_sid: The player's session ID
        :return: The game, or None if the player is not in a game
        """
        
        if player_sid not in self.players_game_id_map:
            return None

        game_id = self.players_game_id_map[player_sid]
        return self.game_from_id(game_id)

    def game_from_id(self, game_id) -> Game | None:
        """
        Get the game object from the game ID
        :param game_id: The game ID
        :return: The game, or None if the game does not exist
        """
        
        return self.id_games_map.get(game_id)

    def remove_game(self, flask_app: flask.Flask, room_id: str):
        consts.LOGGER.info(f"Removing game {room_id} due to timeout")
        
        game = self.id_games_map.pop(room_id)
        game.player_list.close_room(flask_app, room_id)
