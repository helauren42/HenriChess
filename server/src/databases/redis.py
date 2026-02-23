from abc import ABC
from typing import TypedDict
import uuid
from fastapi import HTTPException
import redis.asyncio as redis
import random

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
        self.users = redis.Redis(connection_pool=self.signupPool)
        self.signupTime = 600

    def newSignupKey(self):
        return str(uuid.uuid4())

    def newResetPasswordKey(self, code: int):
        return str(f"reset_password:{code}")

    async def signupMap(self, username: str, email: str, password: str)-> SignupMap:
        return SignupMap(username=username, email=email, password=password)

class RedisAuth(ARedisAuth):
    async def addSignUp(self, username: str, email: str, password: str)-> str:
        key = self.newSignupKey()
        fieldsAdded = await self.users.hset(key.encode(), mapping=await self.signupMap(username, email, password))
        await self.users.expire(key, 600)
        if fieldsAdded == 0:
            raise Exception("Failed to add signup account into redis")
        mylog.debug(f"Added Signup for: {email}")
        return key

    async def getSignUp(self, token: str)-> SignupMap:
        data = await self.users.hgetall(token)
        await self.users.delete(token)
        if len(data) == 0:
            raise HTTPException(410, "Token Expired")
        assert isinstance(data, dict) and len(data) == 3
        username = data[b'username'].decode()
        email = data[b'email'].decode()
        password = data[b'password'].decode()
        return SignupMap(username=username, email=email, password=password)

    async def storeResetPasswordToken(self, email: str)-> int:
        code = random.randint(11111111, 99999999)
        key = self.newResetPasswordKey(code)
        await self.users.set(key, value=email)
        await self.users.expire(key, 600)
        return code

    async def verifyResetPasswordToken(self, code: int) -> str:
        key = self.newResetPasswordKey(code)
        email = await self.users.get(key)
        await self.users.delete(key)
        if email is None:
            raise HTTPException(400, "Invalid or expired reset password token")
        return email.decode()

myred = RedisAuth()
