from functools import wraps
from typing import cast
from fastapi import APIRouter, Depends, HTTPException
from fastapi.requests import Request
from fastapi.responses import JSONResponse, Response
import uuid

from api.decorators import getUserIdReq
from api.models.auth import LoginSchema, ResetPasswordSchema, SignupSchema
from databases.models.users import BasicUserModel
from databases.postgres import postgres
from databases.redis import myred
import smtp
from smtp.smtp import Smtp, mylog
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

# stores account info in redis prior to user validating ema
@authRouter.post("/signup")
async def signup(clireq: Request, data: SignupSchema):
    # TODO check for duplicates in postgres
    key = await myred.addSignUp(data.username, data.email, data.password)
    Smtp.sendVerificationEmail(data.username, data.email, key)
    return resp204()

@authRouter.post("/verify/{token}")
async def createAccount(clireq: Request, token: str):
    sessionToken = str(uuid.uuid4())
    deviceToken = clireq.cookies.get("deviceToken")
    if deviceToken is None:
        deviceToken = str(uuid.uuid4())
    data = await myred.getSignUp(token)
    mylog.debug(data)
    userId = await postgres.createUser(data["username"], data["email"], data["password"])
    resp = resp204()
    await postgres.storeSession(sessionToken, deviceToken, userId)
    setSessionCookie(resp, sessionToken)
    setCookie(resp, "deviceToken", deviceToken)
    return resp

@authRouter.post("/reset-password/request")
async def getResetPassword(clireq: Request):
    data: dict = await clireq.json()
    email = data["email"]
    username = await postgres.fetchUsername(None, email)
    if username is None:
        raise HTTPException(401, "No account linked to this email address was found")
    mylog.debug(f"received getResetPassword for: {email}")
    code = await myred.storeResetPasswordToken(email)
    Smtp.sendResetPasswordEmail(username, email, code)
    return JSONResponse({"message": "success"})

@authRouter.patch("/reset-password/confirm")
async def resetPassword(clireq: Request, data: ResetPasswordSchema):
    # TODO check that it matches the redis code and fetch email from redis
    userId = await postgres.fetchUserId(None, data.email)
    if userId is None:
        raise HTTPException(403, "You don't have an account")
    await postgres.updatePassword(userId, data.password)
    deviceToken = clireq.cookies.get("deviceToken")
    if deviceToken is None:
        deviceToken = str(uuid.uuid4())
    sessionToken = str(uuid.uuid4())
    resp = resp204()
    await postgres.storeSession(sessionToken, deviceToken, userId)
    setSessionCookie(resp, sessionToken)
    setCookie(resp, "deviceToken", deviceToken)
    return resp

