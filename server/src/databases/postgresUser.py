from fastapi import HTTPException
from psycopg import postgres
from psycopg.errors import UniqueViolation
from api.models.auth import LoginSchema
from databases.apostgres import APostgres
from databases.models.sessions import PgUserSession
from databases.models.users import BasicUserModel
from utils.errors import HttpErrors
from utils.logger import mylog
import bcrypt

class APostgresUser(APostgres):
    def __init__(self) -> None:
        super().__init__()

    async def deviceTokenExists(self, deviceToken: str):
        try:
            await self.executeQueryValues("select * from sessions where deviceToken=%s", (deviceToken,))
            found = await self.cursor.fetchone()
            if found is None:
                return False
        except Exception as e:
            raise e
        return True

    async def updateSession(self, sessionToken: str, deviceToken: str, userId: int):
        await self.executeQueryValues("update sessions set userId=%s, sessionToken=%s where deviceToken=%s", (userId, bcrypt.hashpw(sessionToken.encode(), bcrypt.gensalt()), deviceToken))

    async def createSession(self, sessionToken: str, deviceToken: str, userId: int):
        await self.executeQueryValues("insert into sessions (userId, sessionToken, deviceToken) values(%s, %s, %s)", (userId, bcrypt.hashpw(sessionToken.encode(), bcrypt.gensalt()), deviceToken, ))


class PostgresUser(APostgresUser):
    def __init__(self) -> None:
        super().__init__()

    async def sessionsUserId(self, sessionToken:str, deviceToken: str) -> None | int:
        await self.executeQueryValues("select userId, sessionToken from sessions where deviceToken=%s", (deviceToken,))
        fetched = await self.cursor.fetchone()
        if fetched is None:
            return None
        if not bcrypt.checkpw(sessionToken.encode(), fetched[1]):
            return None
        return int(fetched[0])

    async def usersUserId(self, data: LoginSchema) -> None | int:
        await self.executeQueryValues("select id,password from users where username=%s", (data.usernameEmail,))
        fetched = await self.cursor.fetchone()
        if fetched is None:
            await self.executeQueryValues("select id, password from users where email=%s", (data.usernameEmail,))
            fetched = await self.cursor.fetchone()
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
        await self.commit()


    async def createUser(self, username: str, email: str, password: str, sessionToken: str, deviceToken: str):
        try:
            await self.executeQueryValues("INSERT INTO users (username, email, password) values(%s, %s, %s) returning id", (username, email, bcrypt.hashpw(password.encode(), bcrypt.gensalt())))
            fetched = await self.cursor.fetchone()
            if fetched is None:
                await self.rollback()
                raise HTTPException(500, "failed to get returning id")
            await self.commit()
            userId = int(fetched[0])
            await self.storeSession(sessionToken, deviceToken, userId)
            await self.commit()
        except UniqueViolation as e:
            columnName = e.diag.constraint_name.split("_")[1:-1]
            match columnName[0]:
                case "username":
                    await HttpErrors.uniquenessViolation(e, "Username already exists")
                case "email":
                    await HttpErrors.uniquenessViolation(e, "Email already exists")
                case _:
                    await HttpErrors.uniquenessViolation(e, "Unexpected Unique Violation")
        except Exception as e:
            await HttpErrors.postgres(e, "Failed to create user")

    async def basicUserData(self, userId: int)-> BasicUserModel:
        keys = [
            "username",
            "email",
            "creation"
        ]
        await self.executeQueryValues(f"select {', '.join(keys)} from users where id=%s", (userId, ))
        row = await self.cursor.fetchone()
        if row is None:
            mylog.error(f"Somehow could not get basicUserData() {row}")
            raise HTTPException(500, "Server error")
        obj = {}
        for i in range(len(row)):
            obj[keys[i]] = row[i]
        data: BasicUserModel = BasicUserModel(**obj)
        return data

    # async def userClientData(userId: int)-> UserModel:
