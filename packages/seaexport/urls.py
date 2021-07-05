from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
import seaexport.forwarder_views as forwarder_views
import seaexport.supplier_views as supplier_views
import seaexport.forwarder_frt_book_views as forwarder_frt_book_views
import seaexport.forwarder_bookinglist_views as forwarder_bookinglist_views
import seaexport.forwarder_bl_views as forwarder_bl_views
from seaexport import views
import freightman.menu_views as menu_views
import seaexport.settings_view as settings_view
import seaexport.report_views as report_views
import seaexport.job_costing_views as job_costing_views

urlpatterns = \
    [
        path('', views.admin_dashboard, name='sea_export_admin_login'),
        path('dashboard', views.admin_dashboard, name='sea_export_admin_dashboard'),
        path('apps_menu/', menu_views.seaexport_apps_menu, name='seaexport_apps_menu'),

        path('under_development/', views.pending_work, name='under_development'),

        path('forwarder/settings/', settings_view.settings_page, name='forwarder_settings_page'),

        path('supplier/freight_booking/', supplier_views.sea_export_frt_booking_page, name='seaexport_supplier_freight_booking_page'),

        path('supplier/ajax/get_frt_booking_page_init_data/', supplier_views.get_booking_page_init_data, name='get_supplier_freight_booking_page_init_data'),
        path('ajax/supplier/save_booking/', forwarder_frt_book_views.save_booking_by_supplier, name='ajax_supplier_save_booking'),

        path('freight_booking/', forwarder_views.sea_export_frt_booking_page, name='seaexport_forwarder_freight_booking_page'),
        path('freight_booking/<str:public_id>/edit/', forwarder_views.view_frt_booking, name='freight_booking_edit'),
        path('freight_booking/<str:public_id>/copy/', forwarder_views.copy_frt_booking, name='freight_booking_copy'),
        path('freight_booking/<str:public_id>/delete/', forwarder_views.delete_frt_booking, name='freight_booking_delete'),
        path('ajax/get_booking_info/', forwarder_frt_book_views.get_booking_info, name='get_freight_booking_info'),
        path('ajax/forwarder/get_frt_booking_page_init_data/', forwarder_frt_book_views.get_booking_page_init_data, name='get_forwarder_freight_booking_page_init_data'),
        path('ajax/forwarder/save_booking/', forwarder_frt_book_views.save_booking_by_forwarder, name='ajax_forwarder_save_booking'),

        path('booking_list/', forwarder_bookinglist_views.sea_export_frt_bookinglist_page, name='seaexport_forwarder_freight_bookinglist_page'),
        path('ajax_get_booking_list/', forwarder_bookinglist_views.ajax_get_seaexport_bookinglist, name='seaexport_ajax_get_bookinglist'),
        path('confirm_booking/', forwarder_bookinglist_views.mark_booking_confirmed, name='seaexport_forwarder_confirm_booking'),
        path('booking_mark_goods_received/', forwarder_bookinglist_views.mark_booking_goods_received, name='seaexport_forwarder_mark_booking_goods_received'),
        path('view_booking_email_body/<str:booking_public_id>/', forwarder_bookinglist_views.view_booking_email_body_page,
             name='seaexport_forwarder_view_booking_email_body_page'),

        path('supplier/booking_list/', supplier_views.sea_export_frt_bookinglist_page, name='seaexport_supplier_freight_bookinglist_page'),
        path('supplier/ajax_get_booking_list/', supplier_views.get_seaexport_bookinglist, name='ajax_shipper_get_bookinglist'),
        path('supplier/freight_booking/<str:public_id>/edit/', supplier_views.view_frt_booking, name='supplier_freight_booking_edit'),
        path('supplier/freight_booking/<str:public_id>/copy/', supplier_views.copy_frt_booking, name='supplier_freight_booking_copy'),
        path('supplier/freight_booking/<str:public_id>/delete/', supplier_views.delete_frt_booking, name='supplier_freight_booking_delete'),

        path('hbl_list/', forwarder_bookinglist_views.sea_export_hbl_list_page, name='seaexport_forwarder_hbl_list_page'),
        path('ajax/get_hbl_list/', forwarder_bookinglist_views.get_hbl_list, name='seaexport_ajax_get_hbl_list'),

        path('update_job_dates/', forwarder_bl_views.update_job_dates, name='ajax_update_job_dates'),
        path('get_job_dates/', forwarder_bl_views.get_job_dates, name='get_job_dates'),
        path('delete_job/', forwarder_bl_views.delete_job, name='delete_job'),

        path('hbl/<str:public_id>/edit/', forwarder_bl_views.view_hbl_page, name='seaexport_forwarder_view_hbl_page'),
        path('hbl/<str:public_id>/copy/', forwarder_bl_views.copy_hbl_page, name='seaexport_forwarder_copy_hbl_page'),
        path('ajax/get_hbl_info/', forwarder_bl_views.get_hbl_info, name='seaexport_forwarder_get_hbl_info'),

        path('create_hbl/', forwarder_bl_views.create_hbl_page, name='seaexport_forwarder_create_hbl_page'),
        path('ajax/hbl_save/', forwarder_bl_views.hbl_save, name='seaexport_forwarder_hbl_save'),
        path('ajax/hbl_form_init_data/', forwarder_bl_views.ajax_hbl_page_init_data, name='seaexport_forwarder_hbl_form_init_data'),
        path('ajax/get_booking_dict_for_hbl_page/', forwarder_bl_views.get_booking_dict_for_hbl_page,
             name='ajax_seaexport_forwarder_get_booking_dict_for_hbl_page'),
        path('ajax/get_container_serial_info/', forwarder_bl_views.get_continer_serial_info,
             name='ajax_seaexport_forwarder_get_container_serial_info'),

        path('add_mbl_page/', forwarder_bl_views.add_mbl_page, name='seaexport_forwarder_add_mbl_page'),
        path('ajax/mbl_form_init_data/', forwarder_bl_views.ajax_mbl_page_init_data, name='seaexport_forwarder_mbl_form_init_data'),
        path('ajax/mbl_save/', forwarder_bl_views.mbl_save, name='seaexport_forwarder_mbl_save'),
        path('bl_consol/', forwarder_bl_views.bl_consol_page, name='seaexport_forwarder_bl_consol_page'),

        path('mbl_list/', forwarder_bl_views.mbl_listing_page, name='mbl_list_page'),
        path('ajax/get_mbl_list/', forwarder_bl_views.get_mbl_list, name='seaexport_ajax_get_mbl_list'),

        path('job_costing_job_list/', job_costing_views.job_costing_listing, name='seaexport_job_costing_listing_page'),
        path('ajax/job_costing/get_consol_list/', job_costing_views.get_consol_list, name='get_consol_list_for_job_costing'),
        path('job_costing/<str:consol_public_id>/', job_costing_views.load_job_costing, name='load_job_costing'),
        path('ajax/job_costing_page_init_data/', job_costing_views.job_costing_page_init_data, name='job_costing_page_init_data'),
        path('ajax/job_costing_data_save/', job_costing_views.save_job_costing, name='job_costing_data_save'),
        path('ajax/save_charge_type/', job_costing_views.save_charge_type, name='job_costing_save_charge_type'),

        path('shipment_advice/listing/', forwarder_bl_views.shipment_advice_listing_page, name='seaexport_shipment_advice_listing_page'),
        path('container_consolidation/listing/', forwarder_bl_views.container_consolidation_listing_page, name='seaexport_container_consol_listing_page'),
        path('ajax/get_container_consol_list/', forwarder_bl_views.get_container_consol_list, name='seaexport_get_container_consol_list'),

        path('shipment_advice/<str:consol_shipment_public_id>/', forwarder_bl_views.view_container_consol_shipment_advice_page,
             name='seaexport_container_consol_shipment_advice_view'),

        path('container_consol/<str:public_id>/shipment_advice/csv', forwarder_bl_views.container_consol_shipment_advice_csv,
             name='seaexport_container_consol_shipment_advice_csv'),

        path('ajax/get_container_consol_info/', forwarder_bl_views.get_container_consol_shipment_info, name='seaexport_get_container_consol_shipment_info'),

        path('container_consolidation/', forwarder_bl_views.container_consolidation_page, name='seaexport_container_consol_page'),
        path('container_consolidation_page_init_data/', forwarder_bl_views.container_consolidation_page_init_data, name='seaexport_get_container_consol_page_init_data'),
        path('container_consolidation_save/', forwarder_bl_views.container_consolidation_save, name='seaexport_container_consol_save'),

        path('hbl_consolidation_report/', forwarder_bl_views.hbl_consolidation_report_page, name='seaexport_hbl_consol_report_page'),
        path('mbl_consolidation_report/', forwarder_bl_views.mbl_consolidation_report_page, name='seaexport_mbl_consol_report_page'),
        path('container_consolidation_report/', forwarder_bl_views.container_consolidation_report_page, name='seaexport_container_consol_report_page'),
        path('buyers_consolidation_report/', forwarder_bl_views.buyers_consolidation_report_page, name='seaexport_buyers_consol_report_page'),

        path('consol_job_costing/', forwarder_bl_views.consolidation_job_costing_page, name='seaexport_consol_job_costing_page'),
        path('invoice_create/', forwarder_bl_views.invoice_create_page, name='seaexport_invoice_create_page'),
        path('gp_listing/', forwarder_bl_views.gp_listing_page, name='seaexport_gp_listing_page'),

        path('report/dsr/', report_views.dsr_report_page, name='dsr'),
        path('report/get_dsr_data/', report_views.get_dsr_data, name='get_dsr_data'),

    ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
