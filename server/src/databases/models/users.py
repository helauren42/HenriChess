from datetime import date
from pydantic import BaseModel

class BasicUserModel(BaseModel):
    username: str
    email: str
    creation: date
    def myjson(self):
        return {
            "username": self.username,
            "email": self.email,
            "creation": self.creation.isoformat(),
        }
