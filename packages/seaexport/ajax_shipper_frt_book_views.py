from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from freightman.decorators import shipper_or_factory_required
from freightman.user_helpers import user_org
from freightman.models import ReferenceTypes, StakeholderReferenceTypes, Currency, City, Country, AddressBook, BankBranch, PaymentType
from seaexport.models import SeaPort, SeaExportPackageType, SeaTermsofDelivery, SeaTransportAgreement


@login_required
@shipper_or_factory_required
def get_booking_page_init_data(request):
    org = user_org(request.user.id)
    data = {
        'org': org.dict(request),
        'reference_types': [ref.dict(request) for ref in ReferenceTypes.objects.all()],
        'stakeholder_reference_types': [ref.dict(request) for ref in StakeholderReferenceTypes.objects.all()],
        'package_types': [pak.dict(request) for pak in SeaExportPackageType.objects.all()],
        'transport_agreements': [ta.dict(request) for ta in SeaTransportAgreement.objects.all()],
        'currency': [curr.dict(request) for curr in Currency.objects.all()],
        'city_list': [city.dict() for city in City.objects.all()],
        'country_list': [country.dict() for country in Country.objects.all()],
        'airport_list': [sp.dict() for sp in SeaPort.objects.all()],
        'tod_list': [tod.dict() for tod in SeaTermsofDelivery.objects.all()],
        'address_list': [add.dict(request) for add in AddressBook.objects.filter(organization=org)],
        'bank_list': [branch.dict() for branch in BankBranch.objects.all()],
        'payment_type_list': [pt.dict() for pt in PaymentType.objects.all()]
    }
    return JsonResponse(data)
