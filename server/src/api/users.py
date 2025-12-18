from fastapi import APIRouter, Depends, Request

from api.decorators import getUserId
from databases.postgres import postgres
from utils.api import miniResp, resp204

accountRouter = APIRouter(prefix="/user")

@accountRouter.get("/{username}")
async def getUserPageData(clireq: Request, username: str, userId: int = Depends(getUserId)):
    print("userId: ", userId)
    basicUser = await postgres.publicUserData(userId)
    return miniResp(200, "success", basicUser.myjson())

@accountRouter.delete("/{username}")
async def deleteAccount(clireq: Request, username: str):
    resp204()
