from pydantic import BaseModel


class PgUserSession(BaseModel):
    userId: str
    sessionToken: bytes
