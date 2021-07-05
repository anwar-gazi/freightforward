from .public_id_helpers import type_1_public_id_to_model_id


def consolidation_job_number_to_model_id(job_number: str):
    return type_1_public_id_to_model_id(job_number)
