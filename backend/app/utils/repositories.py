# backend/app/utils/repositories.py

import math
from typing import Iterable, List
from sqlalchemy import Table, MetaData, select, func, and_, union_all, literal, cast, String, Float 
from sqlalchemy.orm import Session
from ..models.shelters_map import KIND_TO_TABLE
from datetime import datetime

def _bbox(lat: float, lng: float, radius_m: float):
    deg_lat = radius_m / 111_320.0
    cos_lat = max(0.01, math.cos(math.radians(lat)))
    deg_lng = radius_m / (111_320.0 * cos_lat)
    return (lat - deg_lat, lat + deg_lat, lng - deg_lng, lng + deg_lng)

def _pick_col(t: Table, candidates: list[str]):
    cols = set(t.c.keys())
    for name in candidates:
        if name in cols:
            return t.c[name]
    return None

# 안전한 컬럼 선택 헬퍼
def _find_col_ci(t: Table, candidates: list[str]):
    m = {c.name.lower(): c for c in t.c} 
    for name in candidates:
        col = m.get(name.lower())
        if col is not None:
            return col
    return None

def _latlng_cols(t: Table):
    # 다양한 표기 지원 + 불리언평가 금지
    lat = _find_col_ci(t, ["latitude","lat","y","위도"])
    lng = _find_col_ci(t, ["longitude","lng","x","경도"])
    if lat is None or lng is None:
        raise ValueError(
            f"[{t.name}] 위도/경도 컬럼을 찾지 못했습니다. columns={ [c.name for c in t.c] }"
        )
    return lat, lng

def _safe_id_col(t: Table, kind: str, lat_col, lng_col):
    if any(c.name.lower() == "id" for c in t.c):
        return cast(next(c for c in t.c if c.name.lower()=="id"), String).label("id")
    return func.md5(
        func.concat_ws(":", literal(kind), cast(lng_col, String), cast(lat_col, String))
    ).label("id")


def _name_col(t: Table, fallback: str):
    # name 없으면 NULL 반환(프론트에서 처리) 또는 대체 문자열 사용하려면 literal(fallback)
    return (t.c.name if "name" in t.c.keys() else literal(None)).label("name")

def _props_json(t: Table, exclude: set) -> object:
    # exclude를 소문자로 맞춰 비교
    ex = {e.lower() for e in exclude}
    pairs: List[object] = []
    for c in t.c:
        if c.name.lower() in ex:
            continue
        pairs.append(literal(c.name)); pairs.append(c)
    return func.json_object(*pairs).label("props") if pairs else literal(None).label("props")

def build_nearby_stmt_for_table(t: Table, kind: str, user_lat: float, user_lng: float,
                                radius_m: float, min_lat: float, max_lat: float,
                                min_lng: float, max_lng: float):
    lat_col, lng_col = _latlng_cols(t)

    lat_f = cast(lat_col, Float)
    lng_f = cast(lng_col, Float)

    user_pt = func.ST_SRID(func.Point(user_lng, user_lat), 4326)
    spot_pt = func.ST_SRID(func.Point(lng_f, lat_f), 4326)

    # 거리 계산 
    distance = func.ST_Distance_Sphere(spot_pt, user_pt).label("distance_m")

    exclude = {"latitude", "longitude", "lat", "lng", "x", "y", "location", "geom", "shape"}

    cols = [
        _safe_id_col(t, kind, lat_f, lng_f),
        literal(kind).label("kind"),
        lat_f.label("latitude"),
        lng_f.label("longitude"),
        distance,
        _name_col(t, fallback=f"{kind}"),
        _props_json(t, exclude=exclude),
    ]

    stmt = select(*cols).where(and_(
        lat_f.between(min_lat, max_lat),
        lng_f.between(min_lng, max_lng),
        distance <= radius_m
    ))
    return stmt

def get_nearby_multi_dynamic(
    session: Session,
    kinds: Iterable[str],
    user_lat: float, user_lng: float,
    radius_m: float = 1500, limit: int = 20
):
    kinds = [k.strip().lower() for k in kinds if k.strip().lower() in KIND_TO_TABLE]
    if not kinds:
        return []

    min_lat, max_lat, min_lng, max_lng = _bbox(user_lat, user_lng, radius_m)
    engine = session.get_bind()
    md = MetaData()
    subqueries = []
    for k in kinds:
        tname = KIND_TO_TABLE[k]
        t = Table(tname, md, autoload_with=engine)
        subqueries.append(
            build_nearby_stmt_for_table(
                t, k, user_lat, user_lng, radius_m, min_lat, max_lat, min_lng, max_lng
            )
        )

    u = union_all(*subqueries).subquery("u")
    # 거리 오름차순 + limit
    stmt = select(u).order_by(u.c.distance_m.asc()).limit(limit)
    return [dict(r) for r in session.execute(stmt).mappings().all()]


# shelter_reviews 테이블에 리뷰를 삽입하는 함수 
def insert_review(session, shelter_id, shelter_type, rating, review_text, review_name, comfort, accessibility_rating, heating_cooling_status):
    try:
        # 쉼터 리뷰를 DB에 삽입하는 쿼리 작성
        new_review = {
            "shelter_id": shelter_id,
            "shelter_type": shelter_type,
            "rating": rating,
            "review_text": review_text,
            "review_name": review_name,
            "comfort": comfort,
            "accessibility_rating": accessibility_rating,
            "heating_cooling_status": heating_cooling_status,
            "created_at": datetime.now()
        }

        session.execute("""
            INSERT INTO shelter_reviews (shelter_id, shelter_type, rating, review_text, review_name, comfort, accessibility_rating, heating_cooling_status, created_at)
            VALUES (:shelter_id, :shelter_type, :rating, :review_text, :review_name, :comfort, :accessibility_rating, :heating_cooling_status, :created_at)
        """, new_review)

        # 리뷰 ID 반환
        return session.last_insert_id()

    except Exception as e:
        raise e