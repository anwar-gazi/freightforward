from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from freightman.decorators import forwarder_required, shipper_or_factory_required
from freightman.user_helpers import user_org
from freightman.models import GoodsReferenceTypes, StakeholderReferenceTypes, Currency, City, Country, AddressBook, Bank, BankBranch, PaymentType, Organization
from seaexport.models import SeaPort, SeaExportPackageType, SeaTermsofDelivery, SeaTransportAgreement, SeaExportFreightBooking, \
    SeaExportFreightBookingGoodsInfo, SeaExportFreightBookingStakeholderReferenceTypes, SeaExportFreightBookingMoreAddressMap, SeaExportFreightBookingNotifyAddress, \
    SeaExportFreightBookingAttachedFile, SeaExportFreightBookingGoodsReference
from freightman.public_id_helpers import type_1_public_id_to_model_id
from seaexport.dictbuilder.forwarder_frt_book import org_dict
from seaexport.forms import SeaExportFrtBookingForm, SeaExportFrtAddressForm, SeaExportFrtBankForm, SeaExportFrtGoodsForm, SeaExportFrtStakeholderRefForm, \
    SeaExportFrtGoodsRefForm
from freightman.forms import PublicIDForm
from django.db import transaction
from freightman.public_id_helpers import type_1_public_id_to_model_id
from seaexport.booking_helpers import view_booking_email_body, send_booking_notification_emails
from seaexport.dictbuilder.booking import booking_dict
from freightman.exceptions import CustomException
from freightman.filehelpers import truncate_filename
from datetime import datetime
from django.conf import settings
import urllib.parse
import pytz
import json
import os


@login_required
def get_booking_info(request):
    form = PublicIDForm(request.GET)
    resp = {
        'success': False,
        'errors': [],
        'data': {
            'booking_dict': ''
        }
    }
    if form.is_valid():
        resp['success'] = True
        resp['data']['booking_dict'] = booking_dict(request, SeaExportFreightBooking.objects.get(id=form.id))
    else:
        resp['success'] = False
        resp['errors'].append('public id invalid')
    return JsonResponse(resp)


@login_required
@forwarder_required
def get_booking_page_init_data(request):
    forwarder = user_org(request.user.id)
    supplier = Organization.objects.get(id=type_1_public_id_to_model_id(request.GET.get('supplier_public_id', None))) if request.GET.get('supplier_public_id',
                                                                                                                                         None) else None
    data = {
        'forwarder': org_dict(forwarder),
        'supplier': org_dict(supplier) if supplier else {},
        'supplier_list': [org_dict(org) for org in Organization.objects.filter(is_factory=True).order_by('id')],
        'currency_list': [curr.dict(request) for curr in Currency.objects.all().order_by('id') if curr.default],
        'transport_agreement_list': [ta.dict(request) for ta in SeaTransportAgreement.objects.all().order_by('id')],
        'country_list': [country.dict() for country in Country.objects.all().order_by('id')],
        'city_list': [city.dict() for city in City.objects.all().order_by('id')],
        'supplier_address_list': [add.dict(request) for add in AddressBook.objects.filter(organization=supplier).order_by('id')] if supplier else [],
        'bank_branch_list': [branch.dict() for branch in BankBranch.objects.all().order_by('id')],
        'sea_port_list': [sp.dict() for sp in SeaPort.objects.all().order_by('id')],
        'tod_list': [tod.dict() for tod in SeaTermsofDelivery.objects.all().order_by('id')],
        'package_type_list': [pak.dict() for pak in SeaExportPackageType.objects.all().order_by('id')],
        'payment_type_list': [pt.dict() for pt in PaymentType.objects.all().order_by('id')],
        'goods_ref_type_list': [ref.dict(request) for ref in GoodsReferenceTypes.objects.all().order_by('-id')],
        'stakeholder_ref_type_list': [ref.dict(request) for ref in StakeholderReferenceTypes.objects.all().order_by('id')],
    }
    return JsonResponse(data)


@login_required
@csrf_exempt
@forwarder_required
def save_booking_by_forwarder(request):
    forwarder = user_org(request.user.id)
    return save_booking(request, forwarder)


@login_required
@csrf_exempt
@shipper_or_factory_required
def save_booking_by_supplier(request):
    from freightman.models import ServiceProviderMap
    supplier = user_org(request.user.id)
    forwarder = ServiceProviderMap.objects.filter(customer_org=supplier).first().service_provider_org
    return save_booking(request, forwarder)


def save_booking(request, forwarder):
    has_error = False
    resp = {
        'success': False,
        'msg': [],
        'errors': [],
        'form_errors': {},

        'address_errors': {},
        'address_form_errors': {},

        'bank_errors': {},
        'bank_form_errors': {},

        'goodsinfo_errors': {},
        'goodsinfo_form_errors': {},

        'goodsref_errors': [],
        'goodsref_form_errors': {},

        'stakeholder_ref_errors': {},
        'stakeholder_ref_form_errors': {},

        'data': {
            'booking_public_id': ''
        }
    }

    bookingform = SeaExportFrtBookingForm(request.POST)

    addressform_list = []
    branchform_list = []
    goodsform_list = []
    strefform_list = []
    # first collect the errors
    if not bookingform.is_valid():
        resp['errors'] = bookingform.non_field_errors()
        resp['form_errors'] = bookingform.errors
    for address in json.loads(bookingform.cleaned_data['addressbook_list']):
        addressform = SeaExportFrtAddressForm(address)
        addressform_list.append(addressform)
        if not addressform.is_valid():
            resp['address_errors'][addressform.cleaned_data['list_index']] = addressform.non_field_errors()
            resp['address_form_errors'][addressform.cleaned_data['list_index']] = addressform.errors
    if bookingform.cleaned_data['bank_branch_list']:
        for branchinfo in json.loads(bookingform.cleaned_data['bank_branch_list']):
            branchform = SeaExportFrtBankForm(branchinfo)
            branchform_list.append(branchform)
            if not branchform.is_valid():
                resp['bank_errors'][branchform.cleaned_data['list_index']] = branchform.non_field_errors()
                resp['bank_form_errors'][branchform.cleaned_data['list_index']] = branchform.errors
    for goodsinfo in json.loads(bookingform.cleaned_data['goods_list']):
        goodsform = SeaExportFrtGoodsForm(goodsinfo)
        goodsform_list.append(goodsform)
        if not goodsform.is_valid():
            resp['goodsinfo_errors'][goodsform.cleaned_data['list_index']] = goodsform.non_field_errors()
            resp['goodsinfo_form_errors'][goodsform.cleaned_data['list_index']] = goodsform.errors
    if bookingform.cleaned_data['stakeholder_ref_list']:
        for stakeholderref in json.loads(bookingform.cleaned_data['stakeholder_ref_list']):
            strefform = SeaExportFrtStakeholderRefForm(stakeholderref)
            strefform_list.append(strefform)
            if not strefform.is_valid():
                resp['stakeholder_ref_errors'][strefform.cleaned_data['list_index']] = strefform.non_field_errors()
                resp['stakeholder_ref_form_errors'][strefform.cleaned_data['list_index']] = strefform.errors
    # now process data
    if bookingform.is_valid():
        supplier = Organization.objects.get(id=type_1_public_id_to_model_id(bookingform.cleaned_data['supplier_public_id']))
        try:
            with transaction.atomic():
                # save address
                shipper = None
                consignee = None
                more_address_list = []
                notify_address_list = []
                for addressform in addressform_list:
                    if addressform.is_valid():
                        if not addressform.cleaned_data['id']:
                            addr = AddressBook.objects.create(
                                organization_id=supplier.id,
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
                        else:
                            addr = AddressBook.objects.get(id=addressform.cleaned_data['id'])

                        if addressform.cleaned_data['booking_notify']:
                            notify_address_list.append(addr)

                        if addressform.cleaned_data['is_additional_address']:
                            more_address_list.append(addr)
                        else:
                            if addressform.cleaned_data['is_shipper']:
                                shipper = addr
                            if addressform.cleaned_data['is_consignee']:
                                consignee = addr
                    else:
                        has_error = True

                # save bank branch
                origin_bank_branch = None
                destination_bank_branch = None
                for branchform in branchform_list:
                    if branchform.is_valid() and not has_error:
                        if branchform.cleaned_data['branch_id']:
                            branch = BankBranch.objects.get(id=branchform.cleaned_data['branch_id'])
                        else:
                            bank, _bcr = Bank.objects.get_or_create(bank_name=branchform.cleaned_data['bank_name'])
                            branch = BankBranch.objects.create(bank=bank, branch_name=branchform.cleaned_data['branch_name'],
                                                               branch_address=branchform.cleaned_data['branch_address'], added_by=request.user)

                        if branchform.cleaned_data['in_origin_leg']:
                            origin_bank_branch = branch
                        else:
                            destination_bank_branch = branch
                    else:
                        has_error = True

                # make booking entry
                if not has_error:
                    if bookingform.cleaned_data['booking_public_id']:  # update
                        booking = SeaExportFreightBooking.objects.get(id=type_1_public_id_to_model_id(bookingform.cleaned_data['booking_public_id']))
                        booking.forwarder = forwarder
                        booking.supplier = supplier
                        booking.consignee = consignee
                        booking.origin_bank_branch = origin_bank_branch
                        booking.destination_bank_branch = destination_bank_branch
                        booking.loading_port_id = bookingform.cleaned_data['port_of_load']
                        booking.destination_port_id = bookingform.cleaned_data['port_of_dest']
                        booking.delivery_terms_id = bookingform.cleaned_data['terms_of_deliv']
                        booking.destination_country_id = bookingform.cleaned_data['country_of_dest']
                        booking.shipping_service = bookingform.cleaned_data['shipping_service']
                        booking.payment_type_id = bookingform.cleaned_data['frt_payment_ins']
                        booking.transport_agreement_id = bookingform.cleaned_data['frt_transport_agreement_id']
                        booking.delivery_note = bookingform.cleaned_data['frt_delivery_instruction']
                        booking.pickup_date = bookingform.cleaned_data['pickup_date']
                        booking.pickup_time_start = bookingform.cleaned_data['pickup_earliest_time']
                        booking.pickup_time_end = bookingform.cleaned_data['pickup_latest_time']
                        booking.pickup_note = bookingform.cleaned_data['pickup_ins']
                        booking.save()
                        resp['msg'].append('Booking data updated')
                    else:  # create
                        booking = SeaExportFreightBooking.objects.create(
                            forwarder=forwarder,
                            supplier=supplier,
                            shipper=shipper,
                            consignee=consignee,
                            origin_bank_branch=origin_bank_branch,
                            destination_bank_branch=destination_bank_branch,
                            loading_port_id=bookingform.cleaned_data['port_of_load'],
                            destination_port_id=bookingform.cleaned_data['port_of_dest'],
                            delivery_terms_id=bookingform.cleaned_data['terms_of_deliv'],
                            destination_country_id=bookingform.cleaned_data['country_of_dest'],
                            shipping_service=bookingform.cleaned_data['shipping_service'],
                            payment_type_id=bookingform.cleaned_data['frt_payment_ins'],
                            transport_agreement_id=bookingform.cleaned_data['frt_transport_agreement_id'],
                            delivery_note=bookingform.cleaned_data['frt_delivery_instruction'],
                            pickup_date=bookingform.cleaned_data['pickup_date'],
                            pickup_time_start=bookingform.cleaned_data['pickup_earliest_time'],
                            pickup_time_end=bookingform.cleaned_data['pickup_latest_time'],
                            pickup_note=bookingform.cleaned_data['pickup_ins'],
                            entry_by=request.user,
                            is_booking_confirmed=False
                        )
                        resp['msg'].append('Booking entry created')

                    SeaExportFreightBookingMoreAddressMap.objects.filter(booking=booking).delete()
                    for addr in more_address_list:
                        SeaExportFreightBookingMoreAddressMap.objects.create(booking=booking, addressbook=addr,
                                                                             is_shipper=addr.is_shipper,
                                                                             is_consignee=addr.is_consignee,
                                                                             is_consignor=addr.is_consignor,
                                                                             is_pickup=addr.is_pickup,
                                                                             is_delivery=addr.is_delivery
                                                                             )

                    SeaExportFreightBookingNotifyAddress.objects.filter(booking=booking).delete()
                    for addr in notify_address_list:
                        SeaExportFreightBookingNotifyAddress.objects.create(booking=booking, addressbook=addr)

                    # goods info attach
                    SeaExportFreightBookingGoodsInfo.objects.filter(booking=booking).delete()
                    SeaExportFreightBookingGoodsReference.objects.filter(booking=booking).delete()

                    for goodsform in goodsform_list:  # type:SeaExportFrtGoodsForm
                        if goodsform.is_valid() and not has_error:
                            goodsinfo = SeaExportFreightBookingGoodsInfo.objects.create(
                                booking=booking,
                                no_of_pieces=goodsform.cleaned_data['no_of_pieces'],
                                package_type_id=goodsform.cleaned_data['package_type'],
                                weight_kg=goodsform.cleaned_data['weight_kg'],
                                cbm=goodsform.cleaned_data['cbm'],
                                quantity=goodsform.cleaned_data['quantity'],
                                unit_price=goodsform.cleaned_data['unit_price'],
                                currency_id=goodsform.cleaned_data['currency'],
                                shipping_mark=goodsform.cleaned_data['shipping_mark'],
                                goods_desc=goodsform.cleaned_data['goods_desc']
                            )
                            for ref_form in goodsform.references_valid_form_list:  # type:SeaExportFrtGoodsRefForm
                                # get_or_create is important because we are inside a transaction block
                                SeaExportFreightBookingGoodsReference.objects.get_or_create(
                                    booking=booking,
                                    goods_info=goodsinfo,
                                    reference_type_id=ref_form.cleaned_data['ref_type_id'],
                                    reference_number=ref_form.cleaned_data['ref_number'])
                        else:
                            has_error = True

                    # stakeholder refs attach
                    SeaExportFreightBookingStakeholderReferenceTypes.objects.filter(booking=booking).delete()
                    for strefform in strefform_list:
                        if strefform.is_valid() and not has_error:
                            SeaExportFreightBookingStakeholderReferenceTypes.objects.create(
                                booking=booking,
                                reference_type_id=strefform.cleaned_data['ref_type_id'],
                                reference_number=strefform.cleaned_data['ref_number']
                            )
                        else:
                            has_error = True

                    SeaExportFreightBookingAttachedFile.objects.filter(booking=booking).delete()
                    for url in bookingform.uplaodedfile_url_list:  # type:str
                        # url = urllib.parse.unquote(url)
                        head, tail = os.path.split(url)
                        from_path = os.path.join(settings.BASE_DIR, url[1:] if url.startswith('/') else url)
                        if not os.path.exists(from_path):
                            bookingform.add_error('uplaodedfile_url_list_json', 'path {} doesnot exist'.format(url))
                            # raise CustomException()
                        else:
                            moved_path_after_media = 'seaexport/booking/' + truncate_filename(tail, 100)
                            print(moved_path_after_media)
                            moved_path_rel = 'media/' + moved_path_after_media
                            moved_path = os.path.join(settings.BASE_DIR, moved_path_rel)
                            os.rename(from_path, moved_path)
                            SeaExportFreightBookingAttachedFile.objects.create(booking=booking, file=moved_path_after_media)

                    if bookingform.cleaned_data['is_confirm'] and bookingform.cleaned_data['edd']:
                        booking.is_booking_confirmed = True
                        booking.confirmed_by = request.user
                        booking.confirmed_at = datetime.now(pytz.utc)
                        booking.edd = bookingform.cleaned_data['edd']
                        booking.save()
                        notified_email_list = send_booking_notification_emails(request, booking.id)
                        resp['msg'].append('Booking confirmed with edd {}'.format(booking.edd))
                        resp['msg'].append('Email notification sent to {}'.format(notified_email_list))

                    resp['success'] = True
                    resp['data']['booking_public_id'] = booking.globalid
                    resp['msg'].append('booking reference number is {}'.format(booking.globalid))
                else:  # has error
                    resp['success'] = False
                    resp['data']['booking_public_id'] = ''
                    resp['msg'] = []
                    resp['errors'].append('Please check for errors.')
                    raise CustomException('Invalid data')

        except CustomException:  # transaction undo
            resp['success'] = False
            resp['msg'] = []
            resp['data']['booking_public_id'] = ''

    return JsonResponse(resp, status=200)
