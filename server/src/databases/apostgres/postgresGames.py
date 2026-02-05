from typing import Literal

from databases.apostgres.postgresUser import PostgresUser
from databases.game import Game, GameMove, decodeGameMoves, encodeGameMoves, gameMoveStr
from utils.const import MODES
from utils.logger import mylog

class PostgresGames(PostgresUser):
    def __init__(self) -> None:
        super().__init__()

    async def storeGameResult(self, mode: MODES, game: Game):
        await self.execCommit(f"insert into games (id, game_mode, white_id, black_id, white_username, black_username, fens, game_moves, winner) values(%s, %s, %s, %s, %s, %s, %s, %s, %s)", (game.id, mode, game.whiteId, game.blackId, game.whiteUsername, game.blackUsername, game.gameFens, await encodeGameMoves(game.gameMoves), game.winner))
