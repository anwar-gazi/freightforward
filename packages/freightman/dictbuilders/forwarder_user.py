from django.contrib.auth import get_user_model
from freightman.models import AuthLevelPermissions, UserAuthLevel
from django.shortcuts import reverse


def user_dict_for_user_list(user: get_user_model()):
    if user.is_superuser:
        auth_level = 'superadmin'
    else:
        if UserAuthLevel.objects.filter(user=user).exists():
            auth_level = UserAuthLevel.objects.get(user=user).auth_level.level_name
        else:
            auth_level = 'unknown'
    return {
        'id': user.id,
        'auth_level': UserAuthLevel.objects.get(user=user).auth_level.level_name,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'password_reset_url': reverse('admin:index') + '{}/{}/{}/password'.format(user._meta.app_label, user._meta.model_name, user.id),
        'edit_url': reverse('load_user', args=(user.id,))
    }
