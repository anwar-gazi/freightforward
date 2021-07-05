from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
import airexport.views as airexport_views
import freightman.mawb_views as mawb_views
import airexport.consol_shipment_views as consol_shipment_views

urlpatterns = [
                  path('hawb_listing/', airexport_views.hawb_listing, name='hawb_listing'),
                  path('ajax/get_hawb_list/', airexport_views.get_hawb_list, name='ajax_get_hawb_list'),
                  path('update_job_dates/', airexport_views.update_job_dates, name='ajax_update_job_dates'),
                  path('get_job_dates/', airexport_views.get_job_dates, name='get_job_dates'),

                  path('hawb/<str:hawb_public_id>/edit/', airexport_views.hawb_edit_page, name='hawb_edit_page'),
                  path('hawb/<str:hawb_public_id>/copy/', airexport_views.hawb_copy_page, name='hawb_copy_page'),
                  path('hawb/<str:hawb_public_id>/delete/', airexport_views.delete_hawb, name='hawb_delete'),

                  path('mawb/<str:public_id>/edit/', mawb_views.mawb_edit_page, name='mawb_edit_page'),
                  path('mawb/<str:public_id>/copy/', mawb_views.mawb_copy_page, name='mawb_copy_page'),
                  path('mawb/<str:public_id>/delete/', mawb_views.delete_mawb, name='mawb_delete'),

                  path('get_hawb_info/', airexport_views.get_hawb_data, name='get_hawb_info'),
                  path('get_mawb_info/', airexport_views.get_mawb_data, name='get_mawb_info'),

                  path('hawb/<str:hawb_public_id>/dummy_print/', airexport_views.hawb_dummy_print_preview_page_by_forwarder, name='hawb_dummy_print_preview_page'),
                  path('hawb/<str:hawb_public_id>/print/', airexport_views.hawb_print_preview_page_by_forwarder, name='hawb_print_preview_page'),

                  path('consol_shipment/list/', consol_shipment_views.shipment_listing_page, name='consol_shipment_listing_page'),
                  path('get_consol_shipment_list/', consol_shipment_views.get_consol_shipment_list, name='ajax_get_consol_shipment_list'),

                  path('creditnote/list/', airexport_views.credit_note_listing, name='creditnote_listing_page'),
                  path('ajax/get_creditnote_list/', airexport_views.ajax_get_creditnote_list, name='get_creditnote_list'),
                  path('credit_note/<str:public_id>/', airexport_views.view_credit_note, name='credit_note_view'),

                  path('creditnote/', airexport_views.credit_note_page, name='creditnote_page'),
                  path('ajax/get_creditnote_info/', airexport_views.get_creditnote_info, name='get_creditnote_info'),
                  path('ajax/creditnote/save/', airexport_views.credit_note_save, name='creditnote_save'),

                  path('cargo_manifest_list/', airexport_views.cargo_manifest_listing, name='cargo_manifest_listing_page'),
                  path('ajax/get_cargo_manifest_list/', airexport_views.get_cargo_manifest_list, name='ajax_get_cargo_manifest_list'),
                  path('mawb/<str:mawb_public_id>/cargo_manifest/', mawb_views.cargo_manifest_page, name='mawb_cargo_manifest'),
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
