# backend/app/routers/auth.py
from flask import Blueprint, request, jsonify
from .. import db
from ..models import User

bp = Blueprint("auth", __name__)

@bp.post("/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    # 프론트에서 health_type 또는 type 중 아무거나 보내도 받도록
    raw_age = data.get("age")
    raw_health_type = data.get("health_type", data.get("type"))

    # 필수값 체크
    if not email or not password or raw_age is None or raw_health_type is None:
        return jsonify({"message": "email, password, age, health_type 모두 필요합니다."}), 400

    # 정수 변환 + 검증
    try:
        age = int(raw_age)
        health_type = int(raw_health_type)
    except (TypeError, ValueError):
        return jsonify({"message": "age와 health_type은 정수여야 합니다."}), 400

    if not (0 < age < 150):
        return jsonify({"message": "age는 1~149 범위여야 합니다."}), 400

    # 건강유형 코드는 팀 규칙에 맞춰 제한(예: 1~9)
    if not (1 <= health_type <= 9):
        return jsonify({"message": "health_type은 1~9 범위의 코드여야 합니다."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "이미 존재하는 아이디입니다."}), 409

    db.session.add(User(email=email, password=password, age=age, health_type=health_type))
    db.session.commit()
    return jsonify({"message": "회원가입이 완료되었습니다."}), 201

@bp.post("/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or user.password != data.get("password"):
        return jsonify({"message": "아이디 또는 비밀번호가 올바르지 않습니다."}), 401
    return jsonify({"message": "로그인 성공!", "email": user.email}), 200

@bp.get("/health")
def health():
    return {"ok": True}