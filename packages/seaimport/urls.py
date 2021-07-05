from django.urls import path
from seaimport.views import view_mbl, view_job, view_hbl, view_job_process, view_database_models, \
    view_database_model_list, view_database_model_update, view_search, views

urlpatterns = [
    path('', views.admin_dashboard, name='sea_import_admin_login'),
    path('dashboard', views.admin_dashboard, name='sea_import_admin_dashboard'),
    path('settings', views.user_settings, name='sea_import_user_settings'),

    # MBL URLS
    path('create/mbl', view_mbl.create_new_mbl, name='sea_import_create_mbl'),
    path('update/mbl/<int:mbl_number>', view_mbl.update_mbl, name='sea_import_update_mbl'),
    path('mbl/all', view_mbl.mbl_list_all, name='sea_import_mbl_list_all'),
    path('view/mbl/<int:mbl_number>', view_mbl.view_single_mbl, name='sea_import_view_mbl'),

    # HBL URLS
    path('create/hbl', view_hbl.create_new_hbl, name='sea_import_create_hbl'),
    path('update/hbl/<int:hbl_number>', view_hbl.update_hbl, name='sea_import_update_hbl'),
    path('hbl/all', view_hbl.hbl_list_all, name='sea_import_hbl_list_all'),
    path('view/hbl/<int:hbl_number>', view_hbl.view_single_hbl, name='sea_import_view_hbl'),

    # JOB URLS
    path('create/job', view_job.create_new_job, name='sea_import_create_new_job'),
    path('job/all', view_job.job_list_all, name='sea_import_job_list_all'),
    path('job/<int:job_number>', view_job.job_details, name='sea_import_job_details'),


    # Job processes
    # Forwarding letter
    path('view/fl/<int:hbl_number>', view_job_process.preview_forwarding_letter, name='sea_import_preview_fl'),

    # Invoice
    path('create/invoice/<int:hbl_number>', view_job_process.create_invoice, name='sea_import_create_invoice'),
    path('view/invoice/<int:hbl_number>', view_job_process.view_invoice, name='sea_import_view_invoice'),

    # Delivery order
    path('create/do/<int:hbl_number>', view_job_process.create_delivery_order, name='sea_import_create_do'),
    path('view/do/<int:hbl_number>', view_job_process.view_do, name='sea_import_view_do'),

    # Job costing
    path('create/job/costing/<int:job_number>', view_job_process.create_job_costing, name='sea_import_create_job_costing'),

    # Credit Note
    path('create/creditnote/<int:job_number>', view_job_process.create_credit_note, name='sea_import_create_credit_note'),
    path('update/creditnote/<int:credit_note_number>', view_job_process.update_creditnote, name='sea_import_update_creditnote'),
    path('view/creditnote/<int:credit_note_number>', view_job_process.view_credit_note, name='sea_import_view_creditnote'),

    # Freight Certificate
    path('view/fc/<int:hbl_number>', view_job_process.view_freight_certificate, name='sea_import_view_fc'),


    # Database populate, Example Cities, Airports
    path('create/branch/', view_database_models.create_agent, name='sea_import_create_agent'),
    path('create/company/', view_database_models.create_company, name='sea_import_create_company'),
    path('create/city/', view_database_models.create_city, name='sea_import_create_city'),
    path('create/country/', view_database_models.create_country, name='sea_import_create_country'),
    path('create/expensetype/', view_database_models.create_expense_type, name='sea_import_create_expensetype'),
    path('create/freighttype/', view_database_models.create_freight_type, name='sea_import_create_freighttype'),
    path('create/goodstype/', view_database_models.create_goods_type, name='sea_import_create_goodstype'),
    path('create/doctype/', view_database_models.create_doc_type, name='sea_import_create_doctype'),
    path('create/seaport/', view_database_models.create_port, name='sea_import_create_seaport'),
    path('create/packagetype/', view_database_models.create_package_type, name='sea_import_create_package_type'),
    path('create/containertype/', view_database_models.create_container_type, name='sea_import_create_container_type'),
    path('create/agent/bank', view_database_models.create_agent_bank, name='sea_import_create_agent_bank'),
    path('create/jobcost/type', view_database_models.create_job_costing_expense_type, name='sea_import_create_job_costing_expense_type'),


    # List of populated data. Example Cities, Airports
    path('list/company/', view_database_model_list.list_company, name='sea_import_list_company'),
    path('list/agent/', view_database_model_list.list_agent, name='sea_import_list_agent'),

    # Update populated data, Example Agents, Companies
    path('update/company/<int:id>', view_database_model_update.edit_company, name='sea_import_update_company'),
    path('update/agent/<int:id>', view_database_model_update.edit_agent, name='sea_import_update_agent'),

    # Searches
    path('search/jobs', view_search.search_jobs, name='sea_import_search_jobs'),
    path('search/mbls', view_search.search_mbls, name='sea_import_search_mbls'),
    path('search/hbls', view_search.search_hbls, name='sea_import_search_hbls'),
    path('search/pending/do', view_search.search_do_pending_hbls, name='sea_import_pending_do'),


    # Others
    path('update/task/<int:task_number>', views.job_update_progress, name='sea_import_update_task'),
    path('documents/validity/', views.documents_validity, name='sea_import_documents_validity'),

    # Reports
    path('report/gplisting/', views.gp_listing, name='sea_import_gp_listing'),

    # Extra Pages
    path('dashboard/main', views.dashboard_main, name='dashboard'),
    path('register', views.register, name='register'),


]
