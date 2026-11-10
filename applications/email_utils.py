from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging
from recruitment_platform.emailing import send_platform_email, render_html

logger = logging.getLogger(__name__)


def _company_name(application):
    job = application.job
    if job.company_id:
        return job.company.name
    return job.recruiter.company_name


def _first_name(user):
    return user.first_name or user.get_full_name() or "there"


def send_application_confirmation(application):
    """
    Email the job seeker right after they submit: we have their application,
    and they should keep an eye on the platform for updates.
    Sent from the platform's no-reply address.
    """
    try:
        user = application.applicant.user
        job_title = application.job.title
        company = _company_name(application)
        applied = application.applied_at.strftime('%d %b %Y, %H:%M UTC')
        tracking_url = f"{settings.FRONTEND_URL}/my-applications"

        subject = f"We received your application for {job_title}"
        text = (
            f"Hi {_first_name(user)},\n\n"
            f"Thank you! Your application for {job_title} at {company} was submitted successfully.\n\n"
            f"  Position:  {job_title}\n"
            f"  Company:   {company}\n"
            f"  Submitted: {applied}\n"
            f"  Status:    Submitted\n\n"
            f"What happens next: the {company} hiring team will review your application. "
            f"Please keep an eye on the ThinkGreen Afrika platform - you can follow its progress "
            f"(submitted, under review, shortlisted...) and we'll email you when it changes:\n"
            f"{tracking_url}\n\n"
            f"This is an automated message from a no-reply address, so please don't reply to it.\n\n"
            f"ThinkGreen Afrika"
        )
        html = render_html(
            "Your application was submitted",
            [
                f"Hi {_first_name(user)}, thank you for applying. We've received your application "
                f"and passed it to the {company} hiring team.",
                "Please keep an eye on the platform: you can follow your application as it moves "
                "from submitted to under review and beyond, and we'll email you when its status changes.",
            ],
            details=[("Position", job_title), ("Company", company),
                     ("Submitted", applied), ("Status", "Submitted")],
            button=("Track my application", tracking_url),
        )
        return send_platform_email(subject, text, user.email, html)
    except Exception as e:
        logger.error(f"Failed to send application confirmation: {str(e)}")
        return False


def send_status_update_notification(application):
    """
    Send email notification when application status changes
    """
    try:
        user = application.applicant.user
        job_title = application.job.title
        company = _company_name(application)
        tracking_url = f"{settings.FRONTEND_URL}/my-applications"

        status_messages = {
            'submitted': 'Your application has been submitted successfully.',
            'under_review': 'Good news: the hiring team has started reviewing your application.',
            'shortlisted': 'Congratulations! You have been shortlisted.',
            'rejected': 'Thank you for your interest. Unfortunately, they have decided to move forward with other candidates.',
            'accepted': 'Congratulations! Your application has been accepted.',
        }
        status_label = application.status.replace('_', ' ').title()
        status_message = status_messages.get(application.status, 'Your application status has been updated.')

        subject = f"Update on your application for {job_title}: {status_label}"
        text = (
            f"Hi {_first_name(user)},\n\n"
            f"There's an update on your application for {job_title} at {company}.\n\n"
            f"New status: {status_label}\n"
            f"{status_message}\n\n"
            f"See the details on the platform: {tracking_url}\n\n"
            f"This is an automated message from a no-reply address, so please don't reply to it.\n\n"
            f"ThinkGreen Afrika"
        )
        html = render_html(
            f"Your application is now: {status_label}",
            [f"Hi {_first_name(user)}, {status_message}"],
            details=[("Position", job_title), ("Company", company), ("New status", status_label)],
            button=("View my applications", tracking_url),
        )
        return send_platform_email(subject, text, user.email, html)
    except Exception as e:
        logger.error(f"Failed to send status update notification: {str(e)}")
        return False


def send_interview_invitation(calendar_event):
    """
    Send email invitation for interview
    """
    try:
        if not calendar_event.candidate:
            return False
        
        subject = f'Interview Invitation - {calendar_event.title}'
        
        context = {
            'candidate_name': calendar_event.candidate.user.get_full_name(),
            'event_title': calendar_event.title,
            'event_date': calendar_event.date,
            'location': calendar_event.location or 'To be confirmed',
            'company_name': calendar_event.recruiter.company_name,
            'description': calendar_event.description,
        }
        
        message = f"""
        Dear {context['candidate_name']},
        
        You are invited to an interview for the position at {context['company_name']}.
        
        Interview Details:
        - Title: {context['event_title']}
        - Date & Time: {context['event_date'].strftime('%Y-%m-%d %H:%M')}
        - Location: {context['location']}
        
        {context['description']}
        
        Please confirm your availability.
        
        Best regards,
        The Recruitment Team
        """
        
        if settings.DEBUG:
            logger.info(f"Email to {calendar_event.candidate.user.email}:\n{message}")
        
        # Uncomment when email is configured
        # send_mail(
        #     subject,
        #     message,
        #     settings.DEFAULT_FROM_EMAIL,
        #     [calendar_event.candidate.user.email],
        #     fail_silently=False,
        # )
        
        return True
    except Exception as e:
        logger.error(f"Failed to send interview invitation: {str(e)}")
        return False
