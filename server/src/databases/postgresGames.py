from typing import Literal, Tuple

from psycopg.rows import TupleRow
from databases.apostgres import APostgres
from utils.logger import mylog

class Game():
    def __init__(self, gamePositions: list[str]) -> None:
        self.gamePositions: list[str] = gamePositions


class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def fetchGame(self, gameId: int, type: Literal['hotseat', 'online']) -> None | Game:
        fetched: list[TupleRow] | None = await self.execFetchall(f"select fen from {type}gamepositions where game_id=%s", values=(gameId,))
        if fetched is None:
            return None
        gamePositions = [x[0] for x in fetched]
        mylog.debug(f"found game positions: {gamePositions}")
        mylog.debug(f"found game positions fetched: {fetched}")

    async def fetchHotseatGame(self, userId: int | None = None, gameId: int | None = None) -> None | Game:
        fetched = None
        if gameId is None and userId:
            fetched = await self.execFetchone(query="select id from hotseatgames where user_id=%s", values=(userId,))
            if fetched is None:
                return None
            gameId = int(fetched[0])
        assert gameId is not None
        return await self.fetchGame(gameId)
 
    async def newHotseatGame(self, userId: int, gameId: int | None = None):
        if gameId:
            await self.execCommit(query="delete from hotseatgames where id=%s", values=(gameId,))
            # reinit hotseat game
            # await self.execCommit(query="update hotseatgames set hotseatgames=%s where id=%s", values=("somedefaultstringvalue", userId))
        await self.execCommit(query="insert into hotseatgames (user_id) values(%s) returning id", values=(userId,))
        fetched = await self.execFetchone(query="select id from hotseatgames where user_id=%s", values=(userId,))
        assert fetched is not None
        gameId = int(fetched[0])
        await self.execCommit(query="insert into hotseatgamepositions (position_number, game_id) values(%s, %s)", values=(1, gameId))
        mylog.debug("newHotseatGame success")

