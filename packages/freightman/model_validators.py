from django.core.exceptions import ValidationError


def validate_awb_serial_length(value):
    if len(str(value)) != 8:
        raise ValidationError('Airway bill number should be 8 digit')


def validate_org_prefix_length(value):
    length = 3
    if len(str(value)) != length:
        raise ValidationError(u'%s is not the correct length, should be %s characters long' % value % length)
