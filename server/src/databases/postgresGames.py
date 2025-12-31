from typing import Literal, TypedDict

from psycopg.rows import TupleRow
from databases.apostgres import APostgres
from utils.logger import mylog

class GameMove(TypedDict):
    uci: str
    san: str

class Game(TypedDict):
    gameFens: list[str]
    gameMoves: list[GameMove]

class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def fetchNextPositionNum(self, gameId: int, mode: Literal["hotseat", "online"])-> int:
        fetched = await self.execFetchone(f"select max(position_number) from {mode}gamepositions where game_id=%s", (gameId,))
        if fetched is None:
            return 0
        return int(fetched[0]) +1

    async def fetchNextMoveNumber(self, gameId: int, mode: Literal["hotseat", "online"])-> int:
        fetched = await self.execFetchone(f"select max(move_number) from {mode}gamemoves where game_id=%s", (gameId,))
        if fetched is None or fetched[0] is None:
            return 0
        mylog.debug(f"fetched {fetched}")
        return int(fetched[0]) +1

    async def fetchGame(self, gameId: int, mode: Literal['hotseat', 'online']) -> None | Game:
        # game positions
        fetched: list[TupleRow] | None = await self.execFetchall(f"select fen from {mode}gamepositions where game_id=%s order by position_number asc", values=(gameId,))
        if fetched is None:
            return None
        gameFens = [x[0] for x in fetched]
        mylog.debug(f"found game positions: {gameFens}")
        # game moves
        fetched: list[TupleRow] | None = await self.execFetchall(f"select uci, san from {mode}gamemoves where game_id=%s order by move_number asc", values=(gameId,))
        mylog.debug(f"fetched Game Moves: {fetched}")
        if fetched is None:
            return Game(gameFens=gameFens, gameMoves=[])
        mylog.debug("there")
        gameMoves: list[GameMove] = []
        # = [GameMove(*x) for x in fetched]
        for move in fetched:
            if move is None or move[0] is None:
                continue
            gameMoves.append(GameMove(uci=move[0], san=move[0]))
        mylog.debug("there1")
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

    async def addNewPositionAndMove(self, gameId: int, mode: Literal["hotseat", "online"], fen: str, uciMove: str, san: str):
        moveNum = await self.fetchNextMoveNumber(gameId, mode)
        mylog.debug(f"moveNum: {moveNum}")
        positionNum = await self.fetchNextPositionNum(gameId, mode)
        async with self.getConn() as conn:
            async with conn.cursor() as cursor:
                try:
                    await self.exec(cursor=cursor, query=f"insert into {mode}gamemoves (move_number, game_id, uci, san) values(%s, %s, %s, %s)", values=(moveNum, gameId, uciMove, san,))
                    mylog.debug(f"insert into {mode}gamemoves successfull")
                    await self.exec(cursor=cursor, query=f"insert into {mode}gamepositions (position_number, fen, game_id) values(%s, %s, %s)", values=(positionNum, fen, gameId))
                    mylog.debug(f"insert into {mode}gamepositions successfull")
                    await conn.commit()
                except Exception as e:
                    await conn.rollback()
                    mylog.error(f"Db addNewPositionAndMove error: {e}")
                    raise Exception("db error")

