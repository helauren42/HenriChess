from contextlib import AbstractAsyncContextManager
from dataclasses import asdict
from typing import Literal
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
import chess
import random

from databases.game import GameMove, Game
from databases.postgres import postgres
from databases.redis import myred
from utils.api import getUserId
from utils.const import MODES, matchmakePool, onlinePlayers
from utils.logger import mylog
from manageGames.manageGames import GameMan

wsRouter = APIRouter(prefix="/ws")

def newGame(gameId: int, whiteId: int, blackId: int)-> Game:
    return Game(id=gameId, gameFens=[chess.STARTING_FEN], gameMoves=[], winner=None, winnerName=None, whiteUsername="white", blackUsername="black", whiteId=whiteId, blackId=blackId)

async def sendError(ws: WebSocket, msg: str):
    await ws.send_json({
        "type": "error",
        "error": msg
    })

async def sendGame(ws: WebSocket, mode: MODES, subtype: Literal["new", "continue", "update", "finish"], id: int, game: Game):
    mylog.debug(f"send game called: {asdict(game)}")
    await ws.send_json({
        "type": "game",
        "mode": mode,
        "subtype": subtype,
        "id": id,
        "game": asdict(game),
    })

async def sendGameExpired(ws: WebSocket, gameId: int):
    mylog.debug(f"sending game expired for gameId: {gameId}")
    await ws.send_json({
        "type": "gameExpired",
        "id": gameId
    })
    # TODO HANDLE CLIENT SIDE

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
            await sendError(ws, "invalid move")
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
        await sendError(ws, "Error failed to make move")
        return None

async def startGameHotseat(ws: WebSocket, userId: int, username: str, re: bool = False):
    mylog.debug(f"startGameHotseat: {username}")
    try:
        # res = await postgres.fetchHotseatGame(userId, None, True)
        gameId = await myred.findActiveHotseatGameId(username)
        mylog.debug(gameId)
        if gameId:
            game = await myred.getCurrGameState(gameId, "hotseat", username)
            assert game is not None
            if re:
                mylog.debug("deleteActiveGame")
                game = await GameMan.newHotseatGame(username, userId)
                # await postgres.deleteActiveGame("hotseat", gameId)
                await sendGame(ws, "hotseat", "continue", game.id, game)
            else:
                await sendGame(ws, "hotseat", "new", game.id, game)
        else:
            game = await GameMan.newHotseatGame(username, userId)
            await sendGame(ws, "hotseat", "new", game.id, game)
    except Exception as e:
        mylog.error(f"failed to startGameHotseat: {e}")
        await sendError(ws, "a servor error occured failed to start game")

async def updateGame(ws: WebSocket, userId: int, mode: MODES, game: Game, gameId: int):
    mylog.debug("updateGame")
    try:
        await sendGame(ws, mode, "update", gameId, game)
        mylog.debug(f"sent update for game {gameId}")
        if mode == "online":
            opponentId = game.whiteId if userId == game.blackId else game.blackId
            assert opponentId is not None
            await sendGame(onlinePlayers[opponentId], mode, "update", gameId, game)
            mylog.debug(f"sent update for game {gameId} to opponent")
    except Exception as e:
        mylog.error(f"failed to provide update for {mode} game for userId {userId}: {e}")
        await sendError(ws, "a servor error occured failed to get Game")

async def getActiveGame(ws: WebSocket, username: str, mode: MODES, gameId: int)-> Game | None:
    game = await myred.getCurrGameState(gameId, mode, username)
    if game is None:
        await sendError(ws, "a servor error occured: failed to find game data")
        return None
    return game

async def matchmakePoolAdd(ws: WebSocket, userId: int):
    matchmakePool.append(userId)
    mylog.info(f"matchmake pool user ids: {matchmakePool}")

async def matchmakePoolRemove(userId: int):
    if userId in matchmakePool:
        matchmakePool.remove(userId)
        mylog.info(f"matchmake pool user ids: {matchmakePool}")

async def findOpponent(userId: int)-> int:
    if len(matchmakePool) <= 1:
        return 0
    for playerId in matchmakePool:
        if playerId != userId:
            matchmakePool.remove(playerId)
            matchmakePool.remove(userId)
            return playerId
    return 0

async def startOnlineMatch(userId: int, username1: str, opponentId: int):
    mylog.debug(f"starting game: {userId} vs {opponentId}")
    username2 = await postgres.fetchUsername(opponentId)
    assert username1 is not None
    assert username2 is not None
    gameId = await GameMan.newOnlineGame(username1, username2, userId, opponentId)
    game = await myred.getCurrGameState(gameId, "online", None)
    assert game is not None
    # mylog.debug(f"!!! Found online game: {game}")
    # if game:
    await sendGame(onlinePlayers[userId], "online", "new", gameId, game)
    await sendGame(onlinePlayers[opponentId], "online", "new", gameId, game)

@wsRouter.websocket("")
async def websocketEndpoint(ws: WebSocket):
    try:
        userId = await getUserId(ws.cookies)
        username = await postgres.fetchUsername(userId)
        assert username is not None
    except:
        mylog.debug("refusing ws connection")
        return
    try:
        await ws.accept()
        onlinePlayers[userId] = ws
        mylog.debug(f"accepted new ws connection")
        while True:
            msg:dict = await ws.receive_json()
            mylog.debug(f"ws msg: {msg}")
            match msg["type"]:
                case "clientMove":
                    gameId = msg["gameId"]
                    gameData = await getActiveGame(ws, username, msg["mode"], gameId)
                    assert gameData is not None
                    updatedGame = await handleGameMove(ws, msg["mode"], msg["uciMove"], gameData, gameId, username) # update game object is returned if move was valid otherwise it returns None
                    if updatedGame:
                        await updateGame(ws, userId, msg["mode"], updatedGame, gameId)
                case "startGameHotseat":
                    await startGameHotseat(ws, userId, username)
                case "restartGameHotseat":
                    await startGameHotseat(ws, userId, username, True)
                case "getGameUpdate":
                    # res = await getFinishedGame(ws, userId, msg["mode"], msg["gameId"])
                    # await updateGame(ws, userId, msg["mode"], res[0], res[1])
                    game = await GameMan.getGame(msg["gameId"], msg["mode"], username, userId)
                    if game:
                        await updateGame(ws, userId, msg["mode"], game, game.id)
                    else:
                        await sendGameExpired(ws, msg["gameId"])
                case "resignGame":
                    game = await myred.getCurrGameState(msg["gameId"], msg["mode"], username)
                    assert game is not None
                    if game is None:
                        continue
                    game = await GameMan.resignGame(ws, userId, msg["mode"], game, username)
                    mylog.debug(f"should be a resigned game: {game.winner}\n{game}")
                    await updateGame(ws, userId, msg["mode"], game, game.id)
                case "startMatchmaking":
                    await matchmakePoolAdd(ws, userId)
                    mylog.debug("startMatchmaking")
                    opponentId = await findOpponent(userId)
                    mylog.debug(f"found opponent? {opponentId}")
                    if opponentId:
                        await startOnlineMatch(userId, username, opponentId)
                case "endMatchmaking":
                    await matchmakePoolRemove(userId)
                    mylog.debug("endMatchmaking")
                # WATCH
                case "getActiveGames":
                    mylog.debug("getActiveGames")
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")
    finally:
        await matchmakePoolRemove(userId)
        if userId in onlinePlayers:
            onlinePlayers.pop(userId)

