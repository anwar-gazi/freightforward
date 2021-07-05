def type_1_public_id_to_model_id(public_id: str):
    id_dgt_count = int(public_id[-1])
    id = public_id[-(id_dgt_count + 1):-1]
    return id


# def type_2_public_id_to_model_id():
#     pass

def type_1_public_id_to_model_id_exceptionfree(public_id: str):
    if len(public_id) > 1 and public_id[-1].isdigit():  # TODO its not completely errorfree
        id_dgt_count = int(public_id[-1])
        if id_dgt_count and len(public_id) >= (id_dgt_count + 1):
            return type_1_public_id_to_model_id(public_id), True
    else:
        return None, False


def has_numbers(inputstring: str):
    return any(char.isdigit() for char in inputstring)
