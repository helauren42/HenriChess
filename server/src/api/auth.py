from functools import wraps
from typing import cast
from fastapi import APIRouter
from fastapi.requests import Request
from fastapi.responses import Response
import uuid

from api.models.auth import LoginSchema, SignupSchema
from databases.postgres import postgres
from utils.api import mini401, miniResp, resp204, setCookie, setSessionCookie

authRouter = APIRouter(prefix="/auth")

# TODO convert to check user session
def hasDeviceToken(func):
    @wraps(func)
    async def wrapper(clireq: Request, *args, **kwargs):
        if clireq.cookies.get("deviceToken") is None:
            return mini401()
        return await func(clireq, *args, **kwargs)
    return wrapper

@authRouter.get("/device-token")
async def getDeviceToken(clireq: Request):
    if clireq.cookies.get("deviceToken"):
        return resp204()
    deviceToken = str(uuid.uuid4())
    resp = miniResp(status=201)
    setCookie(resp, "deviceToken", deviceToken)
    resp.delete_cookie("sessionToken")
    return resp

@authRouter.get("/login")
async def autoLogin(clireq: Request):
    sessionToken = clireq.cookies.get("sessionToken")
    deviceToken = clireq.cookies.get("deviceToken")
    if sessionToken is None or deviceToken is None:
        return mini401()
    # TODO log potential hacker if not in db
    userId = await postgres.sessionsUserId(sessionToken, deviceToken)
    print("userId: ", userId)
    if userId:
        return resp204()
    return mini401()
# TODO make getLogin extend deviceToken expiry age below a threshold of 3 months

@authRouter.post("/login")
@hasDeviceToken
async def Login(clireq: Request, data: LoginSchema):
    userId = await postgres.usersUserId(data)
    if userId is None:
        return mini401("Invalid credentials")
    sessionToken = str(uuid.uuid4())
    deviceToken = cast(str, clireq.cookies.get("deviceToken"))
    await postgres.storeSession(sessionToken, deviceToken)
    resp = resp204()
    setSessionCookie(resp, sessionToken)
    return resp

@authRouter.post("/signup")
async def signup(clireq: Request, data: SignupSchema):
    sessionToken = str(uuid.uuid4())
    deviceToken = clireq.cookies.get("deviceToken")
    if deviceToken is None:
        return mini401()
    await postgres.createUser(data.username, data.email, data.password, sessionToken, deviceToken)
    resp = resp204()
    setSessionCookie(resp, sessionToken)
    return resp
