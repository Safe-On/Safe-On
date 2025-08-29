# backend/app/models/favorite.py
from sqlalchemy import UniqueConstraint, Index, text
from ..db import db

class Favorite(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shelter_type = db.Column(db.String(20), nullable=False)  # 'heat' | 'climate' | 'finedust' | 'smart'
    shelter_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=text('CURRENT_TIMESTAMP'))

    __table_args__ = (
        UniqueConstraint('user_id', 'shelter_type', 'shelter_id', name='uq_user_type_shelter'),
        Index('ix_fav_user_created', 'user_id', 'created_at'),
        Index('ix_fav_type_shelter', 'shelter_type', 'shelter_id'),
    )
