from datetime import datetime

def days_since_today(date: datetime):
    print(date)
    today = datetime.now().date()
    target_day = date
    delta = target_day - today

    if delta.days == 0:
        return 'Today'

    if delta.days == 1:
        return 'Tomorrow'

    if delta.days == -1:
        return 'Yesterday'

    if delta.days > 1:
        return '{} Days Left'.format(abs(delta.days))

    if delta.days < -1:
        return '{} Days ago'.format(abs(delta.days))


def generate_job_unique_id(job):
    print(job.id)
    year = str(job.created_at.year)[2:]
    month = job.created_at.month

    return 'SI{}{:02d}{:06}'.format(year, month, job.id)

# DeGenerate method is in view helper

