from fastapi import FastAPI
from api.auth import authRouter

app = FastAPI()

app.include_router(authRouter)
