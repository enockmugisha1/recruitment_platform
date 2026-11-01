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
    
# A hiring company registered on the platform by the business (ThinkGreen Afrika).
# Recruiters belong to exactly one company and only work with that company's jobs.
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    contact_email = models.EmailField(blank=True, default="")
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    # An inactive company's recruiters cannot log in and its jobs are hidden from job seekers
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='companies_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name


# Defines recruiter profile
class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    # The company this recruiter works for (one company -> many recruiters)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='recruiters', null=True, blank=True)
    # Company admins can add / manage the other recruiters of their company
    is_company_admin = models.BooleanField(default=False)
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} - {self.company_name}"

    def save(self, *args, **kwargs):
        # keep the legacy company_name column in step with the Company record
        if self.company_id and self.company:
            self.company_name = self.company.name
        super().save(*args, **kwargs)
