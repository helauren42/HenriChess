from typing import Literal
from fastapi.websockets import WebSocket, WebSocketDisconnect
from fastapi import APIRouter
from pydantic import BaseModel
from api.decorators import getUserId
from utils.logger import mylog
import chess

MESSAGE_TYPES = Literal["gameMove", "gameMessage"]

class Message(BaseModel):
    type: MESSAGE_TYPES

class Square(BaseModel):
    rank: int
    file: str

class GameMove(Message):
    src: Square
    dest: Square

wsRouter = APIRouter(prefix="/ws")

async def handleGameMove(data: GameMove):
    chess.Move
    mylog.debug("handleGameMove")

@wsRouter.websocket("")
async def websocketEndpoint(ws: WebSocket):
    await getUserId(ws.cookies)
    await ws.accept()
    mylog.debug(f"accepted new ws connection")
    try:
        while True:
            msg:dict = await ws.receive_json()
            match msg["type"]:
                case "gameMove":
                    await handleGameMove(GameMove(**msg))
            mylog.debug(f"type msg: {type(msg)}")
    except WebSocketDisconnect:
        mylog.debug(f"websocket disconnected normally")
    except Exception as e:
        mylog.debug(f"websocket connection failed: {e}")

