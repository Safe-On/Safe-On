# backend/app/utils/schemas.py
# 요청 유효성 검사 + 응답 직렬화
from decimal import Decimal
from marshmallow import Schema, fields, validate, ValidationError, EXCLUDE
from marshmallow_enum import EnumField
from ..models.shelter_review import (ShelterType, Comfort, Accessibility, HVACStatus)

def rating_range(value):
    try:
        d = Decimal(str(value))
    except Exception:
        raise ValidationError("rating must be a number.")
    if d < Decimal("0.0") or d > Decimal("5.0"):
        raise ValidationError("rating must be between 0.0 and 5.0.")
    if -d.as_tuple().exponent > 1:
        raise ValidationError("rating must have at most 1 decimal place.")
    return value

class CreateReviewSchema(Schema):
    rating = fields.Float(required=True, validate=rating_range)
    review_text = fields.String(load_default=None, allow_none=True, validate=validate.Length(max=65535))
    review_name = fields.String(load_default=None, allow_none=True, validate=validate.Length(max=225))
    comfort = EnumField(Comfort, by_value=True, load_default=None, allow_none=True)
    accessibility_rating = EnumField(Accessibility, by_value=True, load_default=None, allow_none=True)
    heating_cooling_status = EnumField(HVACStatus, by_value=True, load_default=None, allow_none=True)

    class Meta:
        unknown = EXCLUDE

class ReviewOutSchema(Schema):
    id = fields.Int(); shelter_id = fields.Int(); user_id = fields.Int()
    shelter_type = fields.String(); rating = fields.Float()
    review_text = fields.String(allow_none=True); review_name = fields.String(allow_none=True)
    comfort = fields.String(allow_none=True); accessibility_rating = fields.String(allow_none=True)
    heating_cooling_status = fields.String(allow_none=True)
    created_at = fields.DateTime(); updated_at = fields.DateTime()
