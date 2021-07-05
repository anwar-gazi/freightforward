def job_documents_path_rename(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    filePath = 'seaimport/docs/'
    newfilename = 'NLL{}-{}'.format(instance.job, instance.doc_type)
    extension = filename.split(".")[-1]
    return '{}/{}.{}'.format(filePath, newfilename, extension)


def mbl_documents_path_rename(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    filePath = 'seaimport/docs/'
    newfilename = 'MBL{}'.format(instance.mbl_number)
    extension = filename.split(".")[-1]
    return '{}/{}.{}'.format(filePath, newfilename, extension)


def hbl_documents_path_rename(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    filePath = 'seaimport/docs/'
    newfilename = 'HBL{}'.format(instance.hbl_number)
    extension = filename.split(".")[-1]
    return '{}/{}.{}'.format(filePath, newfilename, extension)


def bank_statement_documents(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    filePath = 'seaimport/docs/'
    newfilename = 'JOB{}_HBL{}'.format(instance.hbl.job.id, instance.hbl.id)
    extension = filename.split(".")[-1]
    return '{}/{}.{}'.format(filePath, newfilename, extension)
