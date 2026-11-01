import hashlib
import secrets
import logging
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

def hash_otp(otp_code):
    """Hash OTP code using SHA-256 for secure storage"""
    return hashlib.sha256(otp_code.encode()).hexdigest()

def generate_otp(length=6):
    """Generate a secure OTP code"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])

def verify_otp_hash(otp_code, hashed_otp):
    """Verify OTP code against hashed version"""
    return hash_otp(otp_code) == hashed_otp

def check_rate_limit(identifier, limit=5, period=3600):
    """
    Check rate limiting for operations
    identifier: unique identifier (e.g., user email, IP)
    limit: maximum number of attempts
    period: time period in seconds (default: 1 hour)
    """
    cache_key = f"rate_limit:{identifier}"
    attempts = cache.get(cache_key, 0)
    
    if attempts >= limit:
        logger.warning(f"Rate limit exceeded for {identifier}")
        return False
    
    cache.set(cache_key, attempts + 1, period)
    return True

def log_security_event(event_type, user, details, level="INFO"):
    """Log security-related events"""
    log_message = f"Security Event: {event_type} | User: {user} | Details: {details}"
    
    if level == "WARNING":
        logger.warning(log_message)
    elif level == "ERROR":
        logger.error(log_message)
    elif level == "CRITICAL":
        logger.critical(log_message)
    else:
        logger.info(log_message)


def build_user_data(user):
    """
    The user payload the frontend stores after login / refreshes via /auth/me/.
    For recruiters it carries their company so the UI can show it and decide
    whether to offer the team page.
    """
    data = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_email_verified": user.is_email_verified,
        "must_change_password": user.must_change_password,
        "company": None,
        "is_company_admin": False,
    }
    if user.role == "recruiter":
        profile = getattr(user, "recruiter_profile", None)
        if profile is not None and profile.company_id:
            data["company"] = {"id": profile.company_id, "name": profile.company.name}
            data["is_company_admin"] = profile.is_company_admin
    return data
