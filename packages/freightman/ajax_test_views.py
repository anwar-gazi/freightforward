from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.conf import settings
import sys, os
import json


@login_required
def index(request):
    if request.GET['action'] == 'getlist_hawb_form_profile':
        profilefilenames = os.listdir(os.path.join(settings.BASE_DIR, 'data/form_profiles/hawb/'))  # type: list
        profiles = {}
        for filename in profilefilenames:
            filepath = os.path.join(settings.BASE_DIR, 'data/form_profiles/hawb/', filename)
            with open(filepath, 'r') as f:
                profiles[filename] = json.loads(f.read())
        return JsonResponse({
            'success': True,
            'data': {
                'hawb_form_profiles': profiles
            }
        })
    elif request.GET['action'] == 'getlist_mawb_form_profile':
        profilefilenames = os.listdir(os.path.join(settings.BASE_DIR, 'data/form_profiles/mawb/'))  # type: list
        profiles = {}
        for filename in profilefilenames:
            filepath = os.path.join(settings.BASE_DIR, 'data/form_profiles/mawb/', filename)
            with open(filepath, 'r') as f:
                profiles[filename] = json.loads(f.read())
        return JsonResponse({
            'success': True,
            'data': {
                'mawb_form_profiles': profiles
            }
        })

@login_required
def file_upload_test(request):
    pass