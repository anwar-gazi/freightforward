from freightman.models import Organization, UserOrganizationMap


def get_shipper_id(user):
    return UserOrganizationMap.objects.get(user=user).organization.dict()
