from typing import Literal
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from pydantic import BaseModel
from api.decorators import getUserId
from databases.postgres import postgres
from databases.postgresGames import Game
from utils.logger import mylog
import chess
import json

MESSAGE_TYPES = Literal["gameMove", "gameMessage", "startGameHotseat"]

class Message(BaseModel):
    type: MESSAGE_TYPES

class Square(BaseModel):
    rank: int
    file: str

class ClientMove(Message):
    src: Square
    dest: Square

wsRouter = APIRouter(prefix="/ws")

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

async def handleGameMove(ws: WebSocket, data: ClientMove):
    mylog.debug("handleGameMove")

async def startGameHotseat(ws: WebSocket, userId: int):
    mylog.debug("startGameHotseat")
    try:
        res = await postgres.fetchHotseatGame(userId)
        if res is None:
            await postgres.newHotseatGame(userId)
            await ws.send_json({ "type": "game", "mode": "hotseat" , "subtype": "new" })
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
                case "gameMove":
                    await handleGameMove(ws, ClientMove(**msg))
                case "startGameHotseat":
                    await startGameHotseat(ws, userId)
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")

