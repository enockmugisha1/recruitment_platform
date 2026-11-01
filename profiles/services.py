"""
Creating recruiter accounts for a company.

Recruiters never sign up themselves: the business (or their company's admin)
creates them here. Each gets a generated temporary password, which is emailed
to them and flagged ``must_change_password`` so they have to choose their own
the first time they log in.
"""
import logging
import secrets
import string

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import transaction

from .models import RecruiterProfile

logger = logging.getLogger(__name__)
User = get_user_model()

# no 0/O, 1/l/I so a password read off an email or screen isn't ambiguous
_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
_LOWER = "abcdefghijkmnopqrstuvwxyz"
_DIGITS = "23456789"
_SYMBOLS = "!@#$%&*?"


def generate_temporary_password(length=12):
    """Random password that satisfies the platform's password rules."""
    chars = [
        secrets.choice(_UPPER),
        secrets.choice(_LOWER),
        secrets.choice(_DIGITS),
        secrets.choice(_SYMBOLS),
    ]
    pool = _UPPER + _LOWER + _DIGITS + _SYMBOLS
    chars += [secrets.choice(pool) for _ in range(length - len(chars))]
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def send_credentials_email(user, company, temporary_password, reset=False):
    """Email the login details. Returns True if the mail backend accepted it."""
    login_url = f"{settings.FRONTEND_URL}/login"
    if reset:
        subject = "Your ThinkGreen Afrika password has been reset"
        intro = f"Your password for the {company.name} recruiter account has been reset."
    else:
        subject = f"Your ThinkGreen Afrika recruiter account for {company.name}"
        intro = (
            f"An account has been created for you on the ThinkGreen Afrika recruitment "
            f"platform so you can manage hiring for {company.name}."
        )

    message = (
        f"Hello {user.first_name or 'there'},\n\n"
        f"{intro}\n\n"
        f"Log in here: {login_url}\n"
        f"Email: {user.email}\n"
        f"Temporary password: {temporary_password}\n\n"
        f"You will be asked to choose a new password the first time you log in.\n"
        f"If you were not expecting this email, please ignore it or contact your company administrator.\n\n"
        f"ThinkGreen Afrika"
    )
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        return True
    except Exception as exc:  # SMTP down, bad credentials, ...
        logger.error("Could not send credentials email to %s: %s", user.email, exc)
        return False


@transaction.atomic
def _create_recruiter(company, first_name, last_name, email, is_company_admin, temporary_password):
    user = User.objects.create_user(
        email=email,
        role="recruiter",
        password=temporary_password,
        first_name=first_name,
        last_name=last_name,
        username=email,
        # created by the company/business, so the address is trusted
        is_email_verified=True,
        must_change_password=True,
    )
    profile = RecruiterProfile.objects.create(
        user=user,
        company=company,
        company_name=company.name,
        is_company_admin=is_company_admin,
    )
    return profile


def provision_recruiter(company, first_name, last_name, email, is_company_admin=False):
    """
    Create a recruiter for ``company`` and email them their temporary password.
    Returns ``(profile, temporary_password, email_sent)``. The temporary password
    is returned once so whoever added the recruiter can pass it on if the email
    does not arrive; it is not stored anywhere in readable form.
    """
    temporary_password = generate_temporary_password()
    profile = _create_recruiter(company, first_name, last_name, email, is_company_admin, temporary_password)
    email_sent = send_credentials_email(profile.user, company, temporary_password)
    return profile, temporary_password, email_sent


def reset_recruiter_password(profile):
    """Give an existing recruiter a new temporary password (and make them change it)."""
    temporary_password = generate_temporary_password()
    user = profile.user
    user.set_password(temporary_password)
    user.must_change_password = True
    user.failed_login_attempts = 0
    user.account_locked_until = None
    user.save(update_fields=["password", "must_change_password", "failed_login_attempts", "account_locked_until"])
    email_sent = send_credentials_email(user, profile.company, temporary_password, reset=True)
    return temporary_password, email_sent
