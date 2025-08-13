# backend/config.py

import os
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    'mysql+pymysql://minseo:sewon0812^^@localhost:3306/safe_on'
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
