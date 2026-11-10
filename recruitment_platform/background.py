"""
Run slow, non-essential work (emails, calling the ML service) without making
the person who clicked "Submit" wait for it.

A plain daemon thread is used so no extra infrastructure (Redis/Celery worker)
is needed. Set BACKGROUND_TASKS_SYNC=True to run the work inline instead
(that is what the test-suite does, so tests are deterministic).
"""
import logging
import threading

from django.conf import settings
from django.db import close_old_connections

logger = logging.getLogger(__name__)


def run_in_background(func, *args, **kwargs):
    def runner():
        try:
            func(*args, **kwargs)
        except Exception:
            logger.exception("Background task %s failed", getattr(func, '__name__', func))
        finally:
            close_old_connections()  # a thread gets its own DB connection

    if getattr(settings, 'BACKGROUND_TASKS_SYNC', False):
        runner()
    else:
        threading.Thread(target=runner, daemon=True).start()
