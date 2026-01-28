from dataclasses import dataclass
from typing import Literal, TypedDict

@dataclass
class GameMove():
    uci: str
    san: str

# @dataclass
# class GameCurr:
#     id: int
#     fen: str
#     last_move: GameMove
#     whiteUsername: str
#     blackUsername: str
#     whiteTime: int
#     blackTime: int
#     winner: Literal["w", "b", "d", ""]
#     def toDict(self) -> dict[str, Any]:
#         """Convert this GameCurr to a dict with nested last_move."""
#         data = asdict(self)
#         data["last_move"] = asdict(self.last_move)
#         return data

@dataclass
class Game():
    id: int
    gameFens: list[str]
    gameMoves: list[GameMove]
    winner: Literal["w", "b", "d", ""]
    whiteUsername: str
    blackUsername: str
    whiteId: int
    blackId: int
    whiteTime: int = 30000 # 0.01 secs
    blackTime: int = 30000

class GameMap(TypedDict):
    winner: Literal["w", "b", "d", ""]
    whiteUsername: str
    blackUsername: str
    whiteId: int
    blackId: int
    whiteTime: int
    blackTime: int

