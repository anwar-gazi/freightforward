from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from freightman.user_test import can_access_airexport_gp_listing
from .decorators import forwarder_required, forwarder_superuser_required


@login_required
@forwarder_required
@user_passes_test(can_access_airexport_gp_listing)
def gp_listing_page(request):
    return render(request, 'intuit/fm/forwarder/gp_listing.html', {})
