from psycopg.errors import UniqueViolation
from databases.apostgres import APostgres
from utils.errors import HttpErrors
import bcrypt

class PostgresUser(APostgres):
    async def createUser(self, username: str, email: str, password: str, sessionToken: str, deviceToken: str):
        try:
            await self.executeQueryValues("INSERT INTO users (username, email, password, sessionToken, deviceToken) values(%s, %s, %s, %s, %s)", (username, email, bcrypt.hashpw(password.encode(), bcrypt.gensalt()), bcrypt.hashpw(sessionToken.encode(), bcrypt.gensalt()), deviceToken))
            await self.commit()
        except UniqueViolation as e:
            print("unique Violation: ", e)
            print("diag: ", e.diag)
            match str(e).lower():
                case "username":
                    await HttpErrors.badRequest(e, "Username already exists")
                case "email":
                    await HttpErrors.badRequest(e, "Email already exists")
                case _:
                    await HttpErrors.postgres(e, "Unexpected Unique Violation")
        except Exception as e:
            await HttpErrors.postgres(e, "Failed to create user")
