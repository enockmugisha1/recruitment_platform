from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model() # Custom user

# Defines recruiter profile
class JobSeekerProfile(models.Model):
    GENDER_CHOICES=[
        ("M", "Male"),
        ("F", "Female"),
        ("N", "Prefer not to say"),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='job_seeker_profile')
    # Free-text location, e.g. "Kigali, Rwanda"
    location = models.CharField(max_length=255)
    nationality = models.CharField(max_length=255, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    education = models.CharField(max_length=255, blank=True, default="")
    institution_or_company = models.CharField(max_length=255, blank=True, default="")
    years_of_experience = models.PositiveIntegerField(default=0)
    phone = models.CharField(max_length=255, blank=True, default="")
    gender = models.CharField(choices=GENDER_CHOICES, max_length=20)
    date_of_birth = models.DateField(blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    linkedin = models.URLField(max_length=255, blank=True, null=True)
    picture = models.ImageField(upload_to="profile_pictures/", max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}'s profile"
    
# Defines recruiter profile
class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.company_name}"