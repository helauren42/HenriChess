from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from api.auth import authRouter
from api.users import accountRouter
from api.ws.ws import wsRouter
from utils.logger import mylog
from databases.postgres import postgres

@asynccontextmanager
async def lifeIsTooShort(app: FastAPI):
    app.async_pool = await postgres.init_pool()
    yield
    await postgres.close_pool()

app = FastAPI(lifespan=lifeIsTooShort)
app.include_router(authRouter, prefix="/api")
app.include_router(accountRouter, prefix="/api")
app.include_router(wsRouter, prefix="/api")

@app.exception_handler(ValueError)
async def valueExcept(req: Request, e: ValueError):
    mylog.error(f"value error for {req.method} {req.url.path}: {e.__str__()}")
    return JSONResponse(status_code=400, content={"message": "Invalid value", "data": {}})

@app.exception_handler(HTTPException)
async def httpExcept(req: Request, e: HTTPException):
    mylog.error(f"http exception: {str(e)}")
    return JSONResponse(status_code=e.status_code, content={"message": e.detail, "data": {}})

@app.exception_handler(Exception)
async def defaultExcept(req: Request, e: ValueError):
    mylog.error(f"unhandled exception from {req.base_url}: {e.__class__.__name__}\n{e.__str__()}")
    return JSONResponse(status_code=500, content={"message": "Unexpected Server Error", "data": {}})
