from dataclasses import dataclass
import string
from typing import Literal, Optional, TypedDict

from utils.logger import mylog

@dataclass
class GameMove():
    uci: str
    san: str

def gameMoveStr(move: GameMove):
    return move.uci + "|" + move.san

async def decodeGameMoves(l: list[bytes]):
    r: list[GameMove] = []
    for i in range(len(l)):
        sp = l[i].decode().split("|")
        r.append(GameMove(sp[0], sp[1]))
    return r

async def encodeGameMoves(l: list[GameMove]):
    r: list[str] = []
    for i in range(len(l)):
        s = gameMoveStr(l[i])
        r.append(s)
    return r

@dataclass
class Game():
    id: int
    gameFens: list[str]
    gameMoves: list[GameMove]
    winner: int | None # none is stored as -1 inside redis
    winnerName: str | None
    whiteUsername: str
    blackUsername: str
    whiteId: int
    blackId: int
    whiteTime: int = 30000 # 0.01 secs
    blackTime: int = 30000


class GameMap(TypedDict):
    winner: int
    whiteUsername: str
    blackUsername: str
    whiteId: int
    blackId: int
    whiteTime: int
    blackTime: int

