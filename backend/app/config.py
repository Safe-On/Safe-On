# backend/app/config.py
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
load_dotenv()


# 1) .env에 DATABASE_URL이 있으면 그대로 사용, 없으면 개별 항목으로 조합
def _build_db_url():
    url = os.getenv("DATABASE_URL")
    if url:
        return url  # 예: mysql+pymysql://user:pass@localhost:3306/safe_on
    user = os.getenv("DB_USER", "minseo")
    pw   = os.getenv("DB_PASSWORD", "sewon0812^^")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "safe_on")
    # 비밀번호에 특수문자 있으면 인코딩!
    return f"mysql+pymysql://{user}:{quote_plus(pw)}@{host}:{port}/{name}"

SQLALCHEMY_DATABASE_URI = _build_db_url()
SQLALCHEMY_TRACK_MODIFICATIONS = False

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TTL_SECONDS = 60 * 60 * 2      # 2시간
JWT_REFRESH_TTL_SECONDS = 60 * 60 * 24*7  # 7일