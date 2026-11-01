from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import JobSeekerApplication, CalendarEvent, ApplicationStatusEvent
from .email_utils import send_application_confirmation, send_status_update_notification, send_interview_invitation
import logging

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=JobSeekerApplication)
def remember_previous_status(sender, instance, **kwargs):
    """Remember the old status so we only notify when it actually changes."""
    instance._previous_status = None
    if instance.pk:
        instance._previous_status = (
            JobSeekerApplication.objects.filter(pk=instance.pk)
            .values_list('status', flat=True)
            .first()
        )


@receiver(post_save, sender=JobSeekerApplication)
def application_status_changed(sender, instance, created, **kwargs):
    """
    Signal to handle application status changes and send notifications
    """
    if created:
        # first entry of the application's status history
        ApplicationStatusEvent.objects.create(
            application=instance, status=instance.status, changed_by=instance.applicant.user
        )
        logger.info(f"New application submitted: {instance.applicant.user.email} for {instance.job.title}")
        send_application_confirmation(instance)
    elif getattr(instance, '_previous_status', None) != instance.status:
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