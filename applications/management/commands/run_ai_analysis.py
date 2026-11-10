from django.core.management.base import BaseCommand, CommandError

from applications.ai import analyze_application, ml_is_configured
from applications.models import ApplicationAIAnalysis, JobSeekerApplication


class Command(BaseCommand):
    help = (
        "Run the ML analysis for applications that have none yet (submitted before the "
        "model was deployed) or whose analysis failed. Needs ML_SERVICE_URL to be set."
    )

    def add_arguments(self, parser):
        parser.add_argument('--all', action='store_true', help="Re-analyse every application, even completed ones.")

    def handle(self, *args, **opts):
        if not ml_is_configured():
            raise CommandError("ML_SERVICE_URL is not set, so there is no ML service to call.")

        done = ApplicationAIAnalysis.objects.filter(status='completed').values_list('application_id', flat=True)
        queryset = JobSeekerApplication.objects.all()
        if not opts['all']:
            queryset = queryset.exclude(pk__in=done)

        total = ok = 0
        for application in queryset.order_by('id'):
            total += 1
            result = analyze_application(application.pk, force=True)
            ok += int(bool(result and result.status == 'completed'))
            self.stdout.write(f"  application {application.pk}: {result.status if result else 'missing'}")
        self.stdout.write(self.style.SUCCESS(f"Analysed {ok} of {total} applications."))
