from psycopg.errors import UniqueViolation
from databases.postgres import APostgres
from utils.errors import MyErrors

class PostgresUser(APostgres):
    async def createUser(self, username: str, email: str, password: bytes, sessionToken: str, deviceToken: str):
        try:
            await self.executeQueryValues("INSERT INTO users (%s, %s, %s, %s, %s)", (username, email, password, sessionToken, deviceToken))
        except UniqueViolation as e:
            match str(e).lower():
                case "username":
                    await MyErrors.badRequest(e, "Username already exists")
                case "email":
                    await MyErrors.badRequest(e, "Email already exists")
                case _:
                    await MyErrors.postgres(e, "Unexpected Unique Violation")
        except Exception as e:
            await MyErrors.postgres(e, "Failed to create user")
