# backend/app/utils/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from backend.config import DATABASE_URL  # .env에서 읽는 DB URL

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # MySQL 커넥션 끊김 방지
    future=True,
)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))