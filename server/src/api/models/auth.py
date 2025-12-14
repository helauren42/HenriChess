from pydantic import BaseModel

class SignupSchema(BaseModel):
    username: str
    email: str
    password: str

class LoginSchema(BaseModel):
    usernameEmail: str
    password: str
