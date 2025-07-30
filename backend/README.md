## 백엔드 개발 환경 세팅 (Windows 기준)

1. 터미널에서 backend 디렉토리로 이동
```
cd safe-on-project\backend
```

2. 가상환경 생성
```
python -m venv venv
```

3. 가상환경 활성화
```
source venv/Scripts/activate
```

4. 패키지 설치 
```
pip install -r requirements.txt

pip install flask flask-cors python-dotenv  // 꼭 필요한 기본 패키지

pip install pandas geopy requests   // 데이터 처리용

pip install flask-sqlalchemy flask-migrate  // DB 관련
```

**가상환경에 필요한 패키지들을 다 설치한 후 아래 명령어 실행 ->**
```
pip install -r requirements.txt
```
이렇게 하면 requirements.txt 파일에 적힌 패키지 버전과 똑같이 설치된다. 