from django.shortcuts import render
import time
from .forms import UserCreateForm, UserUpdateForm
from django.db import transaction
from .user_helpers import user_org
from django.contrib.auth import get_user_model
from .models import UserOrganizationMap, AuthLevelPermissions, UserAuthLevel, Organization
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required, user_passes_test
from freightman.user_test import can_list_user, can_create_user, is_superuser
from .decorators import forwarder_required, forwarder_admin_required, forwarder_superuser_required
from freightman.dictbuilders.forwarder_user import user_dict_for_user_list
from django.shortcuts import reverse


@login_required
@forwarder_required
@user_passes_test(can_create_user, is_superuser)
def add_user_page(request, org_id: ''):
    data = {
        'org_id': org_id,
        'user_id': None
    }
    return render(request, 'intuit/fm/forwarder/add_forwarder_user.html', data)


@login_required
@user_passes_test(can_list_user)
def view_user(request, id: int):
    q = UserOrganizationMap.objects.filter(user_id=id)
    data = {
        'user_id': id,
        'org_id': q.first().organization.id if q.exists() else None
    }
    return render(request, 'intuit/fm/forwarder/add_forwarder_user.html', data)


@login_required
@forwarder_required
@user_passes_test(can_list_user)
def list_forwarder_users_page(request):
    data = {}
    return render(request, 'intuit/fm/forwarder/list_forwarder_user.html', data)


@login_required
@forwarder_required
def ajax_list_users_page_init_data(request):
    forwarder = user_org(request.user.id)

    resp = {
        'data': {
            'org': forwarder.dict(request),
            'user_list': [user_dict_for_user_list(user) for user in get_user_model().objects.all().order_by('id')
                          if UserOrganizationMap.objects.filter(organization=forwarder, user=user).exists()]
        }
    }
    return JsonResponse(resp)


@login_required
@forwarder_required
def ajax_create_user_form_init_data(request):
    from freightman.dictbuilders.user_management import user_dict
    from freightman.forms import UserOrgForm
    form = UserOrgForm(request.GET)
    form.is_valid()
    if form.cleaned_data.get('org_id', None):
        org = Organization.objects.get(id=form.cleaned_data.get('org_id', None))
    else:
        org = user_org(request.user.id)  # type: Organization

    if form.cleaned_data.get('user_id', None):
        user = get_user_model().objects.get(id=form.cleaned_data.get('user_id', None))
        uoq = UserOrganizationMap.objects.filter(user=user)
        org = uoq.first().organization if uoq.exists() else None
    else:
        user = None

    resp = {
        'data': {
            'auth_levels': [authperm.level_name for authperm in AuthLevelPermissions.objects.filter(organization=org)],
            'organization': org.dict(request) if org else {},
            'user': user_dict(user) if user else {}
        }
    }
    return JsonResponse(resp)


@login_required
@csrf_exempt
@forwarder_required
def ajax_create_user(request):
    form = UserUpdateForm(request.POST)
    result = {
        'success': False,
        'msg': '',
        'error': 'no data submit',
        'errors': {},
        'data': {
            'user_id': ''
        }
    }
    if form.is_valid():
        with transaction.atomic():
            org = Organization.objects.get(id=form.cleaned_data['org_id'])
            if form.cleaned_data['id']:
                user = get_user_model().objects.get(id=form.cleaned_data['id'])
                user.first_name = form.cleaned_data['firstname']
                user.last_name = form.cleaned_data['lastname']
                user.email = form.cleaned_data['email']
                user.save()
            else:
                user = get_user_model().objects.create_user(
                    username='user_{}'.format(time.time()),
                    email=form.cleaned_data['email'],
                    password=form.cleaned_data['password'],
                    first_name=form.cleaned_data['firstname'],
                    last_name=form.cleaned_data['lastname']
                )
                UserOrganizationMap.objects.create(organization=org, user=user)

            authperm = AuthLevelPermissions.objects.get(level_name=form.cleaned_data['auth_level_name'], organization_id=form.cleaned_data['org_id'])

            if UserAuthLevel.objects.filter(user=user).exists():
                userauth = UserAuthLevel.objects.get(user=user)
                userauth.auth_level = authperm
                userauth.save()
            else:
                UserAuthLevel.objects.create(user=user, auth_level=authperm)

            result['success'] = True
            result['msg'] = 'Success'
            result['error'] = ''
            result['data'] = {
                'user_id': user.id
            }
    else:
        result['success'] = False
        result['error'] = 'error in data validation'
        result['errors'] = form.errors

    return JsonResponse(result)
