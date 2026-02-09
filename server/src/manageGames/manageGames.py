from os import stat
import random
from typing import Literal, Optional
import chess
from fastapi import WebSocket
from databases.postgres import postgres
from databases.game import Game, GameMap, GameSnip, GameWatch
from databases.redis import myred
from utils.const import MODES
from utils.logger import mylog

class GameMan():
    @staticmethod
    async def opponentName(game: Game, username: str)-> str:
        return game.blackUsername if username == game.blackUsername else game.whiteUsername

    @staticmethod
    async def newHotseatGame(username: str, userId: int)-> Game:
        mylog.debug(f"new hotseat game: {username}, {userId}")
        id = await myred.newGameId("hotseat")
        game = Game(id, [chess.STARTING_FEN], [], None, None, "white", "black", userId, userId)
        await myred.addGame(game, "hotseat", username)
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "hotseat", username)
        return game

    @staticmethod
    async def newOnlineGame(username1: str, username2: str, id1: int, id2: int)-> int:
        color: bool = random.choice([True, False])
        id = await myred.newGameId("online")
        if color:
            game = Game(id, [chess.STARTING_FEN], [], None, None, username1, username2, id1, id2)
        else:
            game = Game(id, [chess.STARTING_FEN], [], None, None, username2, username1, id2, id1)
        await myred.addGame(game, "online", None)
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "online", None)
        return id

    @staticmethod
    async def resignGame(ws: WebSocket, userId: int, mode: MODES, game: Game, username: str):
        if mode == "hotseat":
            resignerColor = "w" if len(game.gameMoves) % 2 == 0 else "b"
        else:
            resignerColor = "b" if userId == game.blackId else "w"
        winner: int = game.blackId if resignerColor == "w" else game.whiteId
        game.winner = winner
        game.winnerName = game.blackUsername if resignerColor == "w" else game.whiteUsername
        await postgres.storeGameResult(mode, game)
        await myred.removeGame(game.id, mode, username)
        return game


    @staticmethod
    async def getGame(gameId: int, mode: MODES, username: str, userId: int):
        game = await myred.getCurrGameState(gameId, mode, username)
        if game is None:
            game = await postgres.getGameResult(gameId, userId)
        return game

    @staticmethod
    async def getActiveOnlineGames()-> list[GameWatch] :
        keys = await myred.getActiveOnlineGamesKeys()
        games: list[GameWatch] = []
        for k in keys:
            game = await myred.getGameWatch(int(k))
            if game:
                games.append(game)
        return games


