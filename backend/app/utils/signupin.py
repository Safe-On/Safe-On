from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os


app = Flask(__name__)


# MySQL 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://your_username:your_password@your_host/your_database_name'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#데이터베이스의 열에 들어갈 정보 세팅 (여기선 아이디와 패스워드)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

# 데이터베이스 초기화 (테이블 생성)
with app.app_context():
    db.create_all()

#클라이언트한테 회원가입 요청이 왔을 때 
#프론트 예:try { onst response = await fetch(`${API_URL}/api/signup`, {method: 'POST',
                                
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

#각각의 상황에 따라 jsonAPI를 프론트로 전송
    if not username or not password:
        return jsonify({'message': '아이디와 비밀번호를 모두 입력해주세요.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': '이미 존재하는 아이디입니다.'}), 409

#생성된 계정을 데이터베이스에 저장하는 과정
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '회원가입이 완료되었습니다.'}), 201

#클라이언트한테 로그인 요청이 왔을 떄 
#프론트 예: try {const response = await fetch(`${API_URL}/api/login`, {method: 'POST',
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

#각각의 상황에 따라 jsonAPI를 프론트로 전송
    if not user or user.password != password:
        return jsonify({'message': '아이디 또는 비밀번호가 올바르지 않습니다.'}), 401

    return jsonify({'message': '로그인 성공!', 'username': user.username}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)