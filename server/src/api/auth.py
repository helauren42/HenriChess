from fastapi import APIRouter
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import uuid

from api.models.auth import SignupModel
from databases.postgres import postgres

authRouter = APIRouter(prefix="/auth")

@authRouter.post("/signup")
async def signup(data: SignupModel, clireq: Request):
    sessionToken = str(uuid.uuid4())
    deviceToken = str(uuid.uuid4())
    await postgres.createUser(data.username, data.email, data.password, sessionToken, deviceToken)
    return JSONResponse({}, 200)
