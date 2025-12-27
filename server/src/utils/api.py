from fastapi import Request
from fastapi.responses import JSONResponse, Response

from databases import postgres

def resp204():
    return Response(status_code=204)

def miniResp(status: int, message:str="", data:dict={}):
    return JSONResponse({
            "message": message,
            "data": data
        }, status_code=status)

def mini401(message: str="You are unauthorized"):
    return miniResp(401, message)

halfYearSecs = 60 * 60 * 24 * 180

def setCookie(resp: Response, key:str, val: str, max_age: int = halfYearSecs):
    resp.set_cookie(key, val, max_age, secure=True, httponly=True, samesite="strict")

def setSessionCookie(resp: Response, value: str):
    resp.set_cookie("sessionToken", value=value, max_age=halfYearSecs)
