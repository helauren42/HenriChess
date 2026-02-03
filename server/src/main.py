import fastapi
import uvicorn

from api.app import app
from utils.const import Env

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=int(Env.SERVER_PORT), reload=True)
