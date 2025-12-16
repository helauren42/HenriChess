from fastapi import HTTPException
from utils.logger import mylog

class FlexException(Exception):
    def __init__(self, status: int, error: str, msg: str) -> None:
        super().__init__()
        self.status = status
        self.error = error
        self.msg = msg

class HttpCatch():
    @staticmethod
    async def postgres(e: Exception, message: str = "Unexpected DB error"):
        mylog.error(f"{message}: {e}")
        return HTTPException(500, "Server error")

    @staticmethod
    async def badRequest(e: Exception, message: str = "Bad request"):
        mylog.info(f"{message}: {e}")
        return HTTPException(400, message)

    @staticmethod
    async def uniquenessViolation(e: Exception, message: str = "Uniqueness Violation"):
        mylog.info(f"{message}: {e}")
        return HTTPException(409, message)
