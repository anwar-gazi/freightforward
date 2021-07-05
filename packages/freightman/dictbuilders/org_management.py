from freightman.models import Organization, AddressBook


def org_dict_for_edit_form(org: Organization):
    default_address = AddressBook.objects.filter(organization=org, is_default=True).first()  # type:AddressBook
    return {
        'id': org.id,
        'public_id': org.public_id,
        'address_id': default_address.id if default_address else '',

        'prefix': org.prefix,

        'has_default_address': not not default_address,

        'company_name': org.title,
        'address': default_address.address if default_address else '',
        'postcode': default_address.postcode if default_address else '',
        'city': default_address.city_id if default_address else '',
        'state': default_address.state if default_address else '',
        'country': default_address.country_id if default_address else '',
        'contact': default_address.contact if default_address else '',
        'tel_num': default_address.phone if default_address else '',
        'mobile_num': default_address.mobile if default_address else '',
        'fax_num': default_address.fax if default_address else '',
        'email': default_address.email if default_address else '',
    }
