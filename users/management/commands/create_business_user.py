import getpass

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from users.validators import validate_password_strength

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Create (or promote) a ThinkGreen Afrika business account. Business users log in "
        "at /business, register companies and create their recruiters. There is no public "
        "sign-up for this role, so this is how the first one is made."
    )

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True)
        parser.add_argument('--first-name', default='')
        parser.add_argument('--last-name', default='')
        parser.add_argument('--password', help="If omitted you are prompted for it.")

    def handle(self, *args, **opts):
        email = opts['email'].lower().strip()
        password = opts['password'] or getpass.getpass('Password: ')
        try:
            validate_password_strength(password)
        except Exception as exc:
            raise CommandError('; '.join(getattr(exc, 'messages', [str(exc)])))

        user = User.objects.filter(email=email).first()
        if user:
            if user.role in ('recruiter', 'job_seeker') and not self._confirm(user):
                raise CommandError(f"{email} already exists as a {user.role}; not changing it.")
            user.role = 'business'
            user.set_password(password)
            user.must_change_password = False
            user.is_email_verified = True
            user.is_active = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Updated {email} to a business account."))
        else:
            User.objects.create_user(
                email=email, role='business', password=password,
                first_name=opts['first_name'], last_name=opts['last_name'],
                username=email, is_email_verified=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Created business account {email}."))

    def _confirm(self, user):
        return input(f"{user.email} is currently a {user.role}. Convert to business? [y/N] ").lower() == 'y'
