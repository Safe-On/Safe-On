"""기후동행쉼터 JSON 데이터를 MySQL 데이터베이스에 삽입하는 스크립트"""

import json
from sqlalchemy import create_engine, Table, Column, Float, String, MetaData
from sqlalchemy.orm import sessionmaker

# DB 연결 정보 설정
engine = create_engine("mysql+pymysql://root:sewon0812^^@localhost/safe_on", echo=True)
metadata = MetaData()

# 테이블 정의
shelters_climate = Table('shelters_climate', metadata,
    Column('facility_name', String(225)),
    Column('shelter_name', String(225)),
    Column('sigungu', String(225)),
    Column('road_address', String(225)),
    Column('x_coord', Float),
    Column('y_coord', Float),
    Column('time', String(45)),
    Column('longitude', Float),
    Column('latitude', Float)
)

# 테이블이 없으면 생성
metadata.create_all(engine)

# JSON 파일 불러오기
with open('C:/Users/chloe/safe-on-project/data/shelters_climate.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 세션 생성
Session = sessionmaker(bind=engine)
session = Session()

failures = []

try:
    for i, row in enumerate(data):
        # 빈 문자열은 None으로 변환
        cleaned = {k: (v if v != "" else None) for k, v in row.items()}
        session.execute(shelters_climate.insert(), cleaned)
    session.commit()  # 명시적 커밋
    print("모든 행이 성공적으로 삽입되었습니다.")
except Exception as e:
    session.rollback()
    print(f"삽입 실패: {e}")
finally:
    session.close()