import string
from fastapi import HTTPException
from pydantic import BaseModel, field_validator
from email_validator import validate_email

SPECIAL_CHARACTERS = string.punctuation

class SignupSchema(BaseModel):
    username: str
    email: str
    password: str

    @field_validator("username")
    @classmethod
    def usernameValidator(cls, username: str):
        for c in username:
            if not c.isdigit() and not c.islower() and not c.isupper():
                raise HTTPException(422, "Invalid character in username, username may only have digits, lower case and upper case characters")

    @field_validator("email")
    @classmethod
    def emailValidator(cls, email: str):
        try:
            validate_email(email)
        except Exception as e:
            raise HTTPException(422, "Entered email is not a valid email address")
        return email

    @field_validator("password")
    @classmethod
    def passwordValidator(cls, pwd: str):
        lowerCase: bool = False
        upperCase: bool = False
        digit: bool = False
        special: bool = False
        for c in pwd:
            if c.islower():
                lowerCase = True
            elif c.isupper():
                upperCase = True
            elif c.isdigit():
                digit = True
            elif SPECIAL_CHARACTERS.find(c, 0) >= 0:
                special = True
            else:
                raise HTTPException(422, f"Password contains invalid character '{c}', who are you?")
        if not lowerCase or not upperCase or not digit or not special:
            raise HTTPException(422, "Password needs to be at least 8 characters in length and it must contain a lower case, upper case, digit and special character")
        return pwd

class LoginSchema(BaseModel):
    usernameEmail: str
    password: str
