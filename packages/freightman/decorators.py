from freightman.models import UserOrganizationMap, AuthLevelPermissions, UserAuthLevel
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponseForbidden


def user_company_is_forwarder(user: get_user_model()):
    m_q = UserOrganizationMap.objects.filter(user=user)
    if m_q.exists():
        if m_q.first().organization.is_forwarder:
            return True
        else:
            return False
    else:
        return False


def user_company_is_shipper(user: get_user_model()):
    m_q = UserOrganizationMap.objects.filter(user=user)
    if m_q.exists():
        if m_q.first().organization.is_shipper:
            return True
        else:
            return False
    else:
        return False


def user_company_is_factory(user: get_user_model()):
    m_q = UserOrganizationMap.objects.filter(user=user)
    if m_q.exists():
        if m_q.first().organization.is_factory:
            return True
        else:
            return False
    else:
        return False


def forwarder_required(view):
    def wrap(request, *args, **kwargs):
        if user_company_is_forwarder(request.user):
            return view(request, *args, **kwargs)
        else:
            return HttpResponseForbidden('user org is not forwarder')

    wrap.__doc__ = view.__doc__
    wrap.__name__ = view.__name__
    return wrap


def shipper_or_factory_required(view):
    def wrap(request, *args, **kwargs):
        if user_company_is_factory(request.user) or user_company_is_shipper(request.user):
            return view(request, *args, **kwargs)
        else:
            return HttpResponseForbidden('User org is not shipper of factory')

    wrap.__doc__ = view.__doc__
    wrap.__name__ = view.__name__
    return wrap


def forwarder_superuser_required(view):
    def wrap(request, *args, **kwargs):
        q = UserAuthLevel.objects.filter(user=request.user)
        if q.exists() and q.first().auth_level.is_forwarder_superuser:
            return view(request, *args, **kwargs)
        else:
            return HttpResponseForbidden('User level is not forwarder superuser')

    wrap.__doc__ = view.__doc__
    wrap.__name__ = view.__name__
    return wrap


def forwarder_admin_required(view):
    def wrap(request, *args, **kwargs):
        q = UserAuthLevel.objects.filter(user=request.user)
        if q.exists() and q.first().auth_level.is_forwarder_admin:
            return view(request, *args, **kwargs)
        else:
            return HttpResponseForbidden('User level is not forwarder admin')

    wrap.__doc__ = view.__doc__
    wrap.__name__ = view.__name__
    return wrap
