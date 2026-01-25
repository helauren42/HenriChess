from abc import ABC
import redis.asyncio as redis
import json

from utils.const import Env

class AMyRedis(ABC):
    def __init__(self):
        self.users_pool = redis.ConnectionPool(
            host=Env.REDIS_HOST,
            port=Env.REDIS_PORT,
            db=0,
            max_connections=20,
        )
        self.user = redis.Redis(connection_pool=self.users_pool)
        self.game_pool = redis.ConnectionPool(
            host=Env.REDIS_HOST,
            port=Env.REDIS_PORT,
            db=1,
            max_connections=20,
        )
        self.game = redis.Redis(connection_pool=self.users_pool)

    async def write(self, r: redis.Redis, key: str, value: str, ex: int | None = 600):
        await r.set(key, value, ex=ex)

    async def read(self, r: redis.Redis, key: str):
        return await r.get(key)

class MyRedis(AMyRedis):
    def __init__(self):
        super().__init__()
    async def addOnlineGame(self, whiteUsername: int, blackUsername: int, fen: str):
        self.game.lpushx("onlineGames", json.dumps({"whiteUsername": whiteUsername, "blackUsername": blackUsername, "fen": fen}))

myred = MyRedis()
