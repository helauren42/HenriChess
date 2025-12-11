from fastapi import HTTPException
from utils.logger import mylog

class MyErrors():
    @staticmethod
    async def postgres(e: Exception, message: str = "Unexpected DB error"):
        mylog.error(f"{message}: {e}")
        raise HTTPException(500, "Server error")

    @staticmethod
    async def badRequest(e: Exception, message: str = "Bad request"):
        mylog.error(f"{message}: {e}")
        raise HTTPException(400, message)
