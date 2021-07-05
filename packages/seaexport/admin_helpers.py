from seaexport.models import SeaExportHBL, SeaExportMBL, SeaExportFreightBooking


def booking_public_id(booking: SeaExportFreightBooking):
    return booking.public_id


booking_public_id.short_description = 'public id'
