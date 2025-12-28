from functools import wraps
from fastapi import HTTPException, Request

from databases.postgres import postgres
from utils.api import mini401
from utils.logger import mylog

async def getUserIdReq(clireq: Request) -> int:
    deviceToken = clireq.cookies.get("deviceToken")
    sessionToken = clireq.cookies.get("sessionToken")
    if not deviceToken or not sessionToken:
        # TODO log client request data
        raise HTTPException(401, "Not authorized")
    userId = await postgres.sessionsUserId(sessionToken, deviceToken)
    if userId is None:
        raise HTTPException(401, "Not authorized")
    return userId

async def getUserId(cookies: dict) -> int:
    deviceToken = cookies.get("deviceToken")
    sessionToken = cookies.get("sessionToken")
    if not deviceToken or not sessionToken:
        # TODO log client request data
        raise HTTPException(401, "Not authorized")
    userId = await postgres.sessionsUserId(sessionToken, deviceToken)
    if userId is None:
        raise HTTPException(401, "Not authorized")
    return userId

# def validateTokens(func):
#     @wraps(func)
#     async def wrapper(clireq: Request, *args, **kwargs):
#         mylog.debug("validateTokens")
#         deviceToken = clireq.cookies.get("deviceToken")
#         sessionToken = clireq.cookies.get("sessionToken")
#         if not deviceToken or not sessionToken:
#             return mini401()
#         userId = await postgres.sessionsUserId(sessionToken, deviceToken)
#         if userId is None:
#             return mini401()
#         kwargs["userId"] = userId
#         return await func(clireq, *args, **kwargs)
#     return wrapper
