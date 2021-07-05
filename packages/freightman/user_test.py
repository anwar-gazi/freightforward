from django.contrib.auth import get_user_model
from freightman.models import AuthLevelPermissions, UserAuthLevel


def is_logged_user(user: get_user_model()):
    return not user.is_anonymous


def is_superuser(user: get_user_model()):
    return user.is_superuser


def user_has_auth_level_assigned(user: get_user_model()):
    return UserAuthLevel.objects.filter(user=user).exists()


def can_do_airexport_frt_booking(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_do_airexport_frt_booking


def can_access_airexport_frt_bookinglist(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_frt_bookinglist


def can_access_airexport_hbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_hbl_create


def can_access_airexport_mbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_mbl_create


def can_access_airexport_hbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_hbl_list


def can_access_airexport_mbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_mbl_list


def can_access_airexport_consolidation(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_consolidation


def can_access_airexport_invoice_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_invoice_create


def can_access_airexport_invoice_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_invoice_list


def can_access_airexport_job_costing_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_job_costing_create


def can_access_airexport_job_costing_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_job_costing_list


def can_access_airexport_gp_listing(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_airexport_gp_listing


def can_access_anything_of_airexport(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_anything_of_airexport


def can_do_seaexport_frt_booking(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_do_seaexport_frt_booking


def can_access_seaexport_frt_bookinglist(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_frt_bookinglist


def can_access_seaexport_hbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_hbl_create


def can_access_seaexport_mbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_mbl_create


def can_access_seaexport_hbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_hbl_list


def can_access_seaexport_mbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_mbl_list


def can_access_seaexport_consolidation(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_consolidation


def can_access_seaexport_invoice_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_invoice_create


def can_access_seaexport_invoice_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_invoice_list


def can_access_seaexport_job_costing_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_job_costing_create


def can_access_seaexport_job_costing_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_job_costing_list


def can_access_seaexport_gp_listing(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaexport_gp_listing


def can_access_anything_of_seaexport(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_anything_of_seaexport


def can_do_seaimport_frt_booking(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_do_seaimport_frt_booking


def can_access_seaimport_frt_bookinglist(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_frt_bookinglist


def can_access_seaimport_hbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_hbl_create


def can_access_seaimport_mbl_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_mbl_create


def can_access_seaimport_hbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_hbl_list


def can_access_seaimport_mbl_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_mbl_list


def can_access_seaimport_consolidation(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_consolidation


def can_access_seaimport_invoice_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_invoice_create


def can_access_seaimport_invoice_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_invoice_list


def can_access_seaimport_job_costing_create(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_job_costing_create


def can_access_seaimport_job_costing_list(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_job_costing_list


def can_access_seaimport_gp_listing(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_seaimport_gp_listing


def can_access_anything_of_seaimport(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_anything_of_seaimport


def can_create_user(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_create_user


def can_list_user(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_list_user


def can_access_anything_of_user_management(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_anything_of_user_management


def can_create_supplier(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_create_supplier


def can_list_supplier(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_list_supplier


def can_access_site_settings(user: get_user_model()):
    user_auth_level = UserAuthLevel.objects.filter(user=user).first()
    return is_logged_user(user) and user_has_auth_level_assigned(user) and user_auth_level.auth_level.can_access_site_settings
