# backend/app/routers/auth.py
from flask import Blueprint, request, jsonify
from ..db import db as sa_db
from ..models.user import User
from ..utils.security import create_access_token, create_refresh_token, decode_token, require_auth, get_current_user_id
import jwt

bp = Blueprint("auth", __name__)

@bp.post("/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    raw_age = data.get("age")
    raw_health_type = data.get("health_type", data.get("type"))

    if not email or not password or raw_age is None or raw_health_type is None:
        return jsonify({"message": "email, password, age, health_type 모두 필요합니다."}), 400

    try:
        age = int(raw_age)
        health_type = int(raw_health_type)
    except (TypeError, ValueError):
        return jsonify({"message": "age와 health_type은 정수여야 합니다."}), 400

    if not (0 < age < 150):
        return jsonify({"message": "age는 1~149 범위여야 합니다."}), 400

    if not (1 <= health_type <= 9):
        return jsonify({"message": "health_type은 1~9 범위의 코드여야 합니다."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "이미 존재하는 아이디입니다."}), 409

    sa_db.session.add(User(email=email, password=password, age=age, health_type=health_type))
    sa_db.session.commit()
    return jsonify({"message": "회원가입이 완료되었습니다."}), 201

@bp.post("/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or user.password != data.get("password"):
        return jsonify({"message": "아이디 또는 비밀번호가 올바르지 않습니다."}), 401
    
    return jsonify({
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "user": {"id": user.id, "email": user.email, "name": getattr(user, "name", None)}
    }), 200

@bp.get("/me")
@require_auth
def me():
    uid = get_current_user_id()
    u = sa_db.session.get(User, uid)
    return jsonify({"id": u.id, "email": u.email, "name": getattr(u, "name", None)})

@bp.post("/refresh")
def refresh():
    data = request.get_json(force=True) or {}
    token = (data.get("refresh_token") or "").strip()
    if not token:
        return jsonify({"error": "validation_error", "message": "refresh_token required"}), 400
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            return jsonify({"error": "invalid_token"}), 401
        user_id = int(payload["sub"])
        return jsonify({"access_token": create_access_token(user_id)})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "refresh_expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "invalid_token"}), 401