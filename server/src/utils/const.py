import sys
from typing import Literal
import dotenv
import os

from fastapi import WebSocket

from utils.logger import mylog

EXPIRY_TIME = 1200

matchmakePool: list[int] = []
onlinePlayers: dict[int, WebSocket] = {} # userId, WebSocket

if dotenv.load_dotenv() == False:
    mylog.critical("failed load env file")
    sys.exit(1)

def getEnv(key) -> str:
    value = os.getenv(key)
    if value is None:
        mylog.critical(f"Could not find key: {key} inside env")
        sys.exit(1)
    return value

MODES = Literal["hotseat", "online"]

class Env():
    CADDY_HOST=getEnv("CADDY_HOST")
    CADDY_EXT=getEnv("CADDY_EXT")

    SERVER_PORT=getEnv("SERVER_PORT")
    SERVER_HOST=getEnv("SERVER_HOST")
    SERVER_EXT=getEnv("SERVER_EXT")

    VITE_PORT=getEnv("VITE_PORT")
    VITE_HOST=getEnv("VITE_HOST")
    VITE_EXT=getEnv("VITE_EXT")

    DB_PORT=getEnv("DB_PORT")
    DB_HOST=getEnv("DB_HOST")
    DB_EXT=getEnv("DB_EXT")
    DB_NAME=getEnv("DB_NAME")
    DB_USER=getEnv("DB_USER")
    DB_PWD=getEnv("DB_PWD")

    REDIS_PORT=getEnv("REDIS_PORT")
    REDIS_HOST=getEnv("REDIS_HOST")
    REDIS_EXT=getEnv("REDIS_EXT")
