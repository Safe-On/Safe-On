# backend/app/app.py
from flask import Flask,request,jsonify
from flask_cors import CORS
from .db import db, init_db
from .routers.auth import bp as auth_bp
from .routers.shelters import bp as shelters_bp
from .routers.reviews import bp as reviews_bp
from .routers.favorites import bp as favorites_bp
from .config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # 개발 프론트 주소에 맞게 origins를 넣어주세요.
    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:8081"]}},
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type"],
        supports_credentials=False,   # 헤더 방식이면 False; 쿠키 쓸거면 True
    )

    init_db(app)

    # 모델 등록 보장
    from .models import user, shelter_review  # noqa: F401

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(shelters_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(favorites_bp)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)