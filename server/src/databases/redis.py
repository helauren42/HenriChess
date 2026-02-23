from abc import ABC
from typing import TypedDict
import uuid
from fastapi import HTTPException
import redis.asyncio as redis

from databases.aredis.redisGame import RedisGame
from utils.const import Env
from utils.logger import mylog

class SignupMap(TypedDict):
    username: str
    email: str
    password: str

class ARedisAuth(RedisGame):
    def __init__(self):
        super().__init__()
        self.signupPool = redis.ConnectionPool(host=Env.REDIS_HOST, port=Env.REDIS_PORT, db=0, max_connections=20)
        self.signup = redis.Redis(connection_pool=self.signupPool)
        self.signupTime = 600

    def newSignupKey(self):
        return str(uuid.uuid4())

    async def signupMap(self, username: str, email: str, password: str)-> SignupMap:
        return SignupMap(username=username, email=email, password=password)

class RedisAuth(ARedisAuth):
    async def addSignUp(self, username: str, email: str, password: str)-> str:
        key = self.newSignupKey()
        fieldsAdded = await self.signup.hset(key.encode(), mapping=await self.signupMap(username, email, password))
        await self.signup.expire(key, 600)
        if fieldsAdded == 0:
            raise Exception("Failed to add signup account into redis")
        mylog.debug(f"Added Signup for: {email}")
        return key

    async def getSignUp(self, token: str)-> SignupMap:
        data = await self.signup.hgetall(token)
        await self.signup.delete(token)
        if len(data) == 0:
            raise HTTPException(410, "Token Expired")
        assert isinstance(data, dict) and len(data) == 3
        username = data[b'username'].decode()
        email = data[b'email'].decode()
        password = data[b'password'].decode()
        return SignupMap(username=username, email=email, password=password)

myred = RedisAuth()
