from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_application_confirmation(application):
    """
    Send email confirmation to applicant after submitting application
    """
    try:
        subject = f'Application Received - {application.job.title}'
        
        context = {
            'applicant_name': application.applicant.user.get_full_name(),
            'job_title': application.job.title,
            'company_name': application.job.recruiter.company_name,
            'applied_at': application.applied_at,
        }
        
        # For now, just log the email content
        message = f"""
        Dear {context['applicant_name']},
        
        Thank you for applying for the position of {context['job_title']} at {context['company_name']}.
        
        We have received your application and will review it shortly.
        You will be notified of any updates regarding your application status.
        
        Application Details:
        - Position: {context['job_title']}
        - Company: {context['company_name']}
        - Applied: {context['applied_at'].strftime('%Y-%m-%d %H:%M')}
        
        Best regards,
        The Recruitment Team
        """
        
        if settings.DEBUG:
            logger.info(f"Email to {application.applicant.user.email}:\n{message}")
        
        # Uncomment when email is configured
        # send_mail(
        #     subject,
        #     message,
        #     settings.DEFAULT_FROM_EMAIL,
        #     [application.applicant.user.email],
        #     fail_silently=False,
        # )
        
        return True
    except Exception as e:
        logger.error(f"Failed to send application confirmation: {str(e)}")
        return False


def send_status_update_notification(application):
    """
    Send email notification when application status changes
    """
    try:
        subject = f'Application Status Update - {application.job.title}'
        
        status_messages = {
            'submitted': 'Your application has been submitted successfully.',
            'under_review': 'Your application is currently under review.',
            'shortlisted': 'Congratulations! You have been shortlisted for an interview.',
            'rejected': 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.',
            'accepted': 'Congratulations! Your application has been accepted.',
        }
        
        context = {
            'applicant_name': application.applicant.user.get_full_name(),
            'job_title': application.job.title,
            'company_name': application.job.recruiter.company_name,
            'status': application.status,
            'status_message': status_messages.get(application.status, 'Your application status has been updated.'),
        }
        
        message = f"""
        Dear {context['applicant_name']},
        
        Your application for the position of {context['job_title']} at {context['company_name']} has been updated.
        
        New Status: {context['status'].replace('_', ' ').title()}
        
        {context['status_message']}
        
        Best regards,
        The Recruitment Team
        """
        
        if settings.DEBUG:
            logger.info(f"Email to {application.applicant.user.email}:\n{message}")
        
        # Uncomment when email is configured
        # send_mail(
        #     subject,
        #     message,
        #     settings.DEFAULT_FROM_EMAIL,
        #     [application.applicant.user.email],
        #     fail_silently=False,
        # )
        
        return True
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
