from typing import Optional

from databases.game import Game, GameMap

@staticmethod
async def getWinnerName(game: Optional[Game], map: Optional[GameMap])-> str | None:
    assert not (game is None and map is None)
    if game:
        if game.winner is None:
            return None
        if game.whiteId == game.winner:
            return game.whiteUsername
        if game.blackId == game.winner:
            return game.blackUsername
    elif map:
        if map["winner"] == -1:
            return None
        if map["whiteId"] == map["winner"]:
            return map["whiteUsername"]
        if map["blackId"] == map["winner"]:
            return map["blackUsername"]

async def getWinnerNameId(winnerId: int | None, blackId: int, whiteId: int, blackUsername: str, whiteUsername: str)-> str | None:
    if winnerId is None:
        return None
    if winnerId == blackId:
        return blackUsername
    return whiteUsername
