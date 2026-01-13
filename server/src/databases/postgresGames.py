from typing import Literal, TypedDict

from psycopg.rows import TupleRow
from databases.apostgres import APostgres
from utils.const import MODES
from utils.logger import mylog

class GameMove(TypedDict):
    uci: str
    san: str

class Game(TypedDict):
    gameFens: list[str]
    gameMoves: list[GameMove]
    winner: Literal["w", "b", "d"] | None
    whiteUsername: str
    blackUsername: str
    id: int

class PostgresGames(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def fetchNextPositionNum(self, gameId: int, mode: MODES)-> int:
        fetched = await self.execFetchone(f"select max(position_number) from {mode}gamepositions where game_id=%s", (gameId,))
        if fetched is None:
            return 0
        return int(fetched[0]) +1

    async def fetchNextMoveNumber(self, gameId: int, mode: MODES)-> int:
        fetched = await self.execFetchone(f"select max(move_number) from {mode}gamemoves where game_id=%s", (gameId,))
        if fetched is None or fetched[0] is None:
            return 0
        mylog.debug(f"fetched {fetched}")
        return int(fetched[0]) +1

    async def fetchGame(self, gameId: int, mode: MODES) -> None | Game:
        whiteUsername: str = "white"
        blackUsername: str = "black"
        # game result and players
        if mode == "hotseat":
            temp: TupleRow | None = await self.execFetchone(f"select winner from hotseatgames where id=%s", values=(gameId,))
            if temp is None:
                return None
            fetchedWinner = temp[0]
        else:
            temp: TupleRow | None = await self.execFetchone(f"select white_id, black_id, winner from onlinegames where id=%s", values=(gameId,))
            if temp is None:
                return None
            whiteUsername = temp[0]
            blackUsername = temp[1]
            fetchedWinner = temp[2]
        # game positions
        fetched: list[TupleRow] | None = await self.execFetchall(f"select fen from {mode}gamepositions where game_id=%s order by position_number asc", values=(gameId,))
        if fetched is None:
            return None
        gameFens = [x[0] for x in fetched]
        # game moves
        fetched: list[TupleRow] | None = await self.execFetchall(f"select uci, san from {mode}gamemoves where game_id=%s order by move_number asc", values=(gameId,))
        # mylog.debug(f"fetched Game Moves: {fetched}")
        if fetched is None:
            return Game(gameFens=gameFens, gameMoves=[], winner=fetchedWinner[0] if fetchedWinner else None, whiteUsername=whiteUsername, blackUsername=blackUsername, id=gameId)
        gameMoves: list[GameMove] = []
        # = [GameMove(*x) for x in fetched]
        for move in fetched:
            if move is None or move[0] is None:
                continue
            gameMoves.append(GameMove(uci=move[0], san=move[0]))
        return Game(gameFens=gameFens, gameMoves=gameMoves, winner=fetchedWinner[0] if fetchedWinner else None, whiteUsername=whiteUsername, blackUsername=blackUsername, id=gameId)

    async def fetchHotseatGame(self, userId: int | None = None, gameId: int | None = None, active: bool = False) -> None | tuple[Game, int]:
        fetched = None
        if gameId is None and userId:
            fetched = await self.execFetchone(query=f"select id from hotseatgames where user_id=%s {'and winner is null' if active else ''}", values=(userId,))
            if fetched is None:
                return None
            gameId = int(fetched[0])
        assert gameId is not None
        game = await self.fetchGame(gameId, "hotseat")
        if game is None:
            return None
        return (game, gameId,)
 
    async def newHotseatGame(self, userId: int) -> int:
        # remove unfinished active hotseatgame
        await self.execCommit(query="delete from hotseatgames where user_id=%s and winner is null", values=(userId,))
        # add new game
        gameId = await self.execCommit(query="insert into hotseatgames (user_id) values(%s) returning id", values=(userId,), getReturn=True)
        mylog.debug(f"type: {gameId}")
        assert isinstance(gameId, int)
        await self.execCommit(query="insert into hotseatgamepositions (position_number, game_id) values(%s, %s)", values=(1, gameId))
        mylog.debug("newHotseatGame success")
        return gameId

    async def newOnlineGame(self, whiteId: int, blackId: int) -> int:
        mylog.debug("newOnlineGame")
        gameId = await self.execCommit(query="insert into onlinegames (white_id, black_id) values(%s, %s) returning id", values=(whiteId, blackId,), getReturn=True)
        mylog.debug(f"newOnlineGame gameId: {gameId}")
        assert isinstance(gameId, int)
        await self.execCommit(query="insert into onlinegamepositions (position_number, game_id) values(%s, %s)", values=(1, gameId))
        mylog.debug("newOnlineGame success")
        return gameId

    async def addNewPositionAndMove(self, gameId: int, mode: MODES, fen: str, uciMove: str, san: str):
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

    async def storeGameResult(self, mode: MODES, gameId: int, winner: Literal["w", "b", "d"]):
        await self.execCommit(f"update {mode}games set winner=%s where id=%s", (winner, gameId ))

    async def deleteActiveGame(self, mode: MODES, gameId: int):
        await self.execCommit(f"delete from {mode}games where id=%s", values=(gameId, ))
