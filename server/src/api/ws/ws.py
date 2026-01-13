from typing import Literal, Type, TypedDict
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from databases.postgres import postgres
from databases.postgresGames import Game, GameMove
from utils.api import getUserId
from utils.const import MODES, matchmakePool, onlinePlayers
from utils.logger import mylog
import chess
import random

wsRouter = APIRouter(prefix="/ws")

def newGame(gameId: int)-> Game:
    return Game(gameFens=['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'], gameMoves=[], winner=None, whiteUsername="white", blackUsername="black", id=gameId)

async def sendError(ws: WebSocket, msg: str):
    await ws.send_json({
        "type": "error",
        "error": msg
    })

async def sendGame(ws: WebSocket, mode: MODES, subtype: Literal["new", "continue", "update", "finish"], id: int, game: Game):
    await ws.send_json({
        "type": "game",
        "mode": mode,
        "subtype": subtype,
        "id": id,
        "game": game,
    })

async def handleGameMove(ws: WebSocket, userId: int, uciMove: str, gameData: Game, gameId: int)-> None | Game:
    try:
        mylog.debug(f"handleGameMove: {uciMove}")
        currFen = gameData["gameFens"][len(gameData["gameFens"]) -1]
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
            await postgres.addNewPositionAndMove(gameId, "hotseat", board.fen(), uciMove, san)
            gameData["gameFens"].append(board.fen())
            gameData["gameMoves"].append(GameMove(uci=uciMove, san=san))
            outcome = board.outcome()
            if outcome:
                match outcome.winner:
                    case False:
                        gameData["winner"] = "b"
                    case True:
                        gameData["winner"] = "w"
                    case None:
                        gameData["winner"] = "d"
                await postgres.storeGameResult("hotseat", gameId, gameData["winner"])
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

async def startGameHotseat(ws: WebSocket, userId: int, re: bool = False):
    mylog.debug("startGameHotseat")
    try:
        res = await postgres.fetchHotseatGame(userId, None, True)
        if re and res is not None:
            mylog.debug("deleteActiveGame")
            game, gameId = res
            await postgres.deleteActiveGame("hotseat", gameId)
            res = None
        mylog.debug(f"res: {res}")
        if res is None:
            gameId = await postgres.newHotseatGame(userId)
            # await ws.send_json({ "type": "game", "mode": "hotseat" , "subtype": "new", "game": newGame() })
            await sendGame(ws, "hotseat", "new", gameId, newGame(gameId))
        else:
            hotseatGame, gameId = res
            # mylog.debug(f"found active hotseat game?: {hotseatGame}")
            # await ws.send_json({"type": "game", "mode": "hotseat", "subtype": "continue", "game": hotseatGame, "id": gameId})
            await sendGame(ws, "hotseat", "continue", gameId, hotseatGame)
    except Exception as e:
        mylog.error(f"failed to startGameHotseat: {e}")
        await sendError(ws, "a servor error occured failed to start game")

async def updateGame(ws: WebSocket, userId: int, mode: MODES, game: Game, gameId: int):
    mylog.debug("updateGame")
    try:
        # await ws.send_json({"type": "game", "mode": mode, "subtype": "update", "game": game, "id": gameId})
        await sendGame(ws, mode, "update", gameId, game)
        mylog.debug(f"sent update for game {gameId}")
    except Exception as e:
        mylog.error(f"failed to provide update for {mode} game for userId {userId}: {e}")
        await sendError(ws, "a servor error occured failed to get Game")

async def getGame(ws: WebSocket, userId: int, mode: MODES, gameId: int)-> None | tuple[Game, int]:
    # res = None
    # if mode == "hotseat":
    #     res = await postgres.fetchHotseatGame(userId)
    game = await postgres.fetchGame(gameId, mode)
    # mylog.debug(f"fetchHotseatGame: {res}")
    if game is None:
        await sendError(ws, "a servor error occured: failed to find game data")
        return None
    return game, gameId

async def resignGame(ws: WebSocket, userId: int, mode: MODES, gameId: int, resignerColor: Literal["w", "b"]):
    winner: Literal["w", "b"] = "b" if resignerColor == "w" else "w"
    await postgres.storeGameResult(mode, gameId, winner)

async def matchmakePoolAdd(ws: WebSocket, userId: int):
    matchmakePool.append(userId)
    mylog.info(f"active users user ids: {matchmakePool}")

async def matchmakePoolRemove(userId: int):
    if userId in matchmakePool:
        matchmakePool.remove(userId)
        mylog.info(f"active users user ids: {matchmakePool}")

async def findOpponent(userId: int)-> int:
    if len(matchmakePool) <= 1:
        return 0
    for playerId in matchmakePool:
        if playerId != userId:
            matchmakePool.remove(playerId)
            matchmakePool.remove(userId)
            return playerId
    return 0

async def startOnlineMatch(userId: int, opponentId: int):
    color: bool = random.choice([True, False])
    if color:
        gameId = await postgres.newOnlineGame(userId, opponentId)
    else:
        gameId = await postgres.newOnlineGame(opponentId, userId)
    game = await postgres.fetchGame(gameId, "online")
    mylog.debug(f"!!! Found online game: {game}")
    if game:
        # await updateGame(onlinePlayers[userId], userId, "online", game, gameId)
        await sendGame(onlinePlayers[userId], "online", "new", gameId, game)
        # await updateGame(onlinePlayers[opponentId], opponentId, "online", game, gameId)
        await sendGame(onlinePlayers[opponentId], "online", "new", gameId, game)

@wsRouter.websocket("")
async def websocketEndpoint(ws: WebSocket):
    try:
        userId = await getUserId(ws.cookies)
    except:
        mylog.debug("refusing ws connection")
        return
    try:
        await ws.accept()
        onlinePlayers[userId] = ws
        mylog.debug(f"accepted new ws connection")
        while True:
            msg:dict = await ws.receive_json()
            mylog.debug(f"msg type: {msg}")
            match msg["type"]:
                case "clientMove":
                    res = await getGame(ws, userId, msg["mode"], msg["gameId"])
                    if res is None:
                        break
                    gameData, gameId = res
                    updatedGame = await handleGameMove(ws, userId, msg["uciMove"], gameData, gameId) # update game object is returned if move was valid otherwise it returns None
                    if updatedGame:
                        await updateGame(ws, userId, msg["mode"], updatedGame, gameId)
                case "startGameHotseat":
                    await startGameHotseat(ws, userId)
                case "restartGameHotseat":
                    await startGameHotseat(ws, userId, True)
                case "getGameUpdate":
                    res = await getGame(ws, userId, msg["mode"], msg["gameId"])
                    if res is None:
                        break
                    await updateGame(ws, userId, msg["mode"], res[0], res[1])
                case "resignGame":
                    await resignGame(ws, userId, msg["mode"], msg["gameId"], msg["playerColor"])
                    res = await getGame(ws, userId, msg["mode"], msg["gameId"])
                    if res is None:
                        break
                    await updateGame(ws, userId, msg["mode"], res[0], res[1])
                case "startMatchmaking":
                    await matchmakePoolAdd(ws, userId)
                    mylog.debug("startMatchmaking")
                    opponentId = await findOpponent(userId)
                    if opponentId:
                        await startOnlineMatch(userId, opponentId)
                case "endMatchmaking":
                    await matchmakePoolRemove(userId)
                    mylog.debug("endMatchmaking")
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")
    finally:
        await matchmakePoolRemove(userId)
        if userId in onlinePlayers:
            onlinePlayers.pop(userId)

