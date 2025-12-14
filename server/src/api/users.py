from fastapi import APIRouter, Request
import asyncio

from api.decorators import validateTokens
from databases import postgres
from utils.api import miniResp, resp204

accountRouter = APIRouter(prefix="/account")

@accountRouter.get("/{username}")
@validateTokens
async def getUserPageData(clireq: Request, username: str, userId: int | None = None):
    print(userId)
    # postgres.
    return miniResp(200, "success")

@accountRouter.delete("/{username}")
async def deleteAccount(clireq: Request, username: str):
    resp204()
