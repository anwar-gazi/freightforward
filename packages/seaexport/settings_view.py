from django.contrib.auth.decorators import login_required, user_passes_test
from freightman.user_test import can_access_site_settings
from freightman.decorators import forwarder_required
from django.shortcuts import render, reverse
from freightman.models import AddressBook
from freightman.user_helpers import user_org


@login_required
@forwarder_required
@user_passes_test(can_access_site_settings)
def settings_page(request):
    org = user_org(request.user.id)
    default_address = AddressBook.objects.filter(organization=org, is_default=True).first()
    data = {
        'org': org,
        'default_address': default_address,
        'org_edit_url': reverse('view_company', args=(org.public_id,))
    }
    return render(request, 'intuit/seaexport/forwarder/settings.html', data)
