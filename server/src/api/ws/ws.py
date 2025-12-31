from typing import Literal, Type, TypedDict
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from databases.postgres import postgres
from databases.postgresGames import Game
from utils.api import getUserId
from utils.logger import mylog
import chess

MESSAGE_TYPES = Literal["clientMove", "gameMessage", "startGameHotseat"]

wsRouter = APIRouter(prefix="/ws")

def newGame()-> Game:
    return Game(gameFens=['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'], gameMoves=[])

async def sendError(ws: WebSocket, msg: str):
    await ws.send_json({
        "type": "error",
        "error": msg
    })

async def sendGame(ws: WebSocket, mode: Literal["hotseat", "online"], subtype: Literal["new", "continue", "update"], id: int, game: Game):
    await ws.send_json({
        "type": "game",
        "mode": mode,
        "subtype": subtype,
        "id": id
    })

async def handleGameMove(ws: WebSocket, userId: int, uciMove: str):
    try:
        mylog.debug(f"handleGameMove: {uciMove}")
        res = await postgres.fetchHotseatGame(userId)
        mylog.debug(f"fetchHotseatGame: {res}")
        if res is None:
            return await sendError(ws, "a servor error occured: failed to find game data")
        gameData, gameId = res
        currFen = gameData["gameFens"][len(gameData["gameFens"]) -1]
        # check validity
        board = chess.Board(currFen)
        move = chess.Move.from_uci(uciMove)
        piece = board.piece_at(move.from_square)
        if piece is None:
            mylog.debug("move is not valid")
            await sendError(ws, "invalid move")
            return
        mylog.debug(piece.piece_type)
        mylog.debug(piece.symbol())
        if board.is_legal(move):
            san = board.san(move)
            board.push(move)
            await postgres.addNewPositionAndMove(gameId, "hotseat", board.fen(), uciMove, san)
            # store move and new position if successfull message new state
        else:
            mylog.debug("move is illegal")
# if game ended store result and freeze row in db if valid message result
    except Exception as e:
        mylog.error(f"error at handleGameMove() {e}")
        await sendError(ws, "Error failed to make move")

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
                    await handleGameMove(ws, userId, msg["uciMove"])
                case "startGameHotseat":
                    await startGameHotseat(ws, userId)
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")

