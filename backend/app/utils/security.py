# backend/app/utils/security.py
import time
import jwt
from functools import wraps
from flask import request, jsonify, g
from ..models.user import User
from ..db import db
from ..config import JWT_SECRET, JWT_ALGORITHM, JWT_ACCESS_TTL_SECONDS, JWT_REFRESH_TTL_SECONDS

def create_access_token(user_id: int):
    now = int(time.time())
    payload = {"sub": str(user_id), "type": "access", "iat": now, "exp": now + JWT_ACCESS_TTL_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: int):
    now = int(time.time())
    payload = {"sub": str(user_id), "type": "refresh", "iat": now, "exp": now + JWT_REFRESH_TTL_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

def get_token_from_header():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return auth.split(" ", 1)[1].strip()

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "unauthorized", "message": "Missing Bearer token"}), 401
        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                return jsonify({"error": "unauthorized", "message": "Invalid token type"}), 401
            user_id = int(payload["sub"])
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({"error": "unauthorized", "message": "User not found"}), 401
            # 요청 수명 동안 접근 가능
            g.current_user = user
            return fn(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "token_expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "invalid_token"}), 401
    return wrapper

def get_current_user_id():
    # reviews 라우터에서 사용
    from flask import g
    user = getattr(g, "current_user", None)
    return user.id if user else None
