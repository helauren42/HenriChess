from typing import Literal, TypedDict

from psycopg.rows import TupleRow
from databases.apostgres import APostgres
from utils.logger import mylog

class GameMove(TypedDict):
    moveFrom: str
    moveTo: str
    piece: str
    capturedPiece: str | None
    promotionTo: str | None
    san: str

class Game(TypedDict):
    gameFens: list[str]
    gameMoves: list[GameMove]

class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def fetchGame(self, gameId: int, type: Literal['hotseat', 'online']) -> None | Game:
        # game positions
        fetched: list[TupleRow] | None = await self.execFetchall(f"select fen from {type}gamepositions where game_id=%s", values=(gameId,))
        if fetched is None:
            return None
        gameFens = [x[0] for x in fetched]
        mylog.debug(f"found game positions: {gameFens}")
        # game moves
        fetched: list[TupleRow] | None = await self.execFetchall(f"select move_from, move_to, piece, captured_piece, promotion_to, san from gamemoves where game_id=%s", values=(gameId,))
        mylog.debug(f"fetched Game Moves: {fetched}")
        if fetched is None:
            return Game(gameFens=gameFens, gameMoves=[])
        gameMoves: list[GameMove] = [GameMove(*x) for x in fetched]
        mylog.debug(f"Game Moves: {gameMoves}")
        return Game(gameFens=gameFens, gameMoves=gameMoves)

    async def fetchHotseatGame(self, userId: int | None = None, gameId: int | None = None) -> None | tuple[Game, int]:
        fetched = None
        if gameId is None and userId:
            fetched = await self.execFetchone(query="select id from hotseatgames where user_id=%s", values=(userId,))
            if fetched is None:
                return None
            gameId = int(fetched[0])
        assert gameId is not None
        game = await self.fetchGame(gameId, "hotseat")
        if game is None:
            return None
        return (game, gameId,)
 
    async def newHotseatGame(self, userId: int, gameId: int | None = None):
        if gameId:
            await self.execCommit(query="delete from hotseatgames where id=%s", values=(gameId,))
        await self.execCommit(query="insert into hotseatgames (user_id) values(%s) returning id", values=(userId,))
        fetched = await self.execFetchone(query="select id from hotseatgames where user_id=%s", values=(userId,))
        assert fetched is not None
        gameId = int(fetched[0])
        await self.execCommit(query="insert into hotseatgamepositions (position_number, game_id) values(%s, %s)", values=(1, gameId))
        mylog.debug("newHotseatGame success")

