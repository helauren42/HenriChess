from dataclasses import asdict
import random
from typing import Literal
import chess
from fastapi import WebSocket
from databases.postgres import postgres
from databases.game import Game, GameMove, GameWatch
from databases.redis import myred
from utils.const import MODES, onlinePlayers
from utils.logger import mylog

class AGameMan():
    @staticmethod
    async def sendError(ws: WebSocket, msg: str):
        await ws.send_json({
            "type": "error",
            "error": msg
        })

    @staticmethod
    async def sendGame(ws: WebSocket, mode: MODES, subtype: Literal["new", "continue", "update"], id: int, game: Game):
        gameDict = asdict(game)
        try:
            await ws.send_json({
                "type": "game",
                "mode": mode,
                "subtype": subtype,
                "id": id,
                "game": gameDict,
            })
        except Exception as e:
            mylog.error(f"sendGame {subtype} failed for game: {id}")

    @staticmethod
    async def sendGameExpired(ws: WebSocket, gameId: int):
        mylog.debug(f"sending game expired for gameId: {gameId}")
        await ws.send_json({
            "type": "gameExpired",
            "id": gameId
        })

class GameMan(AGameMan):
    @staticmethod
    async def opponentName(game: Game, username: str)-> str:
        return game.blackUsername if username == game.blackUsername else game.whiteUsername

    @staticmethod
    async def startGameHotseat(ws: WebSocket, userId: int, username: str, re: bool = False):
        mylog.debug(f"startGameHotseat: {username}")
        try:
            # res = await postgres.fetchHotseatGame(userId, None, True)
            gameId = await myred.findActiveHotseatGameId(username)
            if gameId:
                game = await myred.getCurrGameState(gameId, "hotseat", username)
                assert game is not None
                if re:
                    mylog.debug("deleteActiveGame")
                    game = await GameMan.newHotseatGame(username, userId)
                    # await postgres.deleteActiveGame("hotseat", gameId)
                    await GameMan.sendGame(ws, "hotseat", "continue", game.id, game)
                else:
                    await GameMan.sendGame(ws, "hotseat", "new", game.id, game)
            else:
                game = await GameMan.newHotseatGame(username, userId)
                await GameMan.sendGame(ws, "hotseat", "new", game.id, game)
        except Exception as e:
            mylog.error(f"failed to startGameHotseat: {e}")
            await GameMan.sendError(ws, "a servor error occured failed to start game")

    @staticmethod
    async def startOnlineMatch(userId: int, username1: str, opponentId: int):
        mylog.debug(f"starting game: {userId} vs {opponentId}")
        username2 = await postgres.fetchUsername(opponentId)
        assert username1 is not None
        assert username2 is not None
        gameId = await GameMan.newOnlineGame(username1, username2, userId, opponentId)
        game = await myred.getCurrGameState(gameId, "online", None)
        assert game is not None
        await GameMan.sendGame(onlinePlayers[userId], "online", "new", gameId, game)
        await GameMan.sendGame(onlinePlayers[opponentId], "online", "new", gameId, game)

    @staticmethod
    async def newHotseatGame(username: str, userId: int)-> Game:
        mylog.debug(f"new hotseat game: {username}, {userId}")
        id = await myred.newGameId("hotseat", username)
        mylog.debug(f"new game id: {id}")
        game = Game(id, [chess.STARTING_FEN], [], [], None, None, "white", "black", userId, userId)
        await myred.addGame(game, "hotseat", username)
        await myred.addGamePosition(chess.STARTING_FEN, game.id, "hotseat", username)
        return game

    @staticmethod
    async def newOnlineGame(username1: str, username2: str, id1: int, id2: int)-> int:
        color: bool = random.choice([True, False])
        id = await myred.newGameId("online", None)
        if color:
            game = Game(id, [chess.STARTING_FEN], [], [], None, None, username1, username2, id1, id2)
        else:
            game = Game(id, [chess.STARTING_FEN], [], [], None, None, username2, username1, id2, id1)
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
    async def getActiveOnlineGames(username: str)-> list[GameWatch] :
        keys = await myred.getActiveOnlineGamesKeys(username.encode())
        games: list[GameWatch] = []
        for k in keys:
            game = await myred.getGameWatch(int(k))
            if game:
                games.append(game)
        return games


    @staticmethod
    async def handleGameMove(ws: WebSocket, mode: MODES, uciMove: str, gameData: Game, gameId: int, username: str)-> None | Game:
        try:
            mylog.debug(f"handleGameMove: {uciMove}")
            currFen = gameData.gameFens[len(gameData.gameFens) -1]
            # check validity
            board = chess.Board(currFen)
            move = chess.Move.from_uci(uciMove)
            piece = board.piece_at(move.from_square)
            if piece is None:
                mylog.debug("move is not valid")
                await GameMan.sendError(ws, "invalid move")
                return None
            mylog.debug(piece.piece_type)
            mylog.debug(piece.symbol())
            if board.is_legal(move):
                san = board.san(move)
                board.push(move)
                mylog.debug("adding new position and move")
                # await postgres.addNewPositionAndMove(gameId, mode, board.fen(), uciMove, san)
                await myred.addGamePosition(board.fen(), gameId, mode, username)
                await myred.addGameMove(GameMove(uciMove, san), gameId, mode, username)
                mylog.debug("added")
                gameData.gameFens.append(board.fen())
                gameData.gameMoves.append(GameMove(uci=uciMove, san=san))
                outcome = board.outcome()
                if outcome:
                    match outcome.winner:
                        case False:
                            gameData.winner = gameData.blackId
                        case True:
                            gameData.winner = gameData.whiteId
                        case None:
                            gameData.winner = 0
                return gameData
            else:
                mylog.debug("move is illegal")
                # temp make the return None
                return None
# if game ended store result and freeze row in db if valid message result
        except Exception as e:
            mylog.error(f"error at handleGameMove() {e}")
            await GameMan.sendError(ws, "Error failed to make move")
            return None

    @staticmethod
    async def updateGameAll(ws: WebSocket, userId: int, mode: MODES, game: Game, gameId: int):
        mylog.debug("updateGame")
        try:
            await GameMan.sendGame(ws, mode, "update", gameId, game)
            mylog.debug(f"sent update for game {gameId}")
            if mode == "online":
                opponentId = game.whiteId if userId == game.blackId else game.blackId
                assert opponentId is not None
                await GameMan.sendGame(onlinePlayers[opponentId], mode, "update", gameId, game)
                mylog.debug(f"sent update for game {gameId} to opponent")
            viewers = await myred.getGameViewers(gameId)
            mylog.debug(f"found game viewers: {viewers}")
            for id in viewers:
                try:
                    await GameMan.sendGame(onlinePlayers[id], mode, "update", gameId, game)
                except Exception as e:
                    mylog.error(f"failed to send game to viewer {id}: {postgres.fetchUsername(id)}")
        except Exception as e:
            mylog.error(f"failed to provide update for {mode} game for userId {userId}: {e}")
            await GameMan.sendError(ws, f"a servor error occured failed to update Game: {gameId}")

    @staticmethod
    async def updateGameOne(ws: WebSocket, userId: int, mode: MODES, game: Game, gameId: int):
        try:
            await GameMan.sendGame(ws, mode, "update", gameId, game)
            mylog.debug(f"sent update for game {gameId} for userId: {userId}")
        except Exception as e:
            mylog.error(f"failed to provide update for {mode} game for userId {userId}: {e}")
            await GameMan.sendError(ws, f"a servor error occured failed to update Game: {gameId}")

    @staticmethod
    async def getActiveGame(ws: WebSocket, username: str, mode: MODES, gameId: int)-> Game | None:
        game = await myred.getCurrGameState(gameId, mode, username)
        if game is None:
            await GameMan.sendError(ws, "a servor error occured: failed to find game data")
            return None
        return game
