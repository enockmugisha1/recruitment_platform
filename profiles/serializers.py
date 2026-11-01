from rest_framework import serializers
from .models import JobSeekerProfile, RecruiterProfile, Company
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.validators import validate_email_format, validate_name, sanitize_input
from django.core.exceptions import ValidationError as DjangoValidationError

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
        # Which company a recruiter belongs to (and whether they administer it)
        # is decided by the business / company admin, never by the recruiter.
        read_only_fields = ["company", "is_company_admin", "company_name"]


def _run_django_validator(func, value):
    """Reuse the validators in users.validators (they raise Django errors)."""
    try:
        return func(value)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))


class CompanySerializer(serializers.ModelSerializer):
    """A company as the business sees it."""
    recruiter_count = serializers.IntegerField(read_only=True, default=0)
    job_count = serializers.IntegerField(read_only=True, default=0)
    created_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S', read_only=True)
    website = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Company
        fields = [
            "id", "name", "website", "description", "location", "contact_email", "logo",
            "is_active", "recruiter_count", "job_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        value = " ".join((value or "").split())
        if len(value) < 2:
            raise serializers.ValidationError("Please enter the company name.")
        clash = Company.objects.filter(name__iexact=value)
        if self.instance:
            clash = clash.exclude(pk=self.instance.pk)
        if clash.exists():
            raise serializers.ValidationError("A company with this name is already registered.")
        return value


class CompanySelfSerializer(CompanySerializer):
    """What a company admin may edit about their own company (not name / active flag)."""

    class Meta(CompanySerializer.Meta):
        read_only_fields = CompanySerializer.Meta.read_only_fields + ["name", "is_active"]


class RecruiterMemberSerializer(serializers.ModelSerializer):
    """A recruiter of a company, as listed on the team screens."""
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    # still on the temporary password => has not logged in and set their own yet
    password_change_pending = serializers.BooleanField(source="user.must_change_password", read_only=True)
    last_login = serializers.DateTimeField(source="user.last_login", read_only=True)
    jobs_posted = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = [
            "id", "first_name", "last_name", "email", "is_company_admin", "is_active",
            "password_change_pending", "last_login", "jobs_posted", "created_at",
        ]

    def get_jobs_posted(self, obj):
        return obj.jobs.count()


class RecruiterCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    is_company_admin = serializers.BooleanField(required=False, default=False)

    def validate_first_name(self, value):
        return _run_django_validator(validate_name, sanitize_input(value, max_length=50))

    def validate_last_name(self, value):
        return _run_django_validator(validate_name, sanitize_input(value, max_length=50))

    def validate_email(self, value):
        value = value.lower().strip()
        _run_django_validator(validate_email_format, value)
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class RecruiterUpdateSerializer(serializers.Serializer):
    is_company_admin = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
