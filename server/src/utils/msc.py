from fastapi.responses import Response

def setCookie(resp: Response, key:str, val: str, max_age: int):
    resp.set_cookie(key, val, max_age, secure=True, httponly=True, samesite="strict")
