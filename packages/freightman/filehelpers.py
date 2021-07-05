import os


def basename_and_extension(name: str):
    basename = name.replace('.' + name.split('.')[-1], '') if len(name.split('.')) > 1 else name
    ext = name.split('.')[-1] if len(name.split('.')) > 1 else ''
    return basename, ext


def truncate_filename(filename: str, length: int):
    basename, ext = os.path.splitext(filename)
    basename = basename[:length]  # limit in db field
    final = '{}{}'.format(basename, ext)
    return final
