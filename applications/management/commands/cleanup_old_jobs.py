from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from applications.models import Job
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Archive or delete jobs with expired deadlines'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days after deadline to consider a job for cleanup (default: 90)'
        )
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete jobs instead of just reporting them'
        )

    def handle(self, *args, **options):
        days = options['days']
        should_delete = options['delete']
        
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        old_jobs = Job.objects.filter(deadline__lt=cutoff_date)
        count = old_jobs.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No old jobs found'))
            return
        
        if should_delete:
            old_jobs.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {count} old jobs')
            )
            logger.info(f'Deleted {count} jobs with deadline before {cutoff_date}')
        else:
            self.stdout.write(
                self.style.WARNING(f'Found {count} old jobs. Use --delete to remove them.')
            )
            for job in old_jobs[:10]:  # Show first 10
                self.stdout.write(f'  - {job.title} (Deadline: {job.deadline})')
