from fastapi import APIRouter

from api.models.auth import SignupModel

authRouter = APIRouter(prefix="/auth")

@authRouter.post("/signup")
async def signup(data: SignupModel):
    pass
