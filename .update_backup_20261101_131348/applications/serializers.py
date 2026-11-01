from datetime import date
from rest_framework import serializers
from .models import JobSeekerApplication, Job, CalendarEvent
from profiles.models import JobSeekerProfile
import os

class JobSerializer(serializers.ModelSerializer):
    recruiter = serializers.PrimaryKeyRelatedField(read_only=True)
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True, default=None)
    posted_by = serializers.SerializerMethodField()
    salary_range = serializers.CharField(required=False)
    deadline = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

    def get_posted_by(self, obj):
        user = obj.recruiter.user
        return f"{user.first_name} {user.last_name}".strip() or user.email

    def validate_deadline(self, value):
        if value < date.today():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

class JobSeekerApplicationSerializer(serializers.ModelSerializer):
    """
    Application payload.

    `job` and `applicant` stay plain ids (existing clients rely on that);
    everything a recruiter needs to review the submission is added as
    read-only fields so the UI doesn't have to make extra requests.
    """
    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())
    applicant = serializers.PrimaryKeyRelatedField(read_only=True)
    cover_letter = serializers.FileField(required=False)

    # Job info
    job_title = serializers.CharField(source='job.title', read_only=True)

    # Applicant info (taken from the account + profile at read time)
    first_name = serializers.CharField(source='applicant.user.first_name', read_only=True)
    last_name = serializers.CharField(source='applicant.user.last_name', read_only=True)
    email = serializers.EmailField(source='applicant.user.email', read_only=True)
    phone = serializers.CharField(source='applicant.phone', read_only=True)
    location = serializers.CharField(source='applicant.location', read_only=True)
    years_of_experience = serializers.IntegerField(source='applicant.years_of_experience', read_only=True)
    education = serializers.CharField(source='applicant.education', read_only=True)
    linkedin = serializers.CharField(source='applicant.linkedin', read_only=True)
    picture = serializers.SerializerMethodField()

    # Personal details from the applicant's profile (visible to the applicant
    # and to recruiters of the company the job belongs to — nobody else can
    # reach this application at all)
    nationality = serializers.CharField(source='applicant.nationality', read_only=True)
    bio = serializers.CharField(source='applicant.bio', read_only=True)
    institution_or_company = serializers.CharField(source='applicant.institution_or_company', read_only=True)
    gender = serializers.CharField(source='applicant.get_gender_display', read_only=True)
    date_of_birth = serializers.DateField(source='applicant.date_of_birth', read_only=True)
    website = serializers.CharField(source='applicant.website', read_only=True)

    company_name = serializers.CharField(source='job.company.name', read_only=True, default=None)
    status_history = serializers.SerializerMethodField()

    # Alias kept for older frontend code that reads `submitted_at`
    submitted_at = serializers.DateTimeField(source='applied_at', read_only=True)

    # Which status values the recruiter may move this application to next
    allowed_next_statuses = serializers.SerializerMethodField()

    class Meta:
        model = JobSeekerApplication
        fields = '__all__'
        # NOTE: this used to sit *outside* Meta, where DRF ignores it, which
        # meant an applicant could post their own `status`.
        read_only_fields = ['status', 'applied_at']

    def get_picture(self, obj):
        pic = obj.applicant.picture
        if not pic:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(pic.url) if request else pic.url

    def get_allowed_next_statuses(self, obj):
        # only meaningful to recruiters; applicants cannot move their own application
        request = self.context.get('request')
        if request is not None and getattr(request.user, 'role', None) != 'recruiter':
            return []
        return JobSeekerApplication.ALLOWED_TRANSITIONS.get(obj.status, [])

    def get_status_history(self, obj):
        """Every status the application has been in. Recruiters also see who moved it."""
        request = self.context.get('request')
        is_recruiter = request is not None and getattr(request.user, 'role', None) == 'recruiter'
        history = []
        for event in obj.status_events.all():  # prefetched, ordered by time
            entry = {'status': event.status, 'changed_at': event.changed_at}
            if is_recruiter:
                by = event.changed_by
                entry['changed_by'] = (f"{by.first_name} {by.last_name}".strip() or by.email) if by else None
            history.append(entry)
        return history

    def validate_job(self, job):
        # Only enforced when submitting, not when a file is replaced later.
        if self.instance is None:
            if job.deadline < date.today():
                raise serializers.ValidationError("The deadline for this job has passed.")
            if job.company_id and not job.company.is_active:
                raise serializers.ValidationError("This job is no longer accepting applications.")
        return job

    def validate_file_extension(self, file):
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
        valid_extensions = ['.pdf', '.docx']
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError("Only PDF and DOCX files are allowed.")
        if file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError("File size should not exceed 5MB.")
        return file

    def validate_resume(self, value):
        return self.validate_file_extension(value)

    def validate_cover_letter(self, value):
        if value:
            return self.validate_file_extension(value)
        return value


class ApplicationStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=JobSeekerApplication.STATUS_CHOICES)


class CalendarEventSerializer(serializers.ModelSerializer):
    recruiter = serializers.PrimaryKeyRelatedField(read_only=True)
    candidate = serializers.PrimaryKeyRelatedField(
        queryset=JobSeekerProfile.objects.all(),
        required=False,
        allow_null=True
    )
    date = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', input_formats=['%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M', 'iso-8601'])
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    
    # Additional fields for display
    candidate_name = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = CalendarEvent
        fields = '__all__'

    def get_candidate_name(self, obj):
        if obj.candidate:
            return obj.candidate.user.get_full_name()
        return None

    def get_time(self, obj):
        return obj.date.strftime('%I:%M %p')

    def validate_date(self, value):
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value

    def validate(self, data):
        # If event type is interview, candidate should be provided
        if data.get('event_type') == 'interview' and not data.get('candidate'):
            raise serializers.ValidationError({
                "candidate": "Candidate is required for interview events."
            })
        return data