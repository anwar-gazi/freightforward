from django.shortcuts import reverse
from django.contrib.auth import get_user_model
from freightman.models import UserAuthLevel


def user_dict(user: get_user_model()):
    authq = UserAuthLevel.objects.filter(user=user)
    return {
        'id': user.id,

        'username': user.username,
        'firstname': user.first_name,
        'lastname': user.last_name,
        'email': user.email,
        'password': '',

        'auth_level_name': authq.first().auth_level.level_name if authq.exists() else '',

        'view_edit_url': reverse('load_user', args=(user.id,)),

        'password_reset_url': reverse('admin:index') + '{}/{}/{}/password'.format(user._meta.app_label, user._meta.model_name, user.id),
    }
