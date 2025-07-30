## 백엔드 개발 환경 세팅 (Windows 기준)

1. GitHub에서 코드를 클론하거나, 최신 버전을 pull 받은 후 터미널에서 backend 디렉토리로 이동
```bash
cd safe-on-project\backend
```

2. 가상환경 생성
```bash
python -m venv venv
```

3. 가상환경 활성화
```bash
source venv/Scripts/activate
```

4. 패키지 설치 
```bash
pip install -r requirements.txt 이렇게 하면 requirements.txt 파일에 적힌 패키지 버전과 똑같이 설치된다. 
```
이렇게 하면 requirements.txt 파일에 적힌 패키지 버전과 똑같이 설치된다. 

## ❗주의사항
venv/ 폴더는 GitHub에 올리지 않도록 .gitignore에 이미 제외되어 있습니다.
새로운 패키지를 설치했다면 꼭 아래 명령어로 갱신 후 커밋하세요!

```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements.txt"
git push
```

