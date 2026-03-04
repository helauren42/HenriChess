from dataclasses import dataclass
from typing import TypedDict

@dataclass
class GameMove():
    uci: str
    san: str

def gameMoveStr(move: GameMove):
    return move.uci + "|" + move.san

async def decodeGameMoves(l: list[str | bytes]):
    r: list[GameMove] = []
    for i in range(len(l)):
        s = l[i]
        if isinstance(s, bytes):
            s = s.decode()
        assert isinstance(s, str)
        sp = s.split("|")
        r.append(GameMove(sp[0], sp[1]))
    return r

async def encodeGameMoves(l: list[GameMove]):
    r: list[str] = []
    for i in range(len(l)):
        s = gameMoveStr(l[i])
        r.append(s)
    return r

async def decodeGameTs(l: list[str | bytes]):
    r: list[list[float]] = []
    for i in range(len(l)):
        s = l[i]
        if isinstance(s, bytes):
            s = s.decode()
        assert isinstance(s, str)
        stamps = [float(x) for x in s.split("-")]
        r.append(stamps)
    return r

class GameMessage(TypedDict):
    username: str
    message: str

@dataclass
class Game():
    id: int
    gameFens: list[str]
    gameMoves: list[GameMove]
    gameMessages: list[GameMessage]
    gameTs: list[list[float]] # it's a list of nested list of size 3, 3 floats for whiteTime, blackTime and timestamp at start of position/fen
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

class GameSnip(TypedDict):
    id: int
    winnerName: str
    whiteUsername: str
    blackUsername: str
    moveCount: int
    date: int

class GameWatch(TypedDict):
    id: int
    whiteUsername: str
    blackUsername: str
    whiteId: int
    blackId: int
    fen: str

