import datetime
from typing import Optional
from databases.apostgres.postgresUser import PostgresUser
from databases.game import Game, GameSnip, decodeGameMoves, encodeGameMoves
from utils.const import MODES
from utils.logger import mylog

class PostgresGames(PostgresUser):
    def __init__(self) -> None:
        super().__init__()

    async def storeGameResult(self, mode: MODES, game: Game):
        await self.execCommit(f"insert into games (id, game_mode, white_id, black_id, white_username, black_username, fens, game_moves, winner, winner_name) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (game.id, mode, game.whiteId, game.blackId, game.whiteUsername, game.blackUsername, game.gameFens, await encodeGameMoves(game.gameMoves), game.winner, game.winnerName))

    async def getGameResult(self, gameId: int, userId: int) -> Game | None:
        row = await self.execFetchone( "SELECT id, fens, game_moves, winner_name, white_username, black_username, white_id, black_id FROM games WHERE id = %s", (gameId,))
        if row is None:
            return None

        (id, fens, moves, winnerName, whiteUsername, blackUsername, whiteId, blackId,) = row
        game_moves = await decodeGameMoves(moves)

        return Game(id=id, gameFens=fens, gameMoves=game_moves, winner=winnerName,
            winnerName=winnerName,
            whiteUsername=whiteUsername,
            blackUsername=blackUsername,
            whiteId=whiteId,
            blackId=blackId,
        )

    async def getGameSnip(self, gameId: int) -> GameSnip | None:
        row = await self.execFetchone( "SELECT winner_name, black_username, white_username, ARRAY_LENGTH(game_moves, 1), creation FROM games WHERE id=%s", (gameId,))
        if row is None:
            return None
        winnerName = row[0]
        creation = row[4]
        assert isinstance(creation, datetime.datetime)
        return GameSnip(id=gameId, winnerName=winnerName, blackUsername=row[1], whiteUsername=row[2], moveCount=row[3], date=int(creation.timestamp()))

    async def getFinishedGames(self, userId: Optional[int], username: Optional[str], mode: MODES) -> list[GameSnip]:
        assert userId is not None or username is not None
        if userId is None and username:
            userId = await self.fetchUserId(username)
        rows = await self.execFetchall("select id from games where game_mode=%s and (white_id=%s or black_id=%s) order by creation", (mode, userId, userId))
        ret: list[GameSnip] = []
        if rows is None:
            return ret
        for (gameId,) in rows:
            assert isinstance(gameId, int)
            game = await self.getGameSnip(gameId)
            if game:
                ret.append(game)
        return ret
