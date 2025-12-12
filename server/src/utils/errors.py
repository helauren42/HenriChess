from fastapi import HTTPException
from utils.logger import mylog

class FlexException(Exception):
    def __init__(self, status: int, error: str, msg: str) -> None:
        super().__init__()
        self.status = status
        self.error = error
        self.msg = msg

class HttpErrors():
    @staticmethod
    async def postgres(e: Exception, message: str = "Unexpected DB error"):
        mylog.error(f"{message}: {e}")
        raise HTTPException(500, "Server error")

    @staticmethod
    async def badRequest(e: Exception, message: str = "Bad request"):
        mylog.error(f"{message}: {e}")
        raise HTTPException(400, message)
