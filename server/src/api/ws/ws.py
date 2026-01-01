from typing import Literal, Type, TypedDict
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from databases.postgres import postgres
from databases.postgresGames import Game
from utils.api import getUserId
from utils.const import MODES
from utils.logger import mylog
import chess

wsRouter = APIRouter(prefix="/ws")

def newGame()-> Game:
    return Game(gameFens=['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'], gameMoves=[])

async def sendError(ws: WebSocket, msg: str):
    await ws.send_json({
        "type": "error",
        "error": msg
    })

async def sendGame(ws: WebSocket, mode: MODES, subtype: Literal["new", "continue", "update"], id: int, game: Game):
    await ws.send_json({
        "type": "game",
        "mode": mode,
        "subtype": subtype,
        "id": id
    })

async def handleGameMove(ws: WebSocket, userId: int, uciMove: str)-> bool:
    try:
        mylog.debug(f"handleGameMove: {uciMove}")
        res = await postgres.fetchHotseatGame(userId)
        mylog.debug(f"fetchHotseatGame: {res}")
        if res is None:
            await sendError(ws, "a servor error occured: failed to find game data")
            return False
        gameData, gameId = res
        currFen = gameData["gameFens"][len(gameData["gameFens"]) -1]
        # check validity
        board = chess.Board(currFen)
        move = chess.Move.from_uci(uciMove)
        piece = board.piece_at(move.from_square)
        if piece is None:
            mylog.debug("move is not valid")
            await sendError(ws, "invalid move")
            return False
        mylog.debug(piece.piece_type)
        mylog.debug(piece.symbol())
        if board.is_legal(move):
            san = board.san(move)
            board.push(move)
            await postgres.addNewPositionAndMove(gameId, "hotseat", board.fen(), uciMove, san)
            return True
            # store move and new position if successfull message new state
        else:
            mylog.debug("move is illegal")
            return False
# if game ended store result and freeze row in db if valid message result
    except Exception as e:
        mylog.error(f"error at handleGameMove() {e}")
        await sendError(ws, "Error failed to make move")
        return False

async def startGameHotseat(ws: WebSocket, userId: int):
    mylog.debug("startGameHotseat")
    try:
        res = await postgres.fetchHotseatGame(userId)
        if res is None:
            await postgres.newHotseatGame(userId)
            await ws.send_json({ "type": "game", "mode": "hotseat" , "subtype": "new", "game": newGame() })
        else:
            hotseatGame, gameId = res
            mylog.debug(f"found active hotseat game?: {hotseatGame}")
            await ws.send_json({"type": "game", "mode": "hotseat", "subtype": "continue", "game": hotseatGame, "id": gameId})
    except Exception as e:
        mylog.error(f"failed to startGameHotseat {e}")
        await sendError(ws, "a servor error occured failed to start game")

async def updateGame(ws: WebSocket, userId: int, mode: MODES):
    mylog.debug("updateGame")
    try:
        if mode == "hotseat":
            res = await postgres.fetchHotseatGame(userId)
        else:
            # TODO
            res = None
        if res is None:
            return await sendError(ws, "Game does not exist")
        else:
            game, gameId = res
            mylog.debug(f"found active {mode} game?: {game}")
            await ws.send_json({"type": "game", "mode": "hotseat", "subtype": "update", "game": game, "id": gameId})
            mylog.debug(f"sent update for game {gameId}")
    except Exception as e:
        mylog.error(f"failed to provide update for {mode} game for userId {userId}: {e}")
        await sendError(ws, "a servor error occured failed to get Game")

@wsRouter.websocket("")
async def websocketEndpoint(ws: WebSocket):
    userId = await getUserId(ws.cookies)
    await ws.accept()
    mylog.debug(f"accepted new ws connection")
    try:
        while True:
            msg:dict = await ws.receive_json()
            mylog.debug(f"msg type: {msg}")
            match msg["type"]:
                case "clientMove":
                    if await handleGameMove(ws, userId, msg["uciMove"]):
                        await updateGame(ws, userId, msg["mode"])
                case "startGameHotseat":
                    await startGameHotseat(ws, userId)
                case "getGameUpdate":
                    await updateGame(ws, userId, msg["mode"])
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")

