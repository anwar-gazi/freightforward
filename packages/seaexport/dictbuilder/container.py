from seaexport.models import ContainerType


def container_dict(container: ContainerType):
    return {
        'id': container.id,
        'name': container.name,
        'length_ft': container.length_ft,
        'width_ft': container.width_ft,
        'height_ft': container.height_ft,
        'capacity_cbm': container.capacity_cbm
    }
