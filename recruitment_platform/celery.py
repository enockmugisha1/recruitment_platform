import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment_platform.settings')

app = Celery('recruitment_platform')

# Load config from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Periodic tasks configuration
app.conf.beat_schedule = {
    'cleanup-expired-otps-every-hour': {
        'task': 'users.tasks.cleanup_expired_otps',
        'schedule': crontab(minute=0),  # Run every hour
    },
    'cleanup-old-used-otps-daily': {
        'task': 'users.tasks.cleanup_old_used_otps',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
    },
    'unlock-locked-accounts-every-5-minutes': {
        'task': 'users.tasks.unlock_locked_accounts',
        'schedule': crontab(minute='*/5'),  # Run every 5 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
