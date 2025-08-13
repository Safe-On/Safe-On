# backend/app/models/shelters_map.py
# kinds <-> 실제 테이블명 매핑

KIND_TO_TABLE = {
    "climate": "shelters_climate",
    "heat": "shelters_heat",
    "finedust": "shelters_finedust",
    "smart": "shelters_smart",
}