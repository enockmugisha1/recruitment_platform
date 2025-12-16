from django.core.exceptions import ValidationError
from django.utils import timezone
import os


def validate_file_size(file):
    """Validate uploaded file size (max 5MB)"""
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'File size cannot exceed 5MB. Current size: {file.size / (1024 * 1024):.2f}MB')


def validate_file_extension(file):
    """Validate file extensions for resumes and cover letters"""
    allowed_extensions = ['.pdf', '.doc', '.docx']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f'Unsupported file extension. Allowed: {", ".join(allowed_extensions)}')


def validate_image_file(file):
    """Validate image file extensions"""
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f'Unsupported image format. Allowed: {", ".join(allowed_extensions)}')


def validate_deadline(date):
    """Validate that job deadline is in the future"""
    if date < timezone.now().date():
        raise ValidationError('Deadline must be in the future')


def validate_phone_number(phone):
    """Basic phone number validation"""
    import re
    pattern = r'^\+?1?\d{9,15}$'
    if not re.match(pattern, phone):
        raise ValidationError('Enter a valid phone number (9-15 digits, optional + prefix)')
