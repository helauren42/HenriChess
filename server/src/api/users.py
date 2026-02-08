from fastapi import APIRouter, Depends, Request

from api.decorators import getUserIdReq
from databases.game import GameSnip
from databases.postgres import postgres
from utils.api import miniResp, resp204

accountRouter = APIRouter(prefix="/user")

@accountRouter.get("/{username}")
async def getUserPageData(clireq: Request, username: str, userId: int = Depends(getUserIdReq)):
    print("userId: ", userId)
    basicUser = await postgres.publicUserData(userId)
    return miniResp(200, "success", basicUser.myjson())

@accountRouter.delete("/{username}")
async def deleteAccount(clireq: Request, username: str):
    return resp204()

@accountRouter.get("/hotseat-history/{username}")
async def getHotseatHistory(clireq: Request, username: str, userId: int = Depends(getUserIdReq)):
    gameSnips: list[GameSnip] = await postgres.getFinishedGames(userId, username, "hotseat")
    return miniResp(200, "success", gameSnips)
