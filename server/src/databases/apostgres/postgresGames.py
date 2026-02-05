from databases.apostgres.postgresUser import PostgresUser
from databases.game import Game, decodeGameMoves, encodeGameMoves
from utils.const import MODES
from utils.game import getWinnerNameId

class PostgresGames(PostgresUser):
    def __init__(self) -> None:
        super().__init__()

    async def storeGameResult(self, mode: MODES, game: Game):
        await self.execCommit(f"insert into games (id, game_mode, white_id, black_id, white_username, black_username, fens, game_moves, winner) values(%s, %s, %s, %s, %s, %s, %s, %s, %s)", (game.id, mode, game.whiteId, game.blackId, game.whiteUsername, game.blackUsername, game.gameFens, await encodeGameMoves(game.gameMoves), game.winner))

    async def getGameResult(self, gameId: int, userId: int) -> Game | None:
        row = await self.execFetchone( """ SELECT id, fens, game_moves, winner, white_username, black_username, white_id, black_id FROM games WHERE id = %s """, (gameId,))
        if row is None:
            return None

        (id, fens, moves, winner, whiteUsername, blackUsername, whiteId, blackId,) = row
        game_moves = await decodeGameMoves(moves)

        return Game(id=id, gameFens=fens, gameMoves=game_moves, winner=winner,
            winnerName=await getWinnerNameId(winner, blackId, whiteId, blackUsername, whiteUsername),
            whiteUsername=whiteUsername,
            blackUsername=blackUsername,
            whiteId=whiteId,
            blackId=blackId,
        )
