from freightman.models import Organization


def org_dict(org: Organization):
    return {
        'id': org.id,
        'title': org.title,
        'public_id': org.ref,
        'booking_mail_sending_enabled': org.booking_mail_sending_enabled
    }
