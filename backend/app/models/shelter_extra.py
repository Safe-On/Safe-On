from backend.app.db import db

class Shelter(db.Model):
    __tablename__ = "shelters"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    shelter_name = db.Column(db.String(100), nullable=False)
    road_address = db.Column(db.String(200))
    facility_type_2 = db.Column(db.String(50))
    time = db.Column(db.String(100))
    capacity = db.Column(db.Int)
    latitude = db.Column(db.Double)
    longitude = db.Column(db.Double)
    note = db.Column(db.String(100))
