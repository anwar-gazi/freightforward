def booking_globalid_invalid_format(booking_globalid: str):
    pass


def booking_globalid_to_model_id(booking_globalid: str):
    print('\n\n\n\n',booking_globalid)
    id_dgt_count = int(booking_globalid[-1])
    id = int(booking_globalid[-(id_dgt_count + 1):-1])
    return id
