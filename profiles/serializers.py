from rest_framework import serializers
from .models import JobSeekerProfile, RecruiterProfile
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()  # Custom user

# Serializer class for Job seeker
class JobSeekerProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    picture = serializers.ImageField(required=False, allow_null=True)
    website = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    linkedin = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    # Read-only convenience fields taken from the user account
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)

    class Meta:
        model = JobSeekerProfile
        fields = "__all__"

    def validate_location(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Please enter your location.")
        return value

    def validate_date_of_birth(self, value):
        if value and value >= timezone.localdate():
            raise serializers.ValidationError("Date of birth must be in the past.")
        return value

# Serializer class for Recruiter
class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    company_website = serializers.URLField(required=False, allow_null=True)
    company_logo = serializers.ImageField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = "__all__"