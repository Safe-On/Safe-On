# backend/app/models/shelter_review.py
from enum import Enum
from sqlalchemy import func, Numeric
from ..db import db

class ShelterType(Enum):
    heat = "heat"
    climate = "climate"
    smart = "smart"
    finedust = "finedust"

class Comfort(Enum):
    easy = "여유"
    normal = "보통"
    crowded = "혼잡"

class Accessibility(Enum):
    high = "상"
    mid = "중"
    low = "하"

class HVACStatus(Enum):
    on = "on"
    off = "off"

class ShelterReview(db.Model):
    __tablename__ = "shelter_reviews"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    shelter_id = db.Column(db.Integer, nullable=False, index=True)
    shelter_type = db.Column(db.Enum(ShelterType), nullable=False)
    rating = db.Column(Numeric(2, 1), nullable=False)
    review_text = db.Column(db.Text)
    review_name = db.Column(db.String(225))
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    comfort = db.Column(db.Enum(Comfort))
    accessibility_rating = db.Column(db.Enum(Accessibility))
    heating_cooling_status = db.Column(db.Enum(HVACStatus))
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)