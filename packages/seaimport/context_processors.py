from .models import SeaImportSystemSetting, SeaImportAgent


def attach_settings_model(request):
    # print(request.user)
    if request.user.id:
        # print(request.user.id)
        settings = SeaImportSystemSetting.objects.filter(user=request.user).first()
        return {
            'settings': settings,
            'system_owner': SeaImportAgent.objects.filter(name__is_forwarder=True).first()
        }
    else:
        return {'settings': None}
    # pass
