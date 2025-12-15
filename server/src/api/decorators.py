from functools import wraps
from fastapi import Request

from databases.postgres import postgres
from utils.api import mini401
from utils.logger import mylog

def validateTokens(func):
    @wraps(func)
    async def wrapper(clireq: Request, *args, **kwargs):
        deviceToken = clireq.cookies.get("deviceToken")
        sessionToken = clireq.cookies.get("sessionToken")
        if not deviceToken or not sessionToken:
            return mini401()
        userId = await postgres.sessionsUserId(sessionToken, deviceToken)
        if userId is None:
            return mini401()
        kwargs["userId"] = userId
        return await func(clireq, *args, **kwargs)
    return wrapper
