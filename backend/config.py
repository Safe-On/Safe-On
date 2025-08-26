# backend/config.py

#내 컴퓨터의 SQL과 연결하는 파일 
#db.py에서 가져다 쓸 예정
import os
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    'mysql+pymysql://minseo3:sewon0812^^@100.112.82.54:3306/safe_on'
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
