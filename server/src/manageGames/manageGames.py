import random
from typing import Literal, Optional
import chess
from fastapi import WebSocket
from databases.postgres import postgres
from databases.game import Game
from databases.redis import myred
from utils.const import MODES
from utils.logger import mylog

class GameMan():
    @staticmethod
    async def opponentName(game: Game, username: str)-> str:
        return game.blackUsername if username == game.blackUsername else game.whiteUsername

    @staticmethod
    async def newHotseatGame(username1: str, id1: int)-> Game:
        mylog.debug(f"new hotseat game: {username1}, {id1}")
        id = await myred.newGameId("hotseat")
        game = Game(id, [chess.STARTING_FEN], [], None, "white", "black", id1, id1)
        await myred.addGame(game, "hotseat", username1)
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "hotseat")
        return game

    @staticmethod
    async def newOnlineGame(username1: str, username2: str, id1: int, id2: int)-> int:
        color: bool = random.choice([True, False])
        id = await myred.newGameId("online")
        if color:
            game = Game(id, [chess.STARTING_FEN], [], None, username1, username2, id1, id2)
        else:
            game = Game(id, [chess.STARTING_FEN], [], None, username2, username1, id2, id1)
        await myred.addGame(game, "online")
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "online")
        return id

    @staticmethod
    async def resignGame(ws: WebSocket, userId: int, mode: MODES, game: Game):
        resignerColor = "w" if len(game.gameMoves) % 2 == 0 else "b"
        winner: int = game.blackId if resignerColor == "w" else game.whiteId
        game.winner = winner
        await postgres.storeGameResult(mode, game)
        return game

