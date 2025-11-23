import sys
import dotenv
import os

from .logger import mylog

if dotenv.load_dotenv():
    mylog.critical("failed load env file")
    sys.exit(1)

def getEnv(key) -> str:
    value = os.getenv(key)
    if value is None:
        mylog.critical(f"Could not find key: {key} inside env")
        sys.exit(1)
    return value

PORT = getEnv("SERVER_PORT")
