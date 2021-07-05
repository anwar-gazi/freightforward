from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .forms import ShipperAddressForm, ShipperUserCreateForm, AddressForm, \
    BookingMainentryForm, BookingGoodsInfoForm, BookingGoodsReferencesForm, BookingStakeholderReferencesForm, BookingPortsinfoForm, BookingOrderNotesForm, \
    BookingPickupNotesForm, BookingCompletionForm, BookingShippingServiceForm
from .models import Organization, AddressBook, UserOrganizationMap, GoodsReferenceTypes, StakeholderReferenceTypes, PackageType, Currency, TransportAgreement, \
    FreightBooking, FreightBookingPartyAddress, FreightBookingPortInfo, FreightBookingGoodsInfo, FreightBookingGoodsReferences, FreightBookingStakeholderReference, \
    FreightBookingOrderNote, FreightBookingPickupNote, FreightBookingShippingService, Country, Airport, TermsofDelivery, City, Bank, BankBranch, FreightBookingBankBranch, \
    PaymentType
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from freightman.decorators import shipper_or_factory_required, forwarder_required
from freightman.user_helpers import user_org
from django.conf import settings
from datetime import datetime
import pytz
from django.core.mail import EmailMultiAlternatives
from freightman.booking_helpers import send_booking_notification_emails
from freightman.bank_forms import BookingBankForm, BookingBankBranchForm
from .public_id_helpers import type_1_public_id_to_model_id, type_1_public_id_to_model_id_exceptionfree


@login_required
def ajax_endpoint(request):
    pass


@login_required
@forwarder_required
def get_airexport_frtbookingpage_init_data(request):
    org = user_org(request.user.id)
    supplier = Organization.objects.get(id=type_1_public_id_to_model_id(request.GET.get('supplier_public_id', None))) if request.GET.get('supplier_public_id',
                                                                                                                                         None) else None
    data = {
        'success': True,
        'booking_by_forwarder': True,
        'org': supplier.dict(request)
        if supplier
        else {'public_id': '', 'title': ''},
        'supplier_list': [o.dict(request) for o in Organization.objects.filter(is_shipper=True)] if org.is_forwarder else [],
        'reference_types': [ref.dict(request) for ref in GoodsReferenceTypes.objects.all()],
        'stakeholder_reference_types': [ref.dict(request) for ref in StakeholderReferenceTypes.objects.all()],
        'package_types': [pak.dict(request) for pak in PackageType.objects.all()],
        'transport_agreements': [ta.dict(request) for ta in TransportAgreement.objects.all()],
        'currency': [curr.dict(request) for curr in Currency.objects.all()],
        'city_list': [city.dict() for city in City.objects.all()],
        'country_list': [country.dict() for country in Country.objects.all()],
        'airport_list': [ap.dict() for ap in Airport.objects.all()],
        'tod_list': [tod.dict() for tod in TermsofDelivery.objects.all()],
        'address_list': [add.dict(request) for add in AddressBook.objects.filter(organization=supplier)] if supplier else [],
        'bank_list': [branch.dict() for branch in BankBranch.objects.all()],
        'payment_type_list': [pt.dict() for pt in PaymentType.objects.all()]
    }
    return JsonResponse(data)


@login_required
@shipper_or_factory_required
def get_booking_form_data(request):
    org = user_org(request.user.id)
    data = {
        'success': True,
        'org': org.dict(request),
        'reference_types': [ref.dict(request) for ref in GoodsReferenceTypes.objects.all()],
        'stakeholder_reference_types': [ref.dict(request) for ref in StakeholderReferenceTypes.objects.all()],
        'package_types': [pak.dict(request) for pak in PackageType.objects.all()],
        'transport_agreements': [ta.dict(request) for ta in TransportAgreement.objects.all()],
        'currency': [curr.dict(request) for curr in Currency.objects.filter(default=True)],
        'city_list': [city.dict() for city in City.objects.all()],
        'country_list': [country.dict() for country in Country.objects.all()],
        'airport_list': [ap.dict() for ap in Airport.objects.all()],
        'tod_list': [tod.dict() for tod in TermsofDelivery.objects.all()],
        'address_list': [add.dict(request) for add in AddressBook.objects.filter(organization=org)],
        'bank_list': [branch.dict() for branch in BankBranch.objects.all()],
        'payment_type_list': [pt.dict() for pt in PaymentType.objects.all()]
    }
    return JsonResponse(data)


# @login_required
# @csrf_exempt
# @shipper_or_factory_required
# def save_shipper_address(request):
#     form = ShipperAddressForm(request.POST)
#     result = {
#         'success': False,
#         'error': '',
#         'errors': {}
#     }
#     if form.is_valid():
#         org = Organization.objects.get(id=form.cleaned_data['shipper_id'])
#         addr, _addrcreated = AddressBook.objects.get_or_create(
#             organization=org,
#             company_name=form.cleaned_data['company_name'],
#             address=form.cleaned_data['address'],
#             postcode=form.cleaned_data['postcode'],
#             city_id=form.cleaned_data['city'],
#             state=form.cleaned_data['state'],
#             country=form.cleaned_data['country'],
#             contact=form.cleaned_data['contact'],
#             phone=form.cleaned_data['tel_num'],
#             mobile=form.cleaned_data['mobile_num'],
#             fax=form.cleaned_data['fax_num'],
#             email=form.cleaned_data['email']
#         )
#         addr.is_shipper = True
#         addr.save()
#         result['success'] = True
#     else:
#         result['error'] = 'error in data validation. ' + ','.join(form.non_field_errors())
#         result['errors'] = form.errors
#
#     return JsonResponse(result)
#
#
# def _save_address(formdata):
#     form = AddressForm(formdata)
#     result = {
#         'success': False,
#         'msg': [],
#         'errors': [],
#         'form_errors': {},
#         'data': {
#             'address_id': ''
#         }
#     }
#     if form.is_valid():
#         if form.cleaned_data['address_type'] == 'shipper':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_shipper=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'consignee':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_consignee=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'consignor':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_consignor=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'pickup':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_pickup=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'delivery':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_delivery=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#     else:
#         result['errors'] = form.non_field_errors()
#         result['form_errors'] = form.errors
#
#     return result['success'], result['msg'], result['errors'], result['form_errors'], result['data']['address_id']
#
#
# @login_required
# @csrf_exempt
# def shipper_save_address(request):
#     form = AddressForm(request.POST)
#     result = {
#         'success': False,
#         'msg': [],
#         'errors': [],
#         'form_errors': {},
#         'data': {
#             'address_id': None
#         }
#     }
#     if form.is_valid():
#         if form.cleaned_data['address_type'] == 'shipper':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_shipper=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'consignee':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_consignee=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'consignor':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_consignor=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'pickup':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_pickup=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#         elif form.cleaned_data['address_type'] == 'delivery':
#             org = Organization.objects.get(id=form.cleaned_data['org_id'])
#             addr, _addrcreated = AddressBook.objects.get_or_create(
#                 organization=org,
#                 company_name=form.cleaned_data['company_name'],
#                 address=form.cleaned_data['address'],
#                 postcode=form.cleaned_data['postcode'],
#                 city_id=form.cleaned_data['city'],
#                 state=form.cleaned_data['state'],
#                 country=form.cleaned_data['country'],
#                 contact=form.cleaned_data['contact'],
#                 phone=form.cleaned_data['tel_num'],
#                 mobile=form.cleaned_data['mobile_num'],
#                 fax=form.cleaned_data['fax_num'],
#                 email=form.cleaned_data['email'],
#                 is_delivery=True
#             )
#             result['success'] = True
#             result['data']['address_id'] = addr.id
#     else:
#         result['errors'] = form.non_field_errors()
#         result['form_errors'] = form.errors
#
#     return JsonResponse(result)


@login_required
@forwarder_required
def register_factory_init_data(request):
    from freightman.forms import OrgPublicIDForm
    from freightman.dictbuilders.org_management import org_dict_for_edit_form
    form = OrgPublicIDForm(request.GET)
    if form.is_valid():
        org = Organization.objects.get(id=form.org_id)
    else:
        org = None
    return JsonResponse({
        'data': {
            'country_list': [country.dict() for country in Country.objects.all()],
            'city_list': [city.dict() for city in City.objects.all()],
            'org_dict': org_dict_for_edit_form(org) if org else {}
        }
    })


@login_required
@csrf_exempt
@forwarder_required
def register_factory(request):
    from freightman.models import AuthLevelPermissions, ServiceProviderMap
    from freightman.forms import OrgCreateForm
    orgform = OrgCreateForm(request.POST)
    form = AddressForm(request.POST)
    orgform.fields['company_name'].required = False
    orgform.fields['prefix'].required = False
    form.fields['org_id'].required = False
    form.fields['contact'].required = False
    form.fields['booking_id'].required = False
    form.fields['operation'].required = False
    result = {
        'success': False,
        'msg': '',
        'error': 'no data submit',
        'errors': {},
        'data': {
            'shipper_id': '',
            'address_id': '',
            'auth_levels': []
        }
    }
    forwarder = user_org(request.user.id)
    if form.is_valid() and orgform.is_valid():
        with transaction.atomic():
            if orgform.cleaned_data.get('id', None):  # update
                org = Organization.objects.get(id=orgform.cleaned_data['id'])
                org.title = form.cleaned_data['company_name']
                org.prefix = form.cleaned_data['prefix']
                org.is_supplier = True
                org.save()
                ServiceProviderMap.objects.get_or_create(service_provider_org=forwarder, customer_org=org)
            else:  # create
                org = Organization.objects.create(title=form.cleaned_data['company_name'], prefix=form.cleaned_data['prefix'], is_shipper=True, is_factory=True, is_supplier=True)
                ServiceProviderMap.objects.create(service_provider_org=forwarder, customer_org=org)

            address, _addrcreated = AddressBook.objects.get_or_create(
                organization=org,
                company_name=form.cleaned_data['company_name'],
                address=form.cleaned_data['address'],
                postcode=form.cleaned_data['postcode'],
                city_id=form.cleaned_data['city'],
                state=form.cleaned_data['state'],
                country_id=form.cleaned_data['country'],
                contact=form.cleaned_data['contact'],
                phone=form.cleaned_data['tel_num'],
                mobile=form.cleaned_data['mobile_num'],
                fax=form.cleaned_data['fax_num'],
                email=form.cleaned_data['email']
            )

            if _addrcreated:
                address.is_shipper = True
            address.is_default = True
            address.save()

            # auth_level = AuthLevelPermissions.objects.create(organization=org, level_name='Admin')

            result['success'] = True
            result['msg'] = 'Save Success. {}'.format('Default address created' if _addrcreated else '')
            result['error'] = ''
            result['data'] = {
                'shipper_id': org.id,
                'address_id': address.id,
                'auth_levels': []
            }
    else:
        result['success'] = False
        result['error'] = 'error in data validation'
        result['errors'] = form.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
@forwarder_required
def register_factory_user(request):
    from freightman.models import AuthLevelPermissions, UserAuthLevel
    import time
    form = ShipperUserCreateForm(request.POST)
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
            org = Organization.objects.get(id=form.cleaned_data['shipper_id'])
            user = get_user_model().objects.create_user(
                username='user_{}'.format(time.time()),
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
                first_name=form.cleaned_data['firstname'],
                last_name=form.cleaned_data['lastname']
            )

            UserOrganizationMap.objects.get_or_create(organization=org, user=user)

            authperm = AuthLevelPermissions.objects.get(id=form.cleaned_data['auth_level_id'])

            if UserAuthLevel.objects.filter(user=user).exists():
                userauth = UserAuthLevel.objects.get(user=user)
                userauth.auth_level = authperm
                userauth.save()
            else:
                UserAuthLevel.objects.create(user=user, auth_level=authperm)

            result['success'] = True
            result['msg'] = 'Success, user created'
            result['error'] = ''
            result['data'] = {
                'user_id': user.id
            }
    else:
        result['success'] = False
        result['error'] = 'error in data validation'
        result['errors'] = form.errors

    return JsonResponse(result)


@login_required
@forwarder_required
def get_shipper_list(request):
    from django.shortcuts import reverse
    from freightman.dictbuilders.shipper_management import shipper_dict
    result = {
        'success': False,
        'msg': '',
        'error': 'no data submit',
        'errors': {},
        'data': {
            'shipper_list': [shipper_dict(request, org) for org in Organization.objects.filter(is_shipper=True, active=True).order_by('-id')]
        }
    }

    return JsonResponse(result)


@login_required
@csrf_exempt
def save_bank_info(request):
    resp = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'branch_id': ''
        }
    }
    bankform = BookingBankForm(request.POST)
    branchform = BookingBankBranchForm(request.POST)
    with transaction.atomic():
        if bankform.is_valid() and branchform.is_valid():
            # org = user_org(request.user.id)
            booking = FreightBooking.objects.get(id=bankform.cleaned_data['booking_id'])

            # update bank info
            if branchform.cleaned_data['branch_id']:
                bank = BankBranch.objects.get(id=bankform.cleaned_data['branch_id']).bank
                bank.bank_name = bankform.cleaned_data['bank_name']
                bank.save()
                resp['msg'].append('bank {} info updated'.format(bank.bank_name))
            else:
                bank = Bank.objects.create(bank_name=bankform.cleaned_data['bank_name'], added_by=request.user)
                resp['msg'].append('bank {} info created')

            # update branch info
            if branchform.cleaned_data['branch_id']:
                branch = BankBranch.objects.get(id=branchform.cleaned_data['branch_id'])
                branch.branch_name = branchform.cleaned_data['branch_name']
                branch.branch_address = branchform.cleaned_data['branch_address']
                branch.save()
                resp['msg'].append('Bank {} branch {} updated'.format(branch.bank.bank_name, branch.branch_name))
            else:
                branch = BankBranch.objects.create(bank=bank, branch_name=branchform.cleaned_data['branch_name'],
                                                   branch_address=branchform.cleaned_data['branch_address'],
                                                   added_by=request.user)
                resp['msg'].append('Bank {} branch {} created'.format(branch.bank.bank_name, branch.branch_name))

            FreightBookingBankBranch.objects.filter(booking=booking,
                                                    in_origin_leg=branchform.cleaned_data['in_origin_leg'],
                                                    in_destination_leg=branchform.cleaned_data['in_destination_leg']).delete()
            bookingbranchlink = FreightBookingBankBranch.objects.create(booking=booking, bank_branch=branch,
                                                                        in_origin_leg=branchform.cleaned_data['in_origin_leg'],
                                                                        in_destination_leg=branchform.cleaned_data['in_destination_leg'],
                                                                        notify=branchform.cleaned_data['notify'])

            resp['msg'].append('Branch mapped to freight booking {} in {}. mapping id {}'.format(booking.id, 'origin leg' if branchform.cleaned_data['in_origin_leg'] else
            'destination leg', bookingbranchlink.id))
            resp['success'] = True
            resp['data']['branch_id'] = branch.id
        else:
            resp['success'] = False
            resp['misc_errors'] = bankform.non_field_errors() + branchform.non_field_errors()
            resp['form_errors'] = {**bankform.errors, **branchform.errors}
    return JsonResponse(resp)


@login_required
@csrf_exempt
def shipper_booking_save_address(request):
    with transaction.atomic():
        addressform = AddressForm(request.POST)
        addressform.fields['prefix'].required = False
        if addressform.is_valid():
            print(addressform.cleaned_data)
            booking = FreightBooking.objects.get(id=addressform.cleaned_data['booking_id'])
            if addressform.is_create():
                # print('create')
                addr = AddressBook.objects.create(
                    organization_id=addressform.cleaned_data['org_id'],
                    company_name=addressform.cleaned_data['company_name'],
                    address=addressform.cleaned_data['address'],
                    postcode=addressform.cleaned_data['postcode'],
                    city_id=addressform.cleaned_data['city'],
                    state=addressform.cleaned_data['state'],
                    country_id=addressform.cleaned_data['country'],
                    contact=addressform.cleaned_data['contact'],
                    phone=addressform.cleaned_data['tel_num'],
                    mobile=addressform.cleaned_data['mobile_num'],
                    fax=addressform.cleaned_data['fax_num'],
                    email=addressform.cleaned_data['email'],
                    is_shipper=addressform.cleaned_data['is_shipper'],
                    is_consignee=addressform.cleaned_data['is_consignee'],
                    is_consignor=addressform.cleaned_data['is_consignor'],
                    is_pickup=addressform.cleaned_data['is_pickup'],
                    is_delivery=addressform.cleaned_data['is_delivery']
                )
                result = {
                    'success': True,
                    'msg': ['address created'],
                    'errors': [],
                    'form_errors': {},
                    'data': {
                        'address_id': addr.id
                    }
                }
            else:
                addr = AddressBook.objects.get(id=addressform.cleaned_data['address_id'])

                addr.company_name = addressform.cleaned_data['company_name']
                addr.address = addressform.cleaned_data['address']
                addr.postcode = addressform.cleaned_data['postcode']
                addr.city_id = addressform.cleaned_data['city']
                addr.state = addressform.cleaned_data['state']
                addr.country_id = addressform.cleaned_data['country']
                addr.contact = addressform.cleaned_data['contact']
                addr.phone = addressform.cleaned_data['tel_num']
                addr.mobile = addressform.cleaned_data['mobile_num']
                addr.fax = addressform.cleaned_data['fax_num']
                addr.email = addressform.cleaned_data['email']

                addr.is_shipper = True if addressform.cleaned_data['is_shipper'] else False
                addr.is_consignee = True if addressform.cleaned_data['is_consignee'] else False
                addr.is_consignor = True if addressform.cleaned_data['is_consignor'] else False
                addr.is_pickup = True if addressform.cleaned_data['is_pickup'] else False
                addr.is_delivery = True if addressform.cleaned_data['is_delivery'] else False

                addr.save()

                result = {
                    'success': True,
                    'msg': ['address updated'],
                    'errors': [],
                    'form_errors': {},
                    'data': {
                        'address_id': addr.id
                    }
                }
            # now link to the booking entry
            FreightBookingPartyAddress.objects.filter(booking=booking, addressbook_id=addr.id).delete()
            link = FreightBookingPartyAddress.objects.create(booking=booking, addressbook_id=addr.id)
            link.notify = True if addressform.cleaned_data['booking_notify'] else False
            link.is_shipper = True if addressform.cleaned_data['is_shipper'] else False
            link.is_consignee = True if addressform.cleaned_data['is_consignee'] else False
            link.is_default_consignee = True if addressform.cleaned_data['is_default_consignee'] else False
            link.is_consignor = True if addressform.cleaned_data['is_consignor'] else False
            link.is_pickup = True if addressform.cleaned_data['is_pickup'] else False
            link.is_delivery = True if addressform.cleaned_data['is_delivery'] else False
            link.save()
        else:
            result = {
                'success': False,
                'msg': [],
                'errors': addressform.non_field_errors(),
                'form_errors': addressform.errors,
                'data': {
                    'address_id': ''
                }
            }
    return JsonResponse(result)


@login_required
@csrf_exempt
def shipper_booking_main_entry(request):
    from datetime import datetime, timedelta
    import pytz
    FreightBooking.objects.filter(entry_complete=False, entry_at__lte=datetime.now(pytz.utc) - timedelta(hours=5)).delete()
    result = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': {},
        'data': {
            'booking_id': ''
        }
    }

    with transaction.atomic():
        bookingform = BookingMainentryForm(request.POST)
        if bookingform.is_valid():
            if bookingform.is_create():
                booking = FreightBooking.objects.create(org_id=bookingform.cleaned_data['org_id'],
                                                        is_draft=bookingform.is_draft,
                                                        is_booking_confirmed=bookingform.is_booking_confirm,
                                                        entry_by=request.user,
                                                        edd=bookingform.cleaned_data['edd']
                                                        )
                result['success'] = True
                result['msg'] = ['Booking database process start:insert']
                result['data']['booking_id'] = booking.id
            elif bookingform.is_update():
                booking = FreightBooking.objects.get(id=bookingform.cleaned_data['booking_id'])
                booking.is_draft = bookingform.is_draft
                booking.is_booking_confirmed = bookingform.is_booking_confirm
                booking.edd = bookingform.cleaned_data['edd']
                booking.save()
                result['success'] = True
                result['msg'] = ['Booking database process start:update']
                result['data']['booking_id'] = booking.id
        else:
            result['success'] = False
            result['errors'] = bookingform.non_field_errors()
            result['form_errors'] = bookingform.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_portsinfo_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }
    print(request.body)
    with transaction.atomic():
        portsinfoform = BookingPortsinfoForm(request.POST)
        if portsinfoform.is_valid():
            booking = FreightBooking.objects.get(id=portsinfoform.cleaned_data['booking_id'])
            if portsinfoform.is_create():
                portsinfo = FreightBookingPortInfo.objects.create(booking=booking,
                                                                  port_of_destination_id=portsinfoform.cleaned_data['port_of_dest'],
                                                                  port_of_loading_id=portsinfoform.cleaned_data['port_of_load'],
                                                                  terms_of_delivery_id=portsinfoform.cleaned_data['terms_of_deliv'],
                                                                  country_of_destination_id=portsinfoform.cleaned_data['country_of_dest']
                                                                  )
                result['msg'] = ['entry created']
            else:
                portsinfo = FreightBookingPortInfo.objects.get(id=portsinfoform.cleaned_data['portinfo_id'])
                portsinfo.port_of_destination_id = portsinfoform.cleaned_data['port_of_dest']
                portsinfo.port_of_loading_id = portsinfoform.cleaned_data['port_of_load']
                portsinfo.terms_of_delivery_id = portsinfoform.cleaned_data['terms_of_deliv']
                portsinfo.country_of_destination_id = portsinfoform.cleaned_data['country_of_dest']
                portsinfo.save()
                result['msg'] = ['entry updated']
            result['success'] = True
            result['data']['id'] = portsinfo.id
        else:
            result['success'] = False
            result['misc_errors'] = portsinfoform.non_field_errors()
            result['form_errors'] = portsinfoform.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_goodsinfo_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        goodsinfoform = BookingGoodsInfoForm(request.POST)
        if goodsinfoform.is_valid():
            booking = FreightBooking.objects.get(id=goodsinfoform.cleaned_data['booking_id'])
            if goodsinfoform.is_create():
                goodsinfo = FreightBookingGoodsInfo.objects.create(
                    booking=booking,
                    no_of_pieces=goodsinfoform.cleaned_data['no_of_pieces'],
                    package_type_id=goodsinfoform.cleaned_data['package_type'],
                    weight_kg=goodsinfoform.cleaned_data['weight_kg'],
                    chargable_weight=goodsinfoform.cleaned_data['chargable_weight'],
                    volumetric_weight=goodsinfoform.cleaned_data['volumetric_weight'],
                    cbm=goodsinfoform.cleaned_data['cbm'],
                    length_cm=goodsinfoform.cleaned_data['length_cm'],
                    width_cm=goodsinfoform.cleaned_data['width_cm'],
                    height_cm=goodsinfoform.cleaned_data['height_cm'],
                    quantity=goodsinfoform.cleaned_data['quantity'],
                    unit_price=goodsinfoform.cleaned_data['unit_price'],
                    currency_id=goodsinfoform.cleaned_data['currency'],
                    shipping_mark=goodsinfoform.cleaned_data['shipping_mark'],
                    goods_desc=goodsinfoform.cleaned_data['goods_desc'],
                )
                result['msg'] = ['goods entry created']
            else:
                goodsinfo = FreightBookingGoodsInfo.objects.get(id=goodsinfoform.cleaned_data['id'], booking=booking)
                goodsinfo.no_of_pieces = goodsinfoform.cleaned_data['no_of_pieces']
                goodsinfo.package_type_id = goodsinfoform.cleaned_data['package_type']
                goodsinfo.weight_kg = goodsinfoform.cleaned_data['weight_kg']
                goodsinfo.chargable_weight = goodsinfoform.cleaned_data['chargable_weight']
                goodsinfo.volumetric_weight = goodsinfoform.cleaned_data['volumetric_weight']
                goodsinfo.cbm = goodsinfoform.cleaned_data['cbm']
                goodsinfo.length_cm = goodsinfoform.cleaned_data['length_cm']
                goodsinfo.width_cm = goodsinfoform.cleaned_data['width_cm']
                goodsinfo.height_cm = goodsinfoform.cleaned_data['height_cm']
                goodsinfo.quantity = goodsinfoform.cleaned_data['quantity']
                goodsinfo.unit_price = goodsinfoform.cleaned_data['unit_price']
                goodsinfo.currency_id = goodsinfoform.cleaned_data['currency']
                goodsinfo.shipping_mark = goodsinfoform.cleaned_data['shipping_mark']
                goodsinfo.goods_desc = goodsinfoform.cleaned_data['goods_desc']
                goodsinfo.save()
                result['msg'] = ['goods entry updated']
            result['success'] = True
            result['data']['id'] = goodsinfo.id
        else:
            result['success'] = False
            result['misc_errors'] = goodsinfoform.non_field_errors()
            result['form_errors'] = goodsinfoform.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_goodsinfo_reference_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        goodsrefform = BookingGoodsReferencesForm(request.POST)
        if goodsrefform.is_valid():
            if goodsrefform.is_create():
                ref = FreightBookingGoodsReferences.objects.create(
                    goodsinfo_id=goodsrefform.cleaned_data['goodsinfo_id'],
                    reference_type_id=goodsrefform.cleaned_data['ref_type_id'],
                    reference_number=goodsrefform.cleaned_data['ref_number']
                )
                result['msg'] = ['goods reference entry created']
            else:
                ref = FreightBookingGoodsReferences.objects.get(goodsinfo_id=goodsrefform.cleaned_data['goodsinfo_id'], id=goodsrefform.cleaned_data['id'])
                ref.reference_type_id = goodsrefform.cleaned_data['ref_type_id']
                ref.reference_number = goodsrefform.cleaned_data['ref_number']
                ref.save()
                result['msg'] = ['goods reference entry updated']
            result['success'] = True
            result['data']['id'] = ref.id
        else:
            result['success'] = False
            result['misc_errors'] = goodsrefform.non_field_errors()
            result['form_errors'] = goodsrefform.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_shippingservice_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        form = BookingShippingServiceForm(request.POST)
        if form.is_valid():
            if form.is_create():
                serviceobj = FreightBookingShippingService.objects.create(
                    booking_id=form.cleaned_data['booking_id'],
                    service=form.cleaned_data['service']
                )
                result['msg'] = ['shipping service entry created. #b{}i{}'.format(serviceobj.booking_id, serviceobj.id)]
            else:
                serviceobj = FreightBookingShippingService.objects.get(id=form.cleaned_data['id'], booking_id=form.cleaned_data['booking_id'])
                serviceobj.service = form.cleaned_data['service']
                serviceobj.save()
                result['msg'] = ['shipping service entry updated. b{}i{}'.format(serviceobj.booking_id, serviceobj.id)]
            result['success'] = True
            result['data']['id'] = serviceobj.id
        else:
            result['success'] = False
            result['misc_errors'] = form.non_field_errors()
            result['form_errors'] = form.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_stakeholder_reference_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        form = BookingStakeholderReferencesForm(request.POST)
        if form.is_valid():
            if form.is_create():
                ref = FreightBookingStakeholderReference.objects.create(
                    booking_id=form.cleaned_data['booking_id'],
                    reference_type_id=form.cleaned_data['ref_type_id'],
                    reference_number=form.cleaned_data['ref_number']
                )
                result['msg'] = ['stakeholder reference entry create. b{}i{}'.format(ref.booking_id, ref.id)]
            else:
                ref = FreightBookingStakeholderReference.objects.get(booking_id=form.cleaned_data['booking_id'], id=form.cleaned_data['id'])
                ref.reference_type_id = form.cleaned_data['ref_type_id']
                ref.reference_number = form.cleaned_data['ref_number']
                result['msg'] = ['stakeholder reference entry update. b{}i{}'.format(ref.booking_id, ref.id)]
            result['success'] = True
            result['data']['id'] = ref.id
        else:
            result['success'] = False
            result['misc_errors'] = form.non_field_errors()
            result['form_errors'] = form.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_order_notes_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        form = BookingOrderNotesForm(request.POST)
        if form.is_valid():
            if form.is_create():
                note = FreightBookingOrderNote.objects.create(
                    booking_id=form.cleaned_data['booking_id'],
                    payment_instruction_id=form.cleaned_data['payment_ins_id'],
                    transport_agreement_id=form.cleaned_data['transport_agreement_id'],
                    delivery_instruction=form.cleaned_data['delivery_instruction']
                )
                result['msg'] = ['order notes entry create. b{}i{}'.format(note.booking_id, note.id)]
            else:
                note = FreightBookingOrderNote.objects.get(booking_id=form.cleaned_data['booking_id'], id=form.cleaned_data['id'])
                note.payment_instruction_id = form.cleaned_data['payment_ins_id']
                note.transport_agreement_id = form.cleaned_data['transport_agreement_id']
                note.delivery_instruction = form.cleaned_data['delivery_instruction']
                note.save()
                result['msg'] = ['order notes entry update. b{}i{}'.format(note.booking_id, note.id)]
            result['success'] = True
            result['data']['id'] = note.id
        else:
            result['success'] = False
            result['misc_errors'] = form.non_field_errors()
            result['form_errors'] = form.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def do_booking_pickup_notes_entry(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }

    with transaction.atomic():
        form = BookingPickupNotesForm(request.POST)
        if form.is_valid():
            if form.is_create():
                note = FreightBookingPickupNote.objects.create(
                    booking_id=form.cleaned_data['booking_id'],
                    pickup_date=form.cleaned_data['pickup_date'],
                    pickup_time_early=form.cleaned_data['pickup_time_early'],
                    pickup_time_latest=form.cleaned_data['pickup_time_latest'],
                    pickup_instruction=form.cleaned_data['pickup_instruction']
                )
                result['msg'] = ['pickup notes entry created. b{}i{}'.format(note.booking_id, note.id)]

                result['data']['id'] = note.id
                result['success'] = True
            elif form.is_update():
                note = FreightBookingPickupNote.objects.get(booking_id=form.cleaned_data['booking_id'])
                note.pickup_date = form.cleaned_data['pickup_date']
                note.pickup_time_early = form.cleaned_data['pickup_time_early']
                note.pickup_time_latest = form.cleaned_data['pickup_time_latest']
                note.pickup_instruction = form.cleaned_data['pickup_instruction']
                note.save()
                result['msg'] = ['pickup notes entry updated. b{}i{}'.format(note.booking_id, note.id)]

                result['data']['id'] = note.id
                result['success'] = True
        else:
            result['success'] = False
            result['misc_errors'] = form.non_field_errors()
            result['form_errors'] = form.errors

    return JsonResponse(result)


@login_required
@csrf_exempt
def booking_entry_completion(request):
    result = {
        'success': False,
        'msg': [],
        'misc_errors': [],
        'form_errors': {},
        'data': {
            'globalid': ''
        }
    }

    with transaction.atomic():
        form = BookingCompletionForm(request.POST)
        if form.is_valid():
            booking = FreightBooking.objects.get(id=form.cleaned_data['booking_id'])
            if form.is_delete():
                booking.delete()
                result['msg'] = 'booking entry unconfirmed'
            else:
                booking.entry_complete = True
                booking.save()

                globalid = booking.globalid

                result['data']['globalid'] = globalid

                if booking.is_booking_confirmed:
                    booking.confirmed_at = datetime.now(pytz.utc)
                    booking.confirmed_by = request.user
                    booking.save()
                    result['msg'].append('booking #{} confirmed'.format(globalid))

                    notify_emails = send_booking_notification_emails(request, booking.id)
                    if notify_emails:
                        result['msg'].append('booking #{}: notification email sent to {}'.format(globalid, notify_emails))
                else:
                    result['msg'].append('booking registered')

                result['success'] = True
        else:
            result['success'] = False
            result['misc_errors'] = form.non_field_errors()
            result['form_errors'] = form.errors

    return JsonResponse(result)


@login_required
@forwarder_required
def booking_list_by_system_owner(request):
    import math
    from freightman.dict_builders import booking_dict
    from freightman.forms import PaginationForm

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    needle = paginationform.cleaned_data.get('needle', None)
    q_key_dict = {}
    if needle:

        booking_id, has_id = type_1_public_id_to_model_id_exceptionfree(needle)
        if has_id:
            q_key_dict = {
                'id': booking_id
            }
        else:
            supplier_q = Organization.objects.filter(title__icontains=needle.lower(), is_supplier=True)
            if supplier_q.exists():
                q_key_dict = {
                    'org__title__icontains': needle.lower()
                }

    query = FreightBooking.objects.filter(entry_complete=True, **q_key_dict).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for booking in query[entry_start:entry_end]:
        listing.append(booking_dict(request, booking.id))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'booking_list': listing,
        }
    })


@login_required
def booking_list_by_shipper(request):
    import math
    from freightman.dict_builders import booking_dict
    from freightman.forms import PaginationForm

    shipper = user_org(request.user.id)

    paginationform = PaginationForm(request.GET)
    paginationform.is_valid()

    page = paginationform.cleaned_data['page'] or 1
    entry_per_page = 100
    entry_start = (page - 1) * entry_per_page
    entry_end = page * entry_per_page

    needle = paginationform.cleaned_data.get('needle', None)
    q_key_dict = {}
    if needle:

        booking_id, has_id = type_1_public_id_to_model_id_exceptionfree(needle)
        if has_id:
            q_key_dict = {
                'id': booking_id
            }
        else:
            supplier_q = Organization.objects.filter(title__icontains=needle.lower(), is_supplier=True)
            if supplier_q.exists():
                q_key_dict = {
                    'org__title__icontains': needle.lower()
                }

    query = FreightBooking.objects.filter(entry_complete=True, **q_key_dict, org=shipper).order_by('-id')

    total_entry = len(query)
    number_of_page = math.ceil(total_entry / entry_per_page)

    listing = []
    for booking in query[entry_start:entry_end]:
        listing.append(booking_dict(request, booking.id))

    return JsonResponse({
        'success': True,
        'data': {
            'pagination': {
                'total_entry': total_entry,
                'number_of_page': number_of_page,
                'page': page,
                'entry_per_page': entry_per_page
            },
            'booking_list': listing,
        }
    })


@login_required
@csrf_exempt
def mark_as_booked(request):
    from freightman.forms import BookingEDDSetForm
    from freightman.booking_helpers import send_booking_notification_emails
    result = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': [],
        'data': {

        }
    }
    form = BookingEDDSetForm(request.POST)

    if form.is_valid():
        with transaction.atomic():
            booking = FreightBooking.objects.get(id=form.cleaned_data['id'])
            booking.is_draft = False
            booking.is_booking_confirmed = True
            booking.edd = form.cleaned_data['edd']
            booking.confirmed_by = request.user
            booking.confirmed_at = datetime.now(pytz.utc)
            booking.save()

            result['msg'].append('booking #{} confirmed.'.format(booking.globalid))

            notify_emails = send_booking_notification_emails(request, booking.id)

            result['success'] = True
            result['msg'].append('Notification email sent to {}'.format(','.join(notify_emails) if notify_emails and len(notify_emails) else 'None'))
    else:
        result['success'] = False
        result['errors'] = form.non_field_errors()
        result['form_errors'] = form.errors

    return JsonResponse(result)


def health_checkup(request):
    # check whether default currency defined
    pass


@login_required
@csrf_exempt
def add_city(request):
    from freightman.forms import CityForm
    form = CityForm(request.POST)
    resp = {
        'success': False,
        'errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }
    if form.is_valid():
        city = form.save()
        resp['success'] = True
        resp['data']['id'] = city.id
    else:
        resp['success'] = False
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
    return JsonResponse(resp)


@login_required
@csrf_exempt
def add_country(request):
    from freightman.forms import CountryForm
    form = CountryForm(request.POST)
    resp = {
        'success': False,
        'errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }
    if form.is_valid():
        country = form.save()
        resp['success'] = True
        resp['data']['id'] = country.id
    else:
        resp['success'] = False
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
    return JsonResponse(resp)


@login_required
@csrf_exempt
def add_seaport(request):
    from freightman.forms import SeaPortForm
    form = SeaPortForm(request.POST)
    resp = {
        'success': False,
        'errors': [],
        'form_errors': {},
        'data': {
            'id': ''
        }
    }
    if form.is_valid():
        port = form.save()
        resp['success'] = True
        resp['data']['id'] = port.id
    else:
        resp['success'] = False
        resp['errors'] = form.non_field_errors()
        resp['form_errors'] = form.errors
    return JsonResponse(resp)
