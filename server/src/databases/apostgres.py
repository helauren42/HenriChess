import asyncio
import psycopg
from abc import ABC

from utils.const import Env
from utils.errors import HttpErrors
from utils.logger import mylog

class APostgres(ABC):
    def __init__(self) -> None:
        asyncio.run(self.connectCursor())

    async def commit(self) -> None:
        await self.conn.commit()

    async def rollback(self) -> None:
        await self.conn.rollback()

    async def connectCursor(self) -> None:
        self.conn = await psycopg.AsyncConnection.connect(
            dbname=Env.DB_NAME,
            user=Env.DB_USER,
            password=Env.DB_PWD,
            port=Env.DB_PORT,
            host=Env.DB_HOST,
        )
        self.cursor = self.conn.cursor()

    async def executeQueryValues(self, query: str, values: tuple):
            closed = False
            if self.cursor.closed:
                mylog.info(f"Connection to postgres was closed attempting reconnection and query execution")
            try:
                await self.connectCursor()
            except Exception as e:
                mylog.critical("Cursor failed to connect to postgres")
                await HttpErrors.postgres(e)
            if closed:
                mylog.info("Reconnection to postgres successfull")
            await self.cursor.execute(query.encode(), values)

