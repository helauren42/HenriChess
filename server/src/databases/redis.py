from abc import ABC
from random import randint
from typing import Optional
import redis.asyncio as redis
import asyncio

from databases.game import Game, GameMap, GameMove
from utils.const import MODES, Env, EXPIRY_TIME
from utils.logger import mylog

# TODO
# Move over to GameCurr object and not send all moves and positions all the time back to the clients, but just the necessary change

class AMyRedis(ABC):
    def __init__(self):
        self.usersPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
        self.users = redis.Redis(connection_pool=self.usersPool)

        self.gamePool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=1, max_connections=20)
        self.game = redis.Redis(connection_pool=self.gamePool)

    async def extendExpiry(self, name: str):
        self.game.expire(name, EXPIRY_TIME)

    def gameKey(self, gameId: int, mode: MODES, username: Optional[str] = None):
        if mode == "online":
             return str(gameId)
        return str(username) + ":" + str(gameId)

    async def findActiveHotseatGameId(self, username: str)-> None | int:
        asyncKeys = self.game.scan_iter(f"{username}:*", 1)
        async for k in asyncKeys:
            await self.extendExpiry(k)
            return int(k[len(username)+1:])
        return None

    def gameMoveKey(self, gameId: int):
        return f"game_move_{gameId}"

    def gamePositionKey(self, gameId: int):
        return f"game_position_{gameId}"

    def gameMoveStr(self, move: GameMove):
        return move.uci + "," + move.san

    async def newGameId(self, mode: MODES)-> int:
        cursor, keys = await self.game.scan()
        newId = randint(21489392, 82489392)
        while self.gameKey(newId, mode) in keys:
            # TODO also check that it is not inside postgres as finished games get stored in there
            newId = randint(123774, 823678)
        return newId

    async def getPlayerTurn(self, gameId: int, full: bool):
        lastFen = await self.game.lindex(self.gamePositionKey(gameId), -1)
        assert lastFen is not None
        i = lastFen.find(" ")
        playerTurn = lastFen[i+1]
        if full == False:
            return playerTurn
        return "white" if playerTurn == "w" else "black"

    async def gameMapping(self, game: Game, mode: MODES)-> GameMap:
        await self.game.get(self.gameKey(game.id, mode))
        return {
            "whiteUsername": game.whiteUsername,
            "blackUsername": game.blackUsername,
            "whiteId": game.whiteId,
            "blackId": game.blackId,
            "whiteTime": game.whiteTime,
            "blackTime": game.blackTime,
            "winner": game.winner
        }

    async def getGameMap(self, gameId: int, mode: MODES, username: str) -> GameMap | None:
        try:
            data = await self.game.hgetall(self.gameKey(gameId, mode, username))
            if not data:
                return None
            mylog.debug(f"get game map received data: {data}")
            return GameMap(
                winner=data[b'winner'].decode('utf-8'),
                whiteUsername=data[b'whiteUsername'].decode('utf-8'),
                blackUsername=data[b'blackUsername'].decode('utf-8'),
                whiteId=int(data[b'whiteId']),
                blackId=int(data[b'blackId']),
                whiteTime=int(data[b'whiteTime']),
                blackTime=int(data[b'blackTime'])
        )
        except Exception as e:
            mylog.error(f"error getting game map: {e}")
            return None

class MyRedis(AMyRedis):
    def __init__(self):
        super().__init__()
        self.lockAddGame = asyncio.Lock()

    async def addGame(self, game: Game, mode: MODES, username: Optional[str]):
        if mode == "hotseat" and username is None:
            raise ValueError("misuse of addGame function if mode is hotseat username must be defined")
        try:
            async with self.lockAddGame:
                mylog.debug(f"!!! lockAddGame")
                name = self.gameKey(gameId=game.id, mode=mode, username=username)
                mylog.debug(f"got key: {name}")
                await self.game.hset(name, mapping=await self.gameMapping(game, mode))
                await self.extendExpiry(name)
                mylog.debug(f"added game: {name}")
        except Exception as e:
            mylog.error(f"error adding online game {e}")

    async def addOnlineGameMove(self, move: GameMove, gameId: int):
        try:
            async with self.lockAddGame:
                name = self.gameMoveKey(gameId)
                await self.game.rpush(name, self.gameMoveStr(move))
                await self.extendExpiry(name)
        except Exception as e:
            mylog.error(f"error adding game move {e}")

    async def addGamePosition(self, fen: str, gameId: int, mode: MODES):
        try:
            if mode == "online":
                await self.game.rpush(self.gamePositionKey(gameId), fen)
            else:
                await self.game.rpush(self.gamePositionKey(gameId), fen)
        except Exception as e:
            mylog.error(f"error adding game position {e}")

    async def getUserHotseatGame(self, username: Optional[str] = None)-> Game | None:
        pass

    async def getCurrGameState(self, gameId: int, mode: MODES, username: Optional[str] = None)-> Game | None:
        if mode == "hotseat" and username is None:
            raise ValueError("misuse of getCurrGameState() if mode is hotseat, the username must be defined")
        try:
            map: GameMap | None = await self.getGameMap(gameId, mode, username)
            if map is None:
                return None
            return Game(gameId,
                await self.game.lrange(self.gamePositionKey(gameId), 0, -1),
                await self.game.lrange(self.gameMoveKey(gameId), 0, -1),
                map["winner"],
                map["whiteUsername"],
                map["blackUsername"],
                map["whiteId"],
                map["blackId"],
                map["whiteTime"],
                map["blackTime"]
            )
        except Exception as e:
            mylog.error(f"failed to retrieve curr game state {e}")

    async def updateTime(self, gameId: int, time: int):
        try:
            playerTurn = await self.getPlayerTurn(gameId, True)
            await self.game.hset(self.gameKey(gameId), playerTurn+"Time", str(time))
        except Exception as e:
            mylog.debug(f"Redis failed to update time: {e}")

myred = MyRedis()
