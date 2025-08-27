import pymysql

# DB 접속 정보
host = "100.112.82.54"   # 당신 PC의 Tailscale IP
port = 3306
user = "root"          # MySQL 계정
password = "sewon0812^^"
database = "safe_on"      # 접속할 DB 이름

try:
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset="utf8mb4"
    )
    print("✅ MySQL 연결 성공!")
    
    with conn.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"MySQL 버전: {version[0]}")

except Exception as e:
    print("❌ 연결 실패:", e)

finally:
    if 'conn' in locals() and conn.open:
        conn.close()
