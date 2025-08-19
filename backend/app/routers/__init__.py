# backend/app/routers/__init__.py
from .auth import bp as auth_bp

BLUEPRINTS = (
    (auth_bp, "/api/auth"),
)
