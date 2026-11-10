from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from recruitment_platform.background import run_in_background
from .ai import queue_analysis
from .models import JobSeekerApplication, CalendarEvent, ApplicationStatusEvent
from .email_utils import send_application_confirmation, send_status_update_notification, send_interview_invitation
import logging

logger = logging.getLogger(__name__)


def _load(application_id):
    return JobSeekerApplication.objects.select_related(
        'job__company', 'job__recruiter', 'applicant__user').get(pk=application_id)


def _notify_submission(application_id):
    send_application_confirmation(_load(application_id))


def _notify_status_change(application_id):
    send_status_update_notification(_load(application_id))


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
        # "we received your application" email, sent once the submission is committed,
        # without making the applicant wait for the mail server
        transaction.on_commit(lambda: run_in_background(_notify_submission, instance.pk))
        # hand the application to the ML model (recruiter-only results)
        queue_analysis(instance)
    elif getattr(instance, '_previous_status', None) != instance.status:
        logger.info(f"Application status updated: {instance.applicant.user.email} - {instance.status}")
        transaction.on_commit(lambda: run_in_background(_notify_status_change, instance.pk))


@receiver(post_save, sender=CalendarEvent)
def calendar_event_created(sender, instance, created, **kwargs):
    """
    Signal to send interview invitations when calendar events are created
    """
    if created and instance.event_type == 'interview' and instance.candidate:
        logger.info(f"Interview scheduled for {instance.candidate.user.email} on {instance.date}")
        send_interview_invitation(instance)