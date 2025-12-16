from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import JobSeekerApplication, CalendarEvent
from .email_utils import send_application_confirmation, send_status_update_notification, send_interview_invitation
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=JobSeekerApplication)
def application_status_changed(sender, instance, created, **kwargs):
    """
    Signal to handle application status changes and send notifications
    """
    if created:
        logger.info(f"New application submitted: {instance.applicant.user.email} for {instance.job.title}")
        send_application_confirmation(instance)
    else:
        logger.info(f"Application status updated: {instance.applicant.user.email} - {instance.status}")
        send_status_update_notification(instance)


@receiver(post_save, sender=CalendarEvent)
def calendar_event_created(sender, instance, created, **kwargs):
    """
    Signal to send interview invitations when calendar events are created
    """
    if created and instance.event_type == 'interview' and instance.candidate:
        logger.info(f"Interview scheduled for {instance.candidate.user.email} on {instance.date}")
        send_interview_invitation(instance)
