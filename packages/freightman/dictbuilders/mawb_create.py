from freightman.models import Airwaybill, AWBAgent, Airline, AddressBook
from django.conf import settings


def addressbook_dict_for_mawb_create_page(addressbook: AddressBook):
    return {
        'id': addressbook.id,
        # 'organization': self.organization.dict(request),
        'company_name': addressbook.company_name,
        'address': addressbook.address,
        'postcode': addressbook.postcode,
        'city': addressbook.city.dict(),
        'state': addressbook.state,
        'country': addressbook.country.dict(),
        'contact': addressbook.contact,
        'phone': addressbook.phone,
        'mobile': addressbook.mobile,
        'fax': addressbook.fax,
        'email': addressbook.email
    }


def agent_dict_for_mawb_create_page(agent: AWBAgent):
    return {
        'id': agent.id,
        'addressbook': addressbook_dict_for_mawb_create_page(agent.addressbook) if agent.addressbook else '',
        'name': agent.addressbook.company_name,
        'city': agent.addressbook.city.dict(),
        'state': agent.addressbook.state,
        'country': agent.addressbook.country.dict(),
        'iata_code': agent.iata_code,
        'ffl_number': agent.ffl_number,
        'ffl_exp_date': agent.ffl_exp_date.strftime(settings.FRONTEND_DATE_FORMAT_2)
    }


def airline_dict_for_mawb_create_page(airline: Airline):
    return {
        'id': airline.id,
        'prefix_number': airline.prefix_number,
        'name': airline.name
    }


def awb_dict_for_mawb_create_page(awb: Airwaybill):
    return {
        'id': awb.id,
        'agent': agent_dict_for_mawb_create_page(awb.agent),
        'airline': airline_dict_for_mawb_create_page(awb.airline),
        'awb_serial': awb.awb_serial,
        'expire_date': awb.expire_date.strftime(settings.FRONTEND_DATE_FORMAT_HUMAN)
    }
