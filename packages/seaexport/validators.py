from seaexport.models import SeaExportFreightBooking
from django.core.validators import ValidationError
from freightman.public_id_helpers import type_1_public_id_to_model_id


def validate_booking_confirmed(booking_public_id: str):
    booking_id = type_1_public_id_to_model_id(booking_public_id)
    booking = SeaExportFreightBooking.objects.get(id=booking_id)
    if not booking.is_booking_confirmed:
        raise ValidationError('Booking not confirmed')


def validate_booking_goods_received(booking_public_id: str):
    booking_id = type_1_public_id_to_model_id(booking_public_id)
    booking = SeaExportFreightBooking.objects.get(id=booking_id)
    if not booking.goods_received:
        raise ValidationError('Booking goods not received')
