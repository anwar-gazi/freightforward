"""freightman URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
import freightman.auth_views as fm_auth_views
from django.conf import settings
import freightman.views as fm_views
import freightman.shipper_views as shipper_views
import freightman.ajax_views as ajax_views
import freightman.helper_views as helperviews
import freightman.booking_list_views as booking_list_views
import freightman.booking_email_views as booking_email_views
import freightman.ajax_mawb_views as ajax_mawb_views
import freightman.ajax_hawb_views as ajax_hawb_views
import freightman.ajax_consol_views as ajax_consol_views
import freightman.ajax_test_views as ajax_test_views
import freightman.ajax_shipper_bookinglist_views as ajax_shipper_bookinglist_views
import freightman.forwarder_settings_views as forwarder_settings_views
import freightman.mawb_views as mawb_views
import freightman.job_costing_views as job_costing_views
import freightman.ajax_job_costing_views as ajax_job_costing_views
import freightman.gp_listing_views as gp_listing_views
import freightman.ajax_gp_listing_views as ajax_gp_listing_views
import freightman.ajax_currency_conversion_views as ajax_currency_conversion_views
import freightman.forwarder_user_views as forwarder_user_views
import freightman.forwarder_frt_book_views as forwarder_frt_book_views
import freightman.debit_note_views as debit_note_views
import freightman.menu_views as menu_views

urlpatterns = [
                  path('admin/', admin.site.urls),
                  path('', fm_views.landing, name='landing'),

                  path('home/', fm_views.homepage, name='home'),

                  path('menu-grid/', menu_views.grid_menu_home, name='forwarder_grid_menu_home'),
                  path('supplier_menu/', menu_views.supplier_management_menu, name='supplier_menu'),
                  path('user_menu/', menu_views.user_management_menu, name='user_menu'),

                  path('airexport/apps_menu/', menu_views.airexport_apps_menu, name='airexport_apps_menu'),

                  path('shipper/home/', shipper_views.shipper_home, name='shipper-home'),

                  path('shipper/airexport_freight_booking/', shipper_views.booking, name='shipper-freight_booking'),

                  path('forwarder/airexport_freight_booking/', forwarder_frt_book_views.frt_booking_page, name='forwarder-freight_booking'),
                  # path('shipper/seaexport_freight_booking/', shipper_sea_export_views.sea_export_frt_booking_page, name='shipper-sea_export_freight_booking'),

                  path('shipper/booking_list/<str:type>/', shipper_views.booking_list, name='shipper-booking_list'),
                  path('shipper/hawb_print_preview/<str:hawb_public_id>/', shipper_views.hawb_print_preview_page_by_shipper, name='shipper-hawb-print-preview-page'),

                  # path('forwarder/booking_list/<str:type>/', fm_views.booking_list_by_system_owner, name='booking_list'),
                  path('shipper/freight_booking/list/', fm_views.booking_list_by_shipper, name='airexport_shipper_freight_booking_list'),
                  path('ajax/shipper/booking_list/', ajax_views.booking_list_by_shipper, name='ajax_booking_list_by_shipper'),

                  path('forwarder/freight_booking/list/', fm_views.booking_list_by_forwarder, name='airexport_forwarder_freight_booking_list'),

                  path('forwarder/booking_list/registered/', fm_views.booking_list_by_system_owner, {'type': 'registered'}, name='booking_list_registered'),
                  path('forwarder/booking_list/confirmed/', fm_views.booking_list_by_system_owner, {'type': 'confirmed'}, name='booking_list_confirmed'),

                  path('view_booking_info/<str:booking_public_id>/', booking_email_views.view_booking_email_body_page, name='view_booking_email_body'),

                  path('ajax/forwarder/booking_list/', ajax_views.booking_list_by_system_owner, name='ajax-booking_list'),
                  path('ajax/forwarder/mark_as_booked/', ajax_views.mark_as_booked, name='ajax-mark_as_booked'),
                  path('ajax/forwarder/getlist_booking/<str:type>/', booking_list_views.getlist_booking, name='ajax-forwarder-get_booking_list'),

                  path('forwarder/invoice/<str:booking_public_id>/', fm_views.booking_invoice, name='forwarder-booking_invoice'),

                  path('forwarder/shipment_booking/', fm_views.shipment_booking_page_by_forwarder, name='forwarder-shipment-booking'),

                  path('forwarder/mawb_list/', mawb_views.mawb_listing_page, name='forwarder-mawb_listing_page'),
                  path('ajax/forwarder/get_mawb_list/', ajax_mawb_views.get_mawb_list, name='forwarder-get_mawb_list'),

                  path('forwarder/mawb/<str:mawb_public_id>/cargo_manifest/', mawb_views.cargo_manifest_page, name='forwarder-mawb_cargo_manifest'),

                  path('forwarder/debit_note_listing/', debit_note_views.debit_note_listing, name='forwarder-debit_note_listing'),
                  path('ajax/forwarder/get_debitnote_list/', debit_note_views.ajax_get_debitnote_list, name='forwarder-get_debitnote_list'),

                  path('forwarder/debit_note_page/', debit_note_views.debit_note_page, name='forwarder-debit_note_page'),
                  path('ajax/forwarder/debit_note_page_init_data/', debit_note_views.debit_note_page_init_data, name='forwarder-debit_note_page_init_data'),
                  path('ajax/forwarder/debit_note_save/', debit_note_views.debit_note_save, name='forwarder-debit_note_save'),
                  path('ajax/forwarder/debitcredit_note/get_mawb_info/', debit_note_views.get_mawb_info, name='forwarder_debit_note_get_mawb_info'),

                  path('forwarder/debit_note_page/<str:debitnote_public_id>/', debit_note_views.view_debit_note, name='forwarder-debit_note_view_from_edit_page'),
                  path('forwarder/debit_note_view/<str:debitnote_public_id>/', debit_note_views.view_debit_note, name='forwarder-debit_note_view'),
                  path('ajax/forwarder/debit_note/get_debitnote_info/', debit_note_views.get_debitnote_info, name='forwarder_debit_note_get_debitnote_info'),

                  path('job_cost_listing/', job_costing_views.job_costing_page, name='forwarder-job_costing_page'),
                  path('ajax/job_costing/get_consol_list/', ajax_job_costing_views.get_consol_list, name='get_consol_list_for_job_costing'),
                  path('job_costing/<str:consol_public_id>/', job_costing_views.load_job_costing, name='load_job_costing'),

                  path('ajax/forwarder/job_costing_page_init_data/', ajax_job_costing_views.job_costing_page_init_data, name='forwarder-job_costing_page_init_data'),
                  path('ajax/forwarder/job_costing_data_save/', ajax_job_costing_views.save_job_costing, name='forwarder-job_costing_data_save'),
                  path('ajax/forwarder/save_charge_type/', ajax_job_costing_views.save_charge_type, name='forwarder_job_costing_save_charge_type'),

                  path('forwarder/shipment_console/', fm_views.shipment_consol_page_by_forwarder, name='forwarder-shipment-consol'),
                  path('forwarder/mawb_input/', fm_views.mawb_input_page_by_forwarder, name='forwarder-mawb-input'),
                  # path('forwarder/mawb/edit', fm_views.mawb_edit, name='forwarder-mawb-edit'),

                  # Report
                  path('airexport/report/dsr/', fm_views.daily_status_report, name='airexport_report_dsr'),
                  path('airexport/report/dsr/print/<str:date>', fm_views.daily_status_report_print, name='airexport-report-dsr-print'),

                  path('airexport/report/weight_lift/customer', fm_views.weight_lift_by_customer, name='airexport-report-weight-lift-customer'),
                  path('airexport/report/weight_lift/print', fm_views.weight_lift_by_customer, name='airexport-report-weight-lift-customer'),

                  path('airexport/report/weight_lift/agent', fm_views.weight_lift_by_agent, name='airexport-report-weight-lift-agent'),
                  path('airexport/report/weight_lift/destination', fm_views.weight_lift_by_destination, name='airexport-report-weight-lift-destination'),

                  path('airexport/report/gplisting/customer', fm_views.customer_gp_listing, name='airexport-report-customer-gp-listing'),

                  path('forwarder/mawb_print_preview/<str:mawb_public_id>/', fm_views.mawb_print_preview_page_by_forwarder, name='forwarder-mawb-print-preview-page'),
                  path('forwarder/hawb_dummy_print_preview/<str:hawb_public_id>/', fm_views.hawb_dummy_print_preview_page_by_forwarder,
                       name='forwarder-hawb-dummy-print-preview-page'),
                  path('forwarder/hawb_print_preview/<str:hawb_public_id>/', fm_views.hawb_print_preview_page_by_forwarder, name='forwarder-hawb-print-preview-page'),
                  path('forwarder/hawb_input/', fm_views.hawb_input_page_by_forwarder, name='forwarder-hawb-input'),
                  path('forwarder/hawb/edit', fm_views.hawb_edit, name='forwarder-hawb-edit'),

                  path('forwarder/gp_listing/', gp_listing_views.gp_listing_page, name='forwarder-gp_listing_page'),
                  path('ajax/forwarder/get_gp_listing_page_init_data/', ajax_gp_listing_views.get_gp_listing_page_init_data,
                       name='forwarder-gp_listing_page_init_data'),

                  path('ajax/forwarder/get_booking_info_for_hawb_form/', ajax_hawb_views.get_booking_info_for_hawb_form, name='ajax-forwarder-hawb-get_booking_info'),

                  path('ajax/get_mawb/<str:mawb_number>', ajax_mawb_views.get_mawb, name='ajax_get_mawb'),

                  path('ajax/forwarder/shipment_console_page_init_data/', ajax_consol_views.page_init_data, name='ajax-forwarder-shptconsol-page-init-data'),
                  path('ajax/forwarder/mawb_page_init_data/', ajax_mawb_views.page_init_data, name='ajax-mawb-page-init-data'),
                  path('ajax/forwarder/hawb_page_init_data/', ajax_hawb_views.page_init_data, name='ajax-hawb-page-init-data'),

                  path('ajax/forwarder/consol_input_save/', ajax_consol_views.consol_input_data_save, name='ajax-forwarder-consol-input-save'),
                  path('ajax/forwarder/mawb_input_save/', ajax_mawb_views.mawb_save, name='ajax-forwarder-mawb-input-save'),
                  path('ajax/forwarder/hawb_input_save/', ajax_hawb_views.hawb_save, name='ajax-forwarder-hawb-input-save'),

                  path('commercial_invoice/', fm_views.commerical_invoice, name='commercial_invoice'),
                  path('booking/', fm_views.booking, name='booking'),

                  path('hawb/', fm_views.hawb, name='hawb'),
                  path('hawb2/', fm_views.hawb2, name='hawb2'),

                  path('mawb/', fm_views.mawb, name='mawb'),

                  path('list_shippers/', fm_views.list_shippers, name='shippers_listing_page'),
                  path('add_factory/', fm_views.add_factory_page, name='add_factory_page'),
                  path('company/<str:public_id>/', fm_views.view_company_info, name='view_company'),

                  # django standard auth
                  path('accounts/login/', auth_views.LoginView.as_view(template_name='default/registration/login.html'), name='login'),
                  path('accounts/logout/', fm_auth_views.logout_view, name='logout'),
                  path('accounts/profile/', fm_auth_views.profile_view),
                  path('accounts/password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
                  path('accounts/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
                  path('accounts/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
                  path('accounts/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

                  # ajax endpoints

                  # path('ajax/shipper/save_shipper_address/', ajax_views.save_shipper_address, name='ajax-save_shipper_address'),
                  # path('ajax/shipper/save_address/', ajax_views.shipper_save_address, name='ajax-shipper-save_address'),

                  path('ajax/register_org/get_init_data/', ajax_views.register_factory_init_data, name='ajax-register_factory_init_data'),
                  path('ajax/register_factory/', ajax_views.register_factory, name='ajax-register_factory'),
                  path('ajax/register_factory_user/', ajax_views.register_factory_user, name='ajax-register_factory_user'),
                  path('ajax/get_shipper_list/', ajax_views.get_shipper_list, name='ajax-get_shipper_list'),
                  path('endpoint/ajax/', ajax_views.ajax_endpoint, name='ajax-endpoint'),

                  path('ajax/shipper/get_airexport_frtbookingpage_init_data/', ajax_views.get_booking_form_data, name='get_airexport_frtbookingpage_init_data'),
                  path('ajax/forwarder/get_airexport_frtbookingpage_init_data/', ajax_views.get_airexport_frtbookingpage_init_data,
                       name='ajax-forwarder-get_airexport_frtbookingpage_init_data'),
                  path('ajax/shipper/booking/mainentry/', ajax_views.shipper_booking_main_entry, name='ajax-shipper-booking_main_entry'),
                  path('ajax/shipper/booking/save_address/', ajax_views.shipper_booking_save_address, name='ajax-shipper-booking_save_address'),
                  path('ajax/shipper/booking/save_bank_info/', ajax_views.save_bank_info, name='ajax-shipper-booking_save_bankinfo'),
                  path('ajax/shipper/booking/save_portsinfo/', ajax_views.do_booking_portsinfo_entry, name='ajax-shipper-portsinfo_entry'),
                  path('ajax/shipper/booking/save_goodsinfo/', ajax_views.do_booking_goodsinfo_entry, name='ajax-shipper-goodsinfo_entry'),
                  path('ajax/shipper/booking/save_goodsrefinfo/', ajax_views.do_booking_goodsinfo_reference_entry, name='ajax-shipper-goodsrefinfo_entry'),
                  path('ajax/shipper/booking/save_shipping_service/', ajax_views.do_booking_shippingservice_entry, name='ajax-shipper-booking_shipping_entry'),
                  path('ajax/shipper/booking/save_stakeholder_ref/', ajax_views.do_booking_stakeholder_reference_entry, name='ajax-shipper-booking_save_stakeholder_ref'),
                  path('ajax/shipper/booking/save_order_notes/', ajax_views.do_booking_order_notes_entry, name='ajax-shipper-booking_save_order_notes'),
                  path('ajax/shipper/booking/save_pickup_notes/', ajax_views.do_booking_pickup_notes_entry, name='ajax-shipper-booking_save_pickup_notes'),

                  path('ajax/shipper/booking/entry_completion/', ajax_views.booking_entry_completion, name='ajax-shipper-booking_entry_completion'),

                  path('ajax/shipper/getlist_booking/<str:booking_type>/', ajax_shipper_bookinglist_views.getlist_booking, name='ajax-shipper-get_booking_list'),
                  path('ajax/shipper/mark_as_booked/', ajax_shipper_bookinglist_views.mark_as_booked, name='ajax-shipper_mark_as_booked'),

                  # helpers
                  path('pdftemplate/', helperviews.pdf_template, name='bookeddata_pdf_template'),

                  path('ajax/test/', ajax_test_views.index, name='ajax-testhandler'),

                  path('forwarder/settings/', forwarder_settings_views.settings_page, name='forwarder-settings_page'),

                  path('ajax/file_upload_test/', ajax_test_views.file_upload_test, name='ajax-fileuploadtest'),

                  path('airexport/', include(('airexport.urls', 'airexport'), namespace='airexport')),
                  path('seaexport/', include(('seaexport.urls', 'seaexport'), namespace='seaexport')),

                  path('seaimport/', include(('seaimport.urls', 'seaimport'), namespace='seaimport')),
                  # path('airimport/', include(('airimport.urls', 'airimport'), namespace='airimport')),

                  path('currency_conversion/save_rate/', ajax_currency_conversion_views.save_conversion_rate, name='save_conversion_rate'),
                  path('currency_conversion/get_currency_list/', ajax_currency_conversion_views.get_currency_list, name='get_currency_list'),

                  path('user/<int:id>/', forwarder_user_views.view_user, name='load_user'),
                  path('user/create/', forwarder_user_views.add_user_page, {'org_id': None}, name='add_forwarder_user_page'),
                  path('org/<int:org_id>/add_user/', forwarder_user_views.add_user_page, name='add_selected_org_user_page'),
                  path('ajax/forwarder/create_user_form_init_data/', forwarder_user_views.ajax_create_user_form_init_data, name='ajax_create_user_form_init_data'),
                  path('ajax/forwarder/create_user/', forwarder_user_views.ajax_create_user, name='ajax_create_forwarder_user'),
                  path('forwarder/list_users/', forwarder_user_views.list_forwarder_users_page, name='list_forwarder_users_page'),
                  path('forwarder/list_users_page_init_data/', forwarder_user_views.ajax_list_users_page_init_data, name='ajax_forwarder_list_users_page_init_data'),

                  path('city/add/', ajax_views.add_city, name='ajax_add_city'),
                  path('country/add/', ajax_views.add_country, name='ajax_add_country'),
                  path('seaport/add/', ajax_views.add_seaport, name='ajax_add_seaport'),

                  path('upload_file/', helperviews.upload_file, name='file_upload'),

                  path('api/seaimport/', include(('seaimport.api_urls', 'seaimport'), namespace='seaimportapi')),

                  # path('testing', fm_views.testing, name='testing'),

              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
