# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from backend.app.utils.db import SessionLocal

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/")
    def index():
        return {
        "status": "ok",
        "endpoints": [
            "/healthz",
            "/shelters/nearby?kinds=heat,shade&lat=..&lng=..&radius=..&limit=.."
        ]
    }

    @app.get("/healthz")
    def healthz():
        return {"ok": True}

    # 순환임포트 방지: 함수 내부에서 import
    from backend.app.routers.shelters import bp_dyn
    app.register_blueprint(bp_dyn)

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        SessionLocal.remove()

    return app