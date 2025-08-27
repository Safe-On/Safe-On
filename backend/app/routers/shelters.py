# backend/app/routers/shelters.py
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..utils.repositories import get_nearby_multi_dynamic
from ..db import db as sa_db

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

    s = sa_db.session
    try:
        items = get_nearby_multi_dynamic(s, kinds, lat, lng, radius, limit)
        # 응답 예시: id(string), kind, latitude, longitude, distance_m, name(null 또는 값), props(json)
        return jsonify({"count": len(items), "items": items})
    finally:
        s.close()

@bp_dyn.get("/detail/<table>/<int:shelter_id>")
def detail(table, shelter_id):
    s = sa_db.session

    if table =="heat":
        query=""" 
                SELECT id, facility_type_2, shelter_name, road_address, capacity, latitude, longitude
                FROM shelters_heat
                WHERE id = :id
            """

    elif table=="smart":
        query="""
                SELECT id, facility_name, detailed_address, latitude, longitude
                FROM shelters_smart
                WHERE id = :id
            """

    elif table=="finedust":
        query="""
            SELECT id, shelter_name, road_address, capacity, `time` AS openclose, latitude, longitude
            FROM shelters_finedust
            WHERE id = :id
            """

    elif table=="climate":
        query="""
            SELECT id, facility_name, shelter_name, road_address, `time` AS openclose, latitude, longitude
            FROM shelters_climate
            WHERE id = :id
            """
    else:
        return jsonify({"error": "Invalid table"}),400
        
    row = s.execute(text(query), {"id": shelter_id}).fetchone()
    if row is None:
        return jsonify({"error": "Not found"}), 404
        
    # SQLAlchemy 2.x Row → dict
    try:
        data = dict(row._mapping)
    except AttributeError:
        data = dict(row)

    return jsonify(data)  