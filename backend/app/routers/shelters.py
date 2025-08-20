# backend/app/routers/shelters.py
from flask import Blueprint, request, jsonify
from backend.app.utils.db import SessionLocal
from backend.app.utils.repositories import get_nearby_multi_dynamic

bp_dyn = Blueprint("shelters_dyn", __name__, url_prefix="/shelters")

bp = bp_dyn

@bp_dyn.get("/nearby")
def nearby_multi():
    q = request.args
    try:
        lat = float(q["lat"]); lng = float(q["lng"])
    except Exception:
        return jsonify({"error":"lat,lng 필요"}), 400

    kinds = [k.strip() for k in q.get("kinds","").split(",") if k.strip()]  # 쉼터 종류
    radius = float(q.get("radius", 1500))  # 반경
    limit  = int(q.get("limit", 20))  # 출력 개수 제한 

    s = SessionLocal()
    try:
        items = get_nearby_multi_dynamic(s, kinds, lat, lng, radius, limit)
        # 응답 예시: id(string), kind, latitude, longitude, distance_m, name(null 또는 값), props(json)
        return jsonify({"count": len(items), "items": items})
    finally:
        s.close()
