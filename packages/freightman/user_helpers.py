from django.contrib.auth import get_user_model
from freightman.models import UserOrganizationMap


def user_org(user_id: int):
    return UserOrganizationMap.objects.get(user_id=user_id).organization
