from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .decorators import forwarder_required
from .gp_list_dict import dict_for_gp_listing_table
from .models import Organization


@login_required
@forwarder_required
def get_gp_listing_page_init_data(request):
    resp = {
        'success': True,
        'data': {
            'gp_list_by_factory': [dict_for_gp_listing_table(org.id) for org in Organization.objects.filter(is_factory=True)]
        }
    }
    return JsonResponse(resp)
