from functools import wraps
from typing import cast
from fastapi import APIRouter, Depends
from fastapi.requests import Request
from fastapi.responses import JSONResponse, Response
import uuid

from api.decorators import getUserIdReq
from api.models.auth import LoginSchema, SignupSchema
from databases.models.users import BasicUserModel
from databases.postgres import postgres
from utils.api import getUserId, mini401, miniResp, resp204, setCookie, setSessionCookie

authRouter = APIRouter(prefix="/auth")

# TODO convert to check user session
def hasDeviceToken(func):
    @wraps(func)
    async def wrapper(clireq: Request, *args, **kwargs):
        if clireq.cookies.get("deviceToken") is None:
            return mini401()
        return await func(clireq, *args, **kwargs)
    return wrapper

async def noDeviceToken(clireq: Request) -> bool:
    return clireq.cookies.get("deviceToken") == None

async def addDeviceToken(clireq: Request) -> JSONResponse:
    deviceToken = str(uuid.uuid4())
    resp = mini401("Setting device token")
    setCookie(resp, "deviceToken", deviceToken)
    resp.delete_cookie("sessionToken")
    return resp

@authRouter.delete("/logout")
async def logout(clireq: Request, userId: int = Depends(getUserIdReq)):
    await postgres.execCommit("delete from sessions where user_id=%s", values=(userId,))
    return resp204()

# TODO make getLogin extend deviceToken expiry age below a threshold of 3 months
@authRouter.get("/login")
async def autoLogin(clireq: Request):
    if await noDeviceToken(clireq):
        return await addDeviceToken(clireq)
    userId = await getUserId(clireq.cookies)
    if not userId:
        return mini401()
    userData: BasicUserModel = await postgres.publicUserData(userId)
    # extend deviceToken or sessionToken if near expiration
    return miniResp(200, "login success", userData.myjson())

@authRouter.post("/login")
@hasDeviceToken
async def Login(clireq: Request, data: LoginSchema):
    userId = await postgres.usersUserId(data)
    if userId is None:
        return mini401("Invalid credentials")
    sessionToken = str(uuid.uuid4())
    deviceToken = cast(str, clireq.cookies.get("deviceToken"))
    await postgres.storeSession(sessionToken, deviceToken, userId)
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
