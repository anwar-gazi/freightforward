from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from . import models
from seaexport import models as seaexportmodel


@login_required()
def mbl_shipper_list(request):
    mbl_shippers = [agent.get_name_id() for agent in
                    models.SeaImportAgent.objects.filter(name__is_foreign_agent=True).order_by('name__name', 'branch')]
    return JsonResponse(mbl_shippers, safe=False)


@login_required()
def hbl_consignor_list(request):
    mbl_shippers = [agent.get_name_id() for agent in
                    models.SeaImportAgent.objects.filter(name__is_consignor=True).order_by('name__name', 'branch')]
    return JsonResponse(mbl_shippers, safe=False)


@login_required()
def hbl_bank_list(request):
    mbl_shippers = [agent.get_name_id() for agent in
                    models.SeaImportAgent.objects.filter(name__is_bank=True).order_by('name__name', 'branch')]
    return JsonResponse(mbl_shippers, safe=False)


@login_required()
def hbl_notifier_list(request):
    mbl_shippers = [agent.get_name_id() for agent in
                    models.SeaImportAgent.objects.filter(name__is_importer=True).order_by('name__name', 'branch')]
    return JsonResponse(mbl_shippers, safe=False)


@login_required()
def goods_type_list(request):
    goods_type = [type.dict() for type in models.SeaImportGoodType.objects.all().order_by('goods_type_name')]
    return JsonResponse(goods_type, safe=False)


@login_required()
def package_type_list(request):
    package_type = [type.dict() for type in seaexportmodel.SeaExportPackageType.objects.all().order_by('name')]
    return JsonResponse(package_type, safe=False)


@login_required()
def container_size_type_list(request):
    container_size_type = [type.dict() for type in seaexportmodel.ContainerType.objects.all().order_by('name')]
    return JsonResponse(container_size_type, safe=False)


@login_required()
def port_of_loading_list(request):
    port_of_loading = [port.dict() for port in models.SeaPort.objects.all().order_by('name')]
    return JsonResponse(port_of_loading, safe=False)


@login_required()
def port_of_discharge_list(request):
    port_of_discharge = [port.dict() for port in models.SeaPort.objects.all().order_by('name')]
    return JsonResponse(port_of_discharge, safe=False)


@login_required()
def freight_type_list(request):
    freight_type_list = [port.dict() for port in models.SeaImportFreightType.objects.all().order_by('name')]
    return JsonResponse(freight_type_list, safe=False)


@login_required()
def company_name_list(request):
    company_name_list = [company.dict() for company in models.SeaImportCompany.objects.all().order_by('name')]
    return JsonResponse(company_name_list, safe=False)


@login_required()
def city_list(request):
    city_list = [city.dict() for city in models.City.objects.all().order_by('name')]
    return JsonResponse(city_list, safe=False)


@login_required()
def country_list(request):
    country_list = [country.dict() for country in models.Country.objects.all().order_by('name')]
    return JsonResponse(country_list, safe=False)


@login_required()
def mbl_list(request):
    mbl_list = [mbl.dict() for mbl in models.SeaImportMbl.objects.all().order_by('mbl_number')]
    return JsonResponse(mbl_list, safe=False)


@login_required()
def mbl_non_consoled_list(request):
    mbl_non_consoled_list = [mbl.dict() for mbl in
                             models.SeaImportMbl.objects.filter(job__isnull=True).order_by('mbl_number')]
    return JsonResponse(mbl_non_consoled_list, safe=False)


@login_required()
def hbl_non_consoled_list(request):
    mbl_non_consoled_list = [mbl.dict() for mbl in
                             models.SeaImportMbl.objects.filter(job__isnull=True).order_by('mbl_number')]
    return JsonResponse(mbl_non_consoled_list, safe=False)


@login_required()
def doc_types_list(request):
    doc_types_list = [doc_types.dict() for doc_types in
                             models.SeaImportDocType.objects.all().order_by('type_name')]
    return JsonResponse(doc_types_list, safe=False)
