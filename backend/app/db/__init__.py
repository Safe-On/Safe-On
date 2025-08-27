# backend/app/db/__init__.py
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    db.init_app(app)  # 여기서만 앱에 바인딩!!!

__all__ = ["db", "init_db"]