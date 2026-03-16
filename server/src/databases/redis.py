import redis.asyncio as redis
import asyncio

from databases.aredis.redisAuth import RedisAuth
from utils.const import Env

class Redis(RedisAuth):
    def __init__(self) -> None:
        super().__init__()
        self.activitiesPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
        self.activities = redis.Redis(connection_pool=self.activitiesPool)

    def socialPageKey(self)-> str:
        return 'social_page'

    async def onSocialPage(self, userId: int):
        self.activities.rpush(self.socialPageKey(), str(userId))

    async def offSocialPage(self, userId: int):
        self.activities.lrem(self.socialPageKey(), 0, str(userId))

    async def getGameViewers(self, gameId: int)->list[int]:
        keys: list[bytes] = await self.activities.lrange(self.socialPageKey(), 0, -1)
        ret: list[int] = []
        for i in range(len(keys)):
            k = keys[i].decode()
            isinstance(k, str)
            ret.append(int(k))
        return ret

myred = Redis()
