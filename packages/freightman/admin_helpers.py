from django.contrib.auth import get_user_model
from freightman.models import AuthLevelPermissions, UserAuthLevel, UserOrganizationMap, AWBAgent


def user_auth_level(user: get_user_model()):
    userauth_q = UserAuthLevel.objects.filter(user=user)
    if userauth_q.exists():
        return userauth_q.first().auth_level.level_name
    else:
        return 'undefined'


def user_org_name(user: get_user_model()):
    q = UserOrganizationMap.objects.filter(user=user)
    if q.exists():
        return q.first().organization.title
    else:
        'undefined'


def agent_name(agent: AWBAgent):
    return agent.addressbook.company_name

def public_id(obj):
    return obj.public_id

user_auth_level.short_description = 'Level'
user_org_name.short_description = 'Organization'
