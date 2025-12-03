from django.db import models
from profiles.models import RecruiterProfile, JobSeekerProfile

# Defines Job model
class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    )

    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    deadline = models.DateField()
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

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to='applications/resumes/')
    cover_letter = models.FileField(upload_to='applications/letters/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant')
        indexes = [
            models.Index(fields=['job']),
            models.Index(fields=['applicant']),
            models.Index(fields=['status']),
            models.Index(fields=['-applied_at']),
            models.Index(fields=['job', 'status']),
        ]

    def __str__(self):
        return f"{self.applicant.user.first_name} -> {self.job.title}"