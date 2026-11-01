from django.db import models
from django.core.validators import FileExtensionValidator
from django.conf import settings
from profiles.models import RecruiterProfile, JobSeekerProfile, Company
from .validators import validate_file_size, validate_deadline

# Defines Job model
class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    )

    # The recruiter who posted it ...
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    # ... and the company it belongs to. Every recruiter of that company can
    # see and manage it; recruiters of other companies cannot.
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    deadline = models.DateField(validators=[validate_deadline])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['recruiter']),
            models.Index(fields=['job_type']),
            models.Index(fields=['location']),
            models.Index(fields=['deadline']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['title', 'location']),
        ]

    def __str__(self):
        return self.title

# Defines application model
class JobSeekerApplication(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    )

    # Review pipeline: where a recruiter may move an application from each state.
    # submitted -> under_review -> shortlisted -> accepted, with rejection
    # possible along the way. A rejected application can be re-opened.
    ALLOWED_TRANSITIONS = {
        'submitted': ['under_review', 'rejected'],
        'under_review': ['shortlisted', 'rejected'],
        'shortlisted': ['accepted', 'rejected'],
        'accepted': [],
        'rejected': ['under_review'],
    }

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(
        upload_to='applications/resumes/',
        validators=[validate_file_size, FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    cover_letter = models.FileField(
        upload_to='applications/letters/',
        blank=True,
        null=True,
        validators=[validate_file_size, FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['job']),
            models.Index(fields=['applicant']),
            models.Index(fields=['status']),
            models.Index(fields=['-applied_at']),
        ]
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.user.get_full_name()} - {self.job.title}"


# One row per status the application has been in: who moved it and when.
class ApplicationStatusEvent(models.Model):
    application = models.ForeignKey(JobSeekerApplication, on_delete=models.CASCADE, related_name='status_events')
    status = models.CharField(max_length=50, choices=JobSeekerApplication.STATUS_CHOICES)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['changed_at', 'id']

    def __str__(self):
        return f"{self.application_id}: {self.status}"


# Defines Calendar Event model for interview scheduling
class CalendarEvent(models.Model):
    EVENT_TYPE_CHOICES = (
        ('interview', 'Interview'),
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
        ('other', 'Other'),
    )

    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=255)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='interview')
    date = models.DateTimeField()
    candidate = models.ForeignKey(JobSeekerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews')
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['recruiter']),
            models.Index(fields=['event_type']),
            models.Index(fields=['date']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['date']

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d %H:%M')}"