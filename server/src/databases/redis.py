from abc import ABC
from random import randint
import random
from chess import Literal
import chess
import redis.asyncio as redis
import asyncio

from databases.game import Game, GameMap, GameMove
from utils.const import Env
from utils.logger import mylog

# TODO
# Move over to GameCurr object and not send all moves and positions all the time back to the clients, but just the necessary change

class AMyRedis(ABC):
    def __init__(self):
        self.usersPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
        self.users = redis.Redis(connection_pool=self.usersPool)

        self.gamesPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=1, max_connections=20)
        self.games = redis.Redis(connection_pool=self.gamesPool)

    def gameKey(self, gameId: int):
        return f"game_{gameId}"

    def gameMoveKey(self, gameId: int):
        return f"game_move_{gameId}"

    def gamePositionKey(self, gameId: int):
        return f"game_move_{gameId}"

    def gameMoveStr(self, move: GameMove):
        return move.uci + "," + move.san

    def gameMapping(self, game: Game)-> GameMap:
        self.games.get(self.gameKey(game.id))
        return {
            "whiteUsername": game.whiteUsername,
            "blackUsername": game.blackUsername,
            "whiteTime": game.whiteTime,
            "blackTime": game.blackTime,
            "winner": game.winner
        }

    async def newGameId(self)-> int:
        cursor, keys = await self.games.scan()
        newId = randint(21489392, 82489392)
        while self.gameKey(newId) in keys:
            # also check that it is not inside postgres as finished games get stored in there
            newId = randint(123774, 823678)
        return newId

    async def getPlayerTurn(self, gameId: int, full: bool):
        lastFen = await self.games.lindex(self.gamePositionKey(gameId), -1)
        assert lastFen is not None
        i = lastFen.find(" ")
        playerTurn = lastFen[i+1]
        if full == False:
            return playerTurn
        return "white" if playerTurn == "w" else "black"

class MyRedis(AMyRedis):
    def __init__(self):
        super().__init__()
        self.lockAddGame = asyncio.Lock()

    async def addGame(self, game: Game):
        try:
            async with self.lockAddGame:
                name = self.gameKey(game.id)
                await self.games.hset(name, mapping=self.gameMapping(game))
                self.games.hexpire(name, 1200)
        except Exception as e:
            mylog.error(f"error adding online game {e}")

    async def newOnlineGame(self, username1: str, username2: str, id1: int, id2: int)-> int:
        color: bool = random.choice([True, False])
        id = await self.newGameId()
        game = Game(id, [chess.STARTING_FEN], [], "", username1, username2, id1, id2)
        game = Game(id, [chess.STARTING_FEN], [], "", username1, username2, id1, id2)
        await self.addGame(game)
        return id

    async def addOnlineGameMove(self, move: GameMove, gameId: int):
        try:
            async with self.lockAddGame:
                name = self.gameMoveKey(gameId)
                self.games.rpush(name, self.gameMoveStr(move))
                self.games.hexpire(name, 1200)
        except Exception as e:
            mylog.error(f"error adding game move {e}")

    async def addOnlineGamePosition(self, fen: str, gameId: int):
        try:
            self.games.rpush(self.gamePositionKey(gameId), fen)
        except Exception as e:
            mylog.error(f"error adding game position {e}")

    async def getGameMap(self, gameId: int) -> GameMap | None:
        try:
            data = await self.games.hgetall(self.gameKey(gameId))
 
            if not data:
                return None
 
            return GameMap(
                whiteUsername=data[b'whiteUsername'].decode('utf-8'), blackUsername=data[b'blackUsername'].decode('utf-8'),
                whiteTime=int(data[b'whiteTime']),
                blackTime=int(data[b'blackTime']),
                winner=data[b'winner'].decode('utf-8') if isinstance(data.get(b'winner', data.get('winner', b'')), bytes) else data.get('winner', ''))
        except Exception as e:
            mylog.error(f"error getting game map: {e}")
            return None

    async def getCurrGameState(self, gameId: int)-> Game | None:
        try:
            map: GameMap | None = await self.getGameMap(gameId)
            if map is None:
                return None
            return Game(gameId,
                await self.games.get(self.gamePositionKey(gameId)),
                await self.games.get(self.gameMoveKey(gameId)),
                map["winner"],
                map["whiteUsername"],
                map["blackUsername"],
                map["whiteTime"],
                map["blackTime"]
            )
        except Exception as e:
            mylog.error(f"failed to retrieve curr game state {e}")

    async def updateTime(self, gameId: int):
        try:
            playerTurn = await self.getPlayerTurn(gameId, True)
            self.games.hset(self.gameKey(gameId), playerTurn)
        except Exception as e:
            mylog.debug(f"Redis failed to update time: {e}")


myred = MyRedis()
