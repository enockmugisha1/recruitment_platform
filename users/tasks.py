from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP
import logging

logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_otps():
    """Clean up expired OTP codes from database"""
    try:
        expired_count = OTP.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()[0]
        
        logger.info(f"Cleaned up {expired_count} expired OTP codes")
        return f"Deleted {expired_count} expired OTPs"
    except Exception as e:
        logger.error(f"Error cleaning up OTPs: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def cleanup_old_used_otps():
    """Clean up used OTP codes older than 7 days"""
    try:
        threshold = timezone.now() - timezone.timedelta(days=7)
        old_otps_count = OTP.objects.filter(
            is_used=True,
            used_at__lt=threshold
        ).delete()[0]
        
        logger.info(f"Cleaned up {old_otps_count} old used OTP codes")
        return f"Deleted {old_otps_count} old used OTPs"
    except Exception as e:
        logger.error(f"Error cleaning up old OTPs: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_otp_email(email, otp_code, purpose):
    """Send OTP code via email"""
    try:
        purpose_text = {
            'email_verification': 'Email Verification',
            'password_reset': 'Password Reset',
            '2fa_login': 'Two-Factor Authentication'
        }.get(purpose, 'Verification')
        
        subject = f'Your {purpose_text} Code'
        message = f"""
        Hello,
        
        Your {purpose_text} code is: {otp_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        TGA Recruitment Platform Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        logger.info(f"OTP email sent to {email} for {purpose}")
        return f"Email sent to {email}"
    
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_welcome_email(email, first_name):
    """Send welcome email to new users"""
    try:
        subject = 'Welcome to TGA Recruitment Platform'
        message = f"""
        Hello {first_name},
        
        Welcome to TGA Recruitment Platform!
        
        Your account has been successfully created. You can now start exploring job opportunities
        or post your job listings depending on your account type.
        
        If you have any questions, feel free to contact our support team.
        
        Best regards,
        TGA Recruitment Platform Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        logger.info(f"Welcome email sent to {email}")
        return f"Welcome email sent to {email}"
    
    except Exception as e:
        logger.error(f"Error sending welcome email to {email}: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def unlock_locked_accounts():
    """Unlock accounts that have passed their lock duration"""
    try:
        from .models import MyUser
        
        unlocked_count = MyUser.objects.filter(
            account_locked_until__lt=timezone.now()
        ).update(
            failed_login_attempts=0,
            account_locked_until=None
        )
        
        logger.info(f"Unlocked {unlocked_count} accounts")
        return f"Unlocked {unlocked_count} accounts"
    
    except Exception as e:
        logger.error(f"Error unlocking accounts: {str(e)}")
        return f"Error: {str(e)}"
