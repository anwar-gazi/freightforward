from django.urls import path
from . import api_views

urlpatterns = [
    # Agents
    path('mbl_shippers', api_views.mbl_shipper_list, name='sea_import_api_mbl_shipper_list'),
    path('hbl_consignor', api_views.hbl_consignor_list, name='sea_import_api_hbl_consignor_list'),
    path('hbl_bank', api_views.hbl_bank_list, name='sea_import_api_hbl_bank_list'),
    path('hbl_notifier', api_views.hbl_notifier_list, name='sea_import_api_hbl_notifier_list'),

    # Goods
    path('goods_type', api_views.goods_type_list, name='sea_import_api_goods_type_list'),
    path('package_type', api_views.package_type_list, name='sea_import_api_package_type_list'),
    path('container_size_type', api_views.container_size_type_list, name='sea_import_api_container_size_type_list'),

    # Mbl other infos
    path('port_of_loading', api_views.port_of_loading_list, name='sea_import_api_port_of_loading_list'),
    path('port_of_discharge', api_views.port_of_discharge_list, name='sea_import_api_port_of_discharge_list'),
    path('freight_type', api_views.freight_type_list, name='sea_import_api_freight_type_list'),

    #Agent and Company
    path('companies', api_views.company_name_list, name='sea_import_api_company_name_list'),

    # Cities and Countries
    path('cities', api_views.city_list, name='sea_import_api_city_list'),
    path('countries', api_views.country_list, name='sea_import_api_country_list'),

    # Mbls and Hbls
    path('mbls/all', api_views.mbl_list, name='sea_import_api_mbl_list'),
    path('mbls/non_consoled', api_views.mbl_non_consoled_list, name='sea_import_api_mbl_non_consoled_list'),

    # Others
    path('doc_types', api_views.doc_types_list, name='sea_import_api_doc_types_list'),


]
