from freightman.models import AuthLevelPermissions, UserAuthLevel
from django.conf import settings


def user_authlevel_permission(request):
    if request.user.is_authenticated:
        q = UserAuthLevel.objects.filter(user=request.user)
        return {
            'user_authlevel_permission': q.first().auth_level if q.exists() else None
        }
    else:
        return {
            'user_authlevel_permission': None
        }


def config(request):
    return {
        'settings': {
            'FRONTEND_JS_DATE_FORMAT': settings.FRONTEND_JS_DATE_FORMAT,
            'FRONTEND_DATETIME_FORMAT_HUMAN': settings.FRONTEND_DATETIME_FORMAT_HUMAN
        }
    }
