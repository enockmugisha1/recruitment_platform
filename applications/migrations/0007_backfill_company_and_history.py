from django.db import migrations
from django.utils import timezone


def backfill(apps, schema_editor):
    Job = apps.get_model('applications', 'Job')
    Application = apps.get_model('applications', 'JobSeekerApplication')
    Event = apps.get_model('applications', 'ApplicationStatusEvent')

    # Jobs belong to the company of the recruiter who posted them
    for job in Job.objects.filter(company__isnull=True).select_related('recruiter'):
        if job.recruiter.company_id:
            job.company_id = job.recruiter.company_id
            job.save(update_fields=['company'])

    # Seed a status history for applications that already exist. Their real
    # change dates were never stored, so a status other than "submitted" is
    # stamped with the time of this migration.
    for app in Application.objects.all().select_related('applicant'):
        if Event.objects.filter(application=app).exists():
            continue
        first = Event.objects.create(application=app, status='submitted',
                                     changed_by_id=app.applicant.user_id)
        Event.objects.filter(pk=first.pk).update(changed_at=app.applied_at)
        if app.status != 'submitted':
            Event.objects.create(application=app, status=app.status)


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0006_company_flow'),
        ('profiles', '0004_backfill_companies'),
    ]

    operations = [
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
