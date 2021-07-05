def hawb_globalid_to_model_id(globalid: str):
    id_dgt_count = int(globalid[-1])
    id = int(globalid[-(id_dgt_count + 1):-1])
    return id


def hawb_public_id_to_model_id(public_id: str):
    return hawb_globalid_to_model_id(public_id)
