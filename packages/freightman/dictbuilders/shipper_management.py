from freightman.models import Organization, AddressBook, UserOrganizationMap
from django.shortcuts import reverse
from django.contrib.auth import get_user_model
from freightman.dictbuilders.user_management import user_dict


def shipper_dict(request, shipper: Organization):
    default_address_q = AddressBook.objects.filter(organization=shipper, is_default=True)
    return {
        'id': shipper.id,
        'title': shipper.title,
        'active': shipper.active,
        'type': shipper.type,
        'is_supplier': shipper.is_supplier,
        'is_buyer': shipper.is_buyer,
        'is_factory': shipper.is_factory,
        'is_shipper': shipper.is_shipper,
        'public_id': shipper.ref,
        'booking_mail_sending_enabled': shipper.booking_mail_sending_enabled,
        'default_address': default_address_q.first().dict(request) if default_address_q.exists() else None,
        'add_user_url': reverse('add_selected_org_user_page', args=(shipper.id,)),
        'user_count': UserOrganizationMap.objects.filter(organization=shipper).count(),
        'user_list': [user_dict(m.user) for m in UserOrganizationMap.objects.filter(organization=shipper)],
        'view_url': reverse('view_company', args=(shipper.public_id,))
    }
