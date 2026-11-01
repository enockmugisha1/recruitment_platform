from django.db import migrations


def backfill_companies(apps, schema_editor):
    """
    Recruiters created before companies existed only had a free-text
    `company_name`. Give each distinct name a real Company and link the
    recruiters to it. The earliest recruiter of each company becomes its
    company admin so somebody can manage the team.
    """
    Company = apps.get_model('profiles', 'Company')
    RecruiterProfile = apps.get_model('profiles', 'RecruiterProfile')

    for profile in RecruiterProfile.objects.filter(company__isnull=True).order_by('id'):
        name = (profile.company_name or '').strip()
        if not name:
            # older recruiters never filled in a company name; use theirs so the
            # business can recognise (and rename) the company afterwards
            owner = f"{profile.user.first_name} {profile.user.last_name}".strip()
            name = f"{owner}'s company" if owner else f"Company {profile.pk}"
            if Company.objects.filter(name__iexact=name).exists():
                name = f"{name} ({profile.pk})"
        company = Company.objects.filter(name__iexact=name).first()
        is_first = company is None
        if company is None:
            company = Company.objects.create(
                name=name,
                website=profile.company_website,
                description=profile.company_description or '',
                logo=profile.company_logo or None,
            )
        profile.company = company
        profile.company_name = company.name
        if is_first:
            profile.is_company_admin = True
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0003_company_flow'),
    ]

    operations = [
        # No reverse: leaving the companies in place on rollback is harmless.
        migrations.RunPython(backfill_companies, migrations.RunPython.noop),
    ]
