# backend/app/__init__.py
import os
from urllib.parse import quote_plus
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.register_blueprint(auth.bp, url_prefix="/auth")

    pwd = os.getenv("DB_PASSWORD", "sewon0812^^")
    encoded_pw = quote_plus(pwd)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:{encoded_pw}@localhost:3306/safe_on'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # 모델 import 후 테이블 생성
    with app.app_context():
        from .models import User
        db.create_all()

    # 라우트 등록  
    from .routers import BLUEPRINTS
    for bp, prefix in BLUEPRINTS:
        app.register_blueprint(bp, url_prefix=prefix)

    return app

    