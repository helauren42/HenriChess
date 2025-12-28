from typing import Literal
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from pydantic import BaseModel
from api.decorators import getUserId
from databases.postgres import postgres
from utils.logger import mylog
import chess

MESSAGE_TYPES = Literal["gameMove", "gameMessage", "startGameHotseat"]

class Message(BaseModel):
    type: MESSAGE_TYPES

class Square(BaseModel):
    rank: int
    file: str

class GameMove(Message):
    src: Square
    dest: Square

wsRouter = APIRouter(prefix="/ws")

async def handleGameMove(ws: WebSocket, data: GameMove):
    mylog.debug("handleGameMove")

async def startGameHotseat(ws: WebSocket, userId: int):
    mylog.debug("startGameHotseat")
    try:
        await postgres.newHotseatGame(userId)
    except Exception as e:
        mylog.error(f"failed to startGameHotseat {e}")
    await ws.send_json({
        "type": "error",
        "error": "a servor error occured faled to start game"
    })
    # check if game already in db and ask if user wants to start from scratch or continue playing

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
                    await handleGameMove(ws, GameMove(**msg))
                case "startGameHotseat":
                    await startGameHotseat(ws, userId)
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")

