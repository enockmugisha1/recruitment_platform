import re
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _

def validate_email_format(email):
    """Validate email format and reject suspicious patterns"""
    validator = EmailValidator()
    try:
        validator(email)
    except ValidationError:
        raise ValidationError(_("Invalid email format"))
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r'\.\.', # consecutive dots
        r'^\.',  # starts with dot
        r'\.$',  # ends with dot
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, email.split('@')[0]):
            raise ValidationError(_("Email contains invalid patterns"))
    
    return email

def validate_phone_number(phone):
    """Validate phone number format"""
    if not phone:
        return phone
    
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Check if it contains only digits and optional + at start
    if not re.match(r'^\+?\d{10,15}$', cleaned):
        raise ValidationError(_("Invalid phone number format. Use 10-15 digits with optional + prefix"))
    
    return phone

def validate_password_strength(password):
    """Validate password meets security requirements"""
    if len(password) < 8:
        raise ValidationError(_("Password must be at least 8 characters long"))
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError(_("Password must contain at least one uppercase letter"))
    
    if not re.search(r'[a-z]', password):
        raise ValidationError(_("Password must contain at least one lowercase letter"))
    
    if not re.search(r'\d', password):
        raise ValidationError(_("Password must contain at least one digit"))
    
    # Check for common passwords
    common_passwords = ['password', '12345678', 'qwerty', 'abc123']
    if password.lower() in common_passwords:
        raise ValidationError(_("Password is too common"))
    
    return password

def validate_name(name):
    """Validate name fields"""
    if not name:
        return name
    
    # Allow only letters, spaces, hyphens, and apostrophes
    if not re.match(r"^[a-zA-Z\s\-']+$", name):
        raise ValidationError(_("Name can only contain letters, spaces, hyphens, and apostrophes"))
    
    if len(name) < 2:
        raise ValidationError(_("Name must be at least 2 characters long"))
    
    if len(name) > 50:
        raise ValidationError(_("Name must not exceed 50 characters"))
    
    return name.strip()

def sanitize_input(text, max_length=None):
    """Sanitize text input to prevent XSS and injection attacks"""
    if not text:
        return text
    
    # Remove potential script tags and dangerous characters
    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',  # event handlers
    ]
    
    cleaned = text
    for pattern in dangerous_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)
    
    # Trim whitespace
    cleaned = cleaned.strip()
    
    # Apply max length if specified
    if max_length and len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    
    return cleaned
