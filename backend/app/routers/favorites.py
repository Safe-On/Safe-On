# backend/app/routers/favorites.py
from flask import Blueprint, request, jsonify, current_app
from ..db import db
from ..models.favorite import Favorite 
from ..models.shelters_map import KIND_TO_TABLE
import jwt
from sqlalchemy import text, bindparam

bp = Blueprint('favorites', __name__)

# 안전한 화이트리스트 매핑만 허용
def _valid_kind(kind: str) -> bool:
    return kind in KIND_TO_TABLE

def _user_id_from_auth():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        token = auth.split(' ', 1)[1]
        payload = jwt.decode(token, current_app.config.get('JWT_SECRET', 'dev-secret'), algorithms=['HS256'])
        return int(payload['sub'])
    except Exception:
        return None

def _shelter_exists(kind: str, shelter_id: int) -> bool:
    if not _valid_kind(kind):
        return False
    table = KIND_TO_TABLE[kind]
    sql = text(f"SELECT id FROM {table} WHERE id = :id LIMIT 1")
    row = db.session.execute(sql, {"id": shelter_id}).first()
    return row is not None

def _fetch_shelters_by_ids(kind: str, ids: set[int]) -> dict[int, dict]:
    """
    id 집합으로 해당 kind 테이블에서 배치 조회.
    컬럼 스키마가 약간 달라도 공통 필드는 최대한 뽑아 직렬화.
    """
    if not ids:
        return {}
    table = KIND_TO_TABLE[kind]

    stmt = text(f"""
        SELECT
            id,
            /* 컬럼이 없다면 이 라인을 테이블별로 맞게 조정하거나 SELECT * 사용 */
            shelter_name,
            road_address,
            lot_address,
            capacity,
            latitude,
            longitude,
            facility_type_1,
            facility_type_2
        FROM {table}
        WHERE id IN :ids
    """).bindparams(bindparam("ids", expanding=True))

    rows = db.session.execute(stmt, {"ids": list(ids)}).mappings().all()

    result = {}
    for r in rows:
        # r는 MappingResult(row) → dict처럼 접근 가능
        result[r["id"]] = {
            "id": r.get("id"),
            "name": r.get("shelter_name"),
            "road_address": r.get("road_address"),
            "lot_address": r.get("lot_address"),
            "capacity": r.get("capacity"),
            "latitude": r.get("latitude"),
            "longitude": r.get("longitude"),
            "facility_type_1": r.get("facility_type_1"),
            "facility_type_2": r.get("facility_type_2"),
        }
    return result

@bp.post('/shelters/<string:shelter_type>/<int:shelter_id>/favorite')
def add_favorite(shelter_type, shelter_id):
    """즐겨찾기 추가 — shelters_* 모델 없이 KIND_TO_TABLE로 확인"""
    user_id = _user_id_from_auth()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    if not _valid_kind(shelter_type):
        return jsonify({'message': 'Invalid shelter_type'}), 400

    # 대상 쉼터 존재 체크
    if not _shelter_exists(shelter_type, shelter_id):
        return jsonify({'message': 'Shelter not found'}), 404

    exists = Favorite.query.filter_by(
        user_id=user_id, shelter_type=shelter_type, shelter_id=shelter_id
    ).first()
    if exists:
        return jsonify({'ok': True, 'already': True})

    fav = Favorite(user_id=user_id, shelter_type=shelter_type, shelter_id=shelter_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify({'ok': True, 'favoriteId': fav.id})

@bp.delete('/shelters/<string:shelter_type>/<int:shelter_id>/favorite')
def remove_favorite(shelter_type, shelter_id):
    """즐겨찾기 해제"""
    user_id = _user_id_from_auth()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    if not _valid_kind(shelter_type):
        return jsonify({'message': 'Invalid shelter_type'}), 400

    removed = (
        Favorite.query
        .filter_by(user_id=user_id, shelter_type=shelter_type, shelter_id=shelter_id)
        .delete()
    )
    db.session.commit()
    return jsonify({'ok': True, 'removed': removed})

@bp.get('/favorites')
def list_favorites():
    """
    통합 즐겨찾기 목록
    - 쿼리: ?limit=20&offset=0
    - 각 항목: favorite_id, created_at, shelter_type, shelter_id, shelter({...})
    """
    user_id = _user_id_from_auth()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    limit = min(int(request.args.get('limit', 20)), 100)
    offset = int(request.args.get('offset', 0))

    # 1) favorites만 페이징해서 가져오기
    fav_rows = (
        Favorite.query
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    # 2) kind별 id 모으기 → 테이블별 배치 조회(N+1 방지)
    ids_by_kind: dict[str, set[int]] = {}
    for f in fav_rows:
        ids_by_kind.setdefault(f.shelter_type, set()).add(f.shelter_id)

    shelters_by_kind: dict[str, dict[int, dict]] = {}
    for kind, idset in ids_by_kind.items():
        if not _valid_kind(kind):
            shelters_by_kind[kind] = {}
            continue
        shelters_by_kind[kind] = _fetch_shelters_by_ids(kind, idset)

    # 3) 직렬화
    items = []
    for f in fav_rows:
        info = shelters_by_kind.get(f.shelter_type, {}).get(f.shelter_id)
        items.append({
            "favorite_id": f.id,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "shelter_type": f.shelter_type,
            "shelter_id": f.shelter_id,
            "shelter": info if info is not None else None
        })

    return jsonify({"items": items, "limit": limit, "offset": offset})