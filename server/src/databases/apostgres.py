from contextlib import asynccontextmanager
from abc import ABC

from psycopg import AsyncCursor, ProgrammingError
from psycopg.rows import TupleRow

from utils.const import Env
from utils.errors import HttpCatch
from utils.logger import mylog
import psycopg_pool

class APostgres(ABC):
    pool: psycopg_pool.AsyncConnectionPool | None = None
    
    @classmethod
    async def init_pool(cls) -> None:
        """Initialize the connection pool once at app startup"""
        if cls.pool is None:
            cls.pool = psycopg_pool.AsyncConnectionPool(
                conninfo=f"user={Env.DB_USER} password={Env.DB_PWD} host={Env.DB_HOST} port={Env.DB_PORT} dbname={Env.DB_NAME}",
                min_size=5,
                timeout=30,
                open=False
            )
            await cls.pool.open()
    
    @classmethod
    async def close_pool(cls) -> None:
        """Close the pool at app shutdown"""
        if cls.pool:
            await cls.pool.close()
            cls.pool = None
    
    @asynccontextmanager
    async def getConn(self):
        if self.pool is None:
            raise ProgrammingError("pool not initialized yet")
        async with self.pool.connection() as conn:
            yield conn

    @asynccontextmanager
    async def getCursor(self):
        if self.pool is None:
            raise ProgrammingError("pool not initialized yet")
        async with self.pool.connection() as conn:
            async with conn.cursor() as cursor:
                yield cursor

    async def execFetchone(self, query: str, values: tuple) -> None | TupleRow:
        try:
            async with self.getConn() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(query=query.encode(), params=values)
                    return await cursor.fetchone()
        except Exception as e:
            raise await HttpCatch.postgres(e, "execFetchone() failed")

    async def execFetchall(self, query: str, values: tuple) -> None | list[TupleRow]:
        try:
            async with self.getConn() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(query=query.encode(), params=values)
                    return await cursor.fetchall()
        except Exception as e:
            raise await HttpCatch.postgres(e, "execFetchone() failed")
    async def execCommit(self, query: str, values: tuple):
        try:
            async with self.getConn() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(query=query.encode(), params=values)
                await conn.commit()
        except Exception as e:
            raise await HttpCatch.postgres(e, "execCommit() failed")

    async def exec(self, cursor: AsyncCursor, query: str, values: tuple):
        try:
            mylog.debug(f"values: {values}")
            await cursor.execute(query=query.encode(), params=values)
        except Exception as e:
            raise await HttpCatch.postgres(e, "exec() failed")

