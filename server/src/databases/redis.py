import re
import redis.asyncio as redis
import asyncio

from redis.typing import ResponseT

from databases.aredis.redisAuth import RedisAuth
from utils.const import Env

class Redis(RedisAuth):
    def __init__(self) -> None:
        super().__init__()
        self.activitiesPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=10)
        self.activities = redis.Redis(connection_pool=self.activitiesPool)
        self.challengesPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=5)
        self.challenges = redis.Redis(connection_pool=self.challengesPool)
        self.challengesLock = asyncio.Lock()

    # SOCIAL PAGE

    def socialPageKey(self)-> str:
        return 'social_page'

    async def onSocialPage(self, userId: int):
        await self.activities.rpush(self.socialPageKey(), str(userId))

    async def offSocialPage(self, userId: int):
        await self.activities.lrem(self.socialPageKey(), 0, str(userId))

    async def getSocializingPlayers(self)->list[int]:
        keys: list[bytes] = await self.activities.lrange(self.socialPageKey(), 0, -1)
        ret: list[int] = []
        for i in range(len(keys)):
            k = keys[i].decode()
            isinstance(k, str)
            ret.append(int(k))
        return ret

    # CHALLENGES
 
    def challengeKey(self, challengeId: int | ResponseT):
        return "challenge:" + str(challengeId)

    async def addChallenge(self, challengerId: int, opponentId: int):
        async with self.challengesLock:
            challengeId = self.challenges.incr("challenge:id")
            challengeKey = self.challengeKey(challengeId)
            self.challenges.hset(challengeKey, mapping={"challenger": challenger, "opponent": opponent})
            # expires in 15 seconds
            self.challenges.expire(challengeKey, 15)

    async def getChallenge(self, challengeId: int)-> None | tuple[str, str]:
        challengeKey = self.challengeKey(challengeId)
        map: dict = await self.challenges.hgetall(challengeKey)
        if len(map) == 0:
            return None
        challenger = map["challenger"]
        opponent = map["opponent"]
        return (challenger, opponent)

myred = Redis()
