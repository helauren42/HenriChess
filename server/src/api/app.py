from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from api.auth import authRouter
from utils.logger import mylog

app = FastAPI()
app.include_router(authRouter, prefix="/api")

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
    mylog.error(f"unhandled exception: {e.__class__.__name__}\n{e.__str__()}")
    return JSONResponse(status_code=400, content={"message": "Invalid value", "data": {}})
