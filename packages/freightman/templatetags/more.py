from django import template
from django.template.defaultfilters import stringfilter
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from freightman.models import UserOrganizationMap

register = template.Library()


@register.filter
@stringfilter
def is_url(value):
    val = URLValidator()
    try:
        val(value)
        return True
    except ValidationError:
        return False


@register.simple_tag
def user_org_title(user_id: int):
    return UserOrganizationMap.objects.get(user_id=user_id).organization.title


@register.simple_tag
def user_org_type(user_id: int):
    return UserOrganizationMap.objects.get(user_id=user_id).organization.type
