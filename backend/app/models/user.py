# backend/app/models/user.py

from .. import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    age = db.Column(db.Integer, nullable=False)  # 나이
    health_type = db.Column(db.Integer, nullable=False)

