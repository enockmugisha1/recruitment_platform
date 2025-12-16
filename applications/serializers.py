from datetime import date
from rest_framework import serializers
from .models import JobSeekerApplication, Job, CalendarEvent
from profiles.models import JobSeekerProfile
import os

class JobSerializer(serializers.ModelSerializer):
    recruiter = serializers.PrimaryKeyRelatedField(read_only=True)
    salary_range = serializers.CharField(required=False)
    deadline = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

    def validate_deadline(self, value):
        if value < date.today():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

class JobSeekerApplicationSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())
    applicant = serializers.PrimaryKeyRelatedField(read_only=True)
    cover_letter = serializers.FileField(required=False)

    class Meta:
        model = JobSeekerApplication
        fields = '__all__'

    read_only_fields = ['status', 'applied_at']

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
