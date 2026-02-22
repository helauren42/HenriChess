import redis.asyncio as redis

from databases.aredis.redisGame import RedisGame
from utils.const import Env

class RedisAuth(RedisGame):
    def __init__(self):
        super().__init__()
        self.usersPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
    def addSignUp(self, username: str, email: str, password: str):
        pass

myred = RedisAuth()
