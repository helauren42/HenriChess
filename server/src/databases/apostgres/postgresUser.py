from typing import Optional
from fastapi import HTTPException
from psycopg.errors import UniqueViolation
from api.models.auth import LoginSchema
from databases.apostgres.apostgres import APostgres
from databases.models.users import BasicUserModel
from utils.errors import HttpCatch
from utils.logger import mylog
import bcrypt

class APostgresUser(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def fetchUsername(self, user_id: int) -> None | str:
        fetched = await self.execFetchone("select username from users where id=%s", (user_id, ))
        if fetched is None:
            return None
        return fetched[0]

    async def fetchUserId(self, username: Optional[str], email: Optional[str] = None) -> int | None:
        assert isinstance(username, str) or isinstance(email, str)
        if username:
            fetched = await self.execFetchone("select id from users where username=%s",(username, ))
            if fetched is None:
                return None
            return fetched[0]
        fetched = await self.execFetchone("select id from users where email=%s",(email, ))
        if fetched is None:
            return None
        return fetched[0]

    async def deviceTokenExists(self, deviceToken: str) -> bool:
        caught = await self.execFetchone(query="select * from sessions where device_token=%s", values=(deviceToken,))
        return caught is not None

    async def updateSession(self, sessionToken: str, deviceToken: str, userId: int):
        await self.execCommit("update sessions set user_id=%s, session_token=%s where device_token=%s", (userId, bcrypt.hashpw(sessionToken.encode(), bcrypt.gensalt()), deviceToken))

    async def createSession(self, sessionToken: str, deviceToken: str, userId: int):
        await self.execCommit("insert into sessions (user_id, session_token, device_token) values(%s, %s, %s)", (userId, bcrypt.hashpw(sessionToken.encode(), bcrypt.gensalt()), deviceToken, ))

class PostgresUser(APostgresUser):
    def __init__(self) -> None:
        super().__init__()

    async def sessionsUserId(self, sessionToken:str, deviceToken: str) -> None | int:
        fetched = await self.execFetchone("select user_id, session_token from sessions where device_token=%s", (deviceToken,))
        if fetched is None:
            return None
        if not bcrypt.checkpw(sessionToken.encode(), fetched[1]):
            return None
        return int(fetched[0])

    async def usersUserId(self, data: LoginSchema) -> None | int:
        fetched = await self.execFetchone("select id,password from users where username=%s", (data.usernameEmail,))
        if fetched is None:
            fetched = await self.execFetchone("select id, password from users where email=%s", (data.usernameEmail,))
            if fetched is None:
                return None
        passwordDb = fetched[1]
        if bcrypt.checkpw(data.password.encode(), passwordDb):
            return fetched[0]
        return None

    async def storeSession(self, sessionToken: str, deviceToken: str, userId):
        if await self.deviceTokenExists(deviceToken):
            await self.updateSession(sessionToken, deviceToken, userId)
        else:
            await self.createSession(sessionToken, deviceToken, userId)

    async def createUser(self, username: str, email: str, password: str):
        try:
            try:
                fetched = await self.execFetchone(query="INSERT INTO users (username, email, password) values(%s, %s, %s) returning id", values=(username, email, bcrypt.hashpw(password.encode(), bcrypt.gensalt())))
            except Exception as e:
                raise e
            if fetched is None:
                raise HTTPException(500, "failed to get returning id")
            userId = int(fetched[0])
            return userId
        except UniqueViolation as e:
            if e.diag.constraint_name is None:
                raise e
            columnName = e.diag.constraint_name.split("_")[1:-1]
            match columnName[0]:
                case "username":
                    raise await HttpCatch.uniquenessViolation(e, "Username already exists")
                case "email":
                    raise await HttpCatch.uniquenessViolation(e, "Email already exists")
                case _:
                    raise await HttpCatch.uniquenessViolation(e, "Unexpected Unique Violation")
        except Exception as e:
            raise await HttpCatch.postgres(e, "Failed to create user")

    async def publicUserData(self, userId: int)-> BasicUserModel:
        keys = [
            "username",
            "email",
            "creation"
        ]
        row = await self.execFetchone(f"select {', '.join(keys)} from users where id=%s", (userId, ))
        if row is None:
            mylog.error(f"Somehow could not get basicUserData() {row}")
            raise HTTPException(500, "Server error")
        obj = {}
        for i in range(len(row)):
            obj[keys[i]] = row[i]
        data: BasicUserModel = BasicUserModel(**obj)
        return data

    async def updatePassword(self, userId: int, password: str):
        await self.execCommit("update users set password=%s where id=%s", (password, userId))
