from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import OTP
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clean up expired and used OTP codes'

    def handle(self, *args, **options):
        # Delete expired OTPs
        expired_otps = OTP.objects.filter(expires_at__lt=timezone.now())
        expired_count = expired_otps.count()
        expired_otps.delete()
        
        # Delete used OTPs older than 7 days
        week_ago = timezone.now() - timezone.timedelta(days=7)
        old_used_otps = OTP.objects.filter(is_used=True, used_at__lt=week_ago)
        used_count = old_used_otps.count()
        old_used_otps.delete()
        
        total_deleted = expired_count + used_count
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully cleaned up {total_deleted} OTPs '
                f'({expired_count} expired, {used_count} old used)'
            )
        )
        logger.info(f'Cleaned up {total_deleted} OTPs')
