# backend/app/routers/reviews.py
from decimal import Decimal
from flask import Blueprint, request, jsonify
from ..db import db
from ..models.shelter_review import ShelterReview, ShelterType
from ..utils.schemas import CreateReviewSchema, ReviewOutSchema
from ..utils.security import require_auth, get_current_user_id

bp = Blueprint("reviews", __name__, url_prefix="/shelters")
_create_schema = CreateReviewSchema()
_out_schema = ReviewOutSchema()


# 문자열 -> Enum 변환 유틸 (대소문자 무시, 잘못된 값이면 400)
def parse_shelter_type(s: str) -> ShelterType | None:
    if not isinstance(s, str):
        return None
    s = s.strip().lower()
    try:
        return ShelterType(s)  # Enum by value
    except ValueError:
        return None

@bp.post("/<string:shelter_type>/<int:shelter_id>/reviews")
@require_auth
def create_review(shelter_type: str, shelter_id: int):
    st = parse_shelter_type(shelter_type)
    if not st:
        return jsonify({"error": "validation_error", "message": "invalid shelter_type"}), 400

    user_id = get_current_user_id()
    data = request.get_json(force=True) or {}
    payload = _create_schema.load(data)

    review = ShelterReview(
        shelter_id=shelter_id,
        shelter_type=st,  # ← path에서 받은 타입
        user_id=user_id,
        rating=Decimal(str(payload["rating"])),
        review_text=payload.get("review_text"),
        review_name=payload.get("review_name"),
        comfort=payload.get("comfort"),
        accessibility_rating=payload.get("accessibility_rating"),
        heating_cooling_status=payload.get("heating_cooling_status"),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(_out_schema.dump(review)), 201

@bp.get("/<string:shelter_type>/<int:shelter_id>/reviews")
def list_reviews(shelter_type: str, shelter_id: int):
    st = parse_shelter_type(shelter_type)
    if not st:
        return jsonify({"error": "validation_error", "message": "invalid shelter_type"}), 400

    page = max(int(request.args.get("page", 1)), 1)
    size = min(max(int(request.args.get("size", 10)), 1), 100)

    q = (ShelterReview.query
         .filter_by(shelter_id=shelter_id, shelter_type=st)  # ← 타입+id로 필터
         .order_by(ShelterReview.created_at.desc()))
    items = q.limit(size).offset((page - 1) * size).all()
    total = q.with_entities(db.func.count()).scalar()

    return jsonify({
        "page": page, "size": size, "total": total,
        "items": _out_schema.dump(items, many=True)
    })