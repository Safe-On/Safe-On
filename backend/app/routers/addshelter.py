
from flask import Blueprint, request, jsonify, current_app
from backend.app.db import db
from backend.app.models.shelter_extra import Shelter

bp_shelter = Blueprint("shelter", __name__, url_prefix="/")

@bp_shelter.route("/add_shelter", methods=["POST"])
def add_shelter():
    try:
        shelter_name = request.form.get("shelter_name")
        road_address = request.form.get("road_address")
        facility_type = request.form.get("facility_type")  # 프론트에서 facility_type_2 보낸다면 여기 맞게 수정 필요
        time = request.form.get("time")
        capacity = request.form.get("capacity")
        note = request.form.get("note")
        latitude = request.form.get("lat") or request.form.get("latitude")
        longitude = request.form.get("lng") or request.form.get("longitude")

        new_shelter = Shelter(
            shelter_name=shelter_name,
            road_address=road_address,
            facility_type=facility_type,
            time=time,
            capacity=capacity,
            note=note,
            latitude=float(latitude) if latitude else None,
            longitude=float(longitude) if longitude else None,
        )

        db.session.add(new_shelter)
        db.session.commit()

        return jsonify({"message": "저장 성공", "shelter_id": new_shelter.id}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"쉼터 저장 실패: {e}")
        return jsonify({"error": str(e)}), 500
