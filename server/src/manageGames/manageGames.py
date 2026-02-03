import random
from typing import Optional
import chess
from databases.postgres import postgres
from databases.game import Game
from databases.redis import myred
from utils.const import MODES

class GameMan():
    @staticmethod
    async def opponentName(game: Game, username: str)-> str:
        return game.blackUsername if username == game.blackUsername else game.whiteUsername

    @staticmethod
    async def newHotseatGame(username1: str, id1: int)-> Game:
        color: bool = random.choice([True, False])
        id = await myred.newGameId("hotseat")
        if color:
            game = Game(id, [chess.STARTING_FEN], [], "", username1, username1, id1, id1)
        else:
            game = Game(id, [chess.STARTING_FEN], [], "", username1, username1, id1, id1)
        await myred.addGame(game, "hotseat")
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "hotseat")
        return game

    @staticmethod
    async def newOnlineGame(username1: str, username2: str, id1: int, id2: int)-> int:
        color: bool = random.choice([True, False])
        id = await myred.newGameId("online")
        if color:
            game = Game(id, [chess.STARTING_FEN], [], "", username1, username2, id1, id2)
        else:
            game = Game(id, [chess.STARTING_FEN], [], "", username2, username1, id2, id1)
        await myred.addGame(game, "online")
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "online")
        return id
