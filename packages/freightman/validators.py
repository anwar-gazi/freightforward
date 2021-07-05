from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import ValidationError
from freightman.public_id_helpers import type_1_public_id_to_model_id
import json


def validate_comma_separated_integer(value):
    if value % 2 != 0:
        raise ValidationError(
            _('%(value)s is not an even number'),
            params={'value': value},
        )


def validate_json_string(json_str: str):
    try:
        json.loads(json_str)
    except:
        raise ValidationError('Not valid json string')


def json_is_nonempty_list(json_str: str):
    if not len(json.loads(json_str)):
        raise ValidationError('Empty list')


def validate_type1_public_id(public_id: str):
    try:
        type_1_public_id_to_model_id(public_id)
    except:
        raise ValidationError('publicid {} not valid'.format(public_id))


def validate_type1_public_id_list(public_id_list: list):
    for public_id in public_id_list:
        validate_type1_public_id(public_id)
