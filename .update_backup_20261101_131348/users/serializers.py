from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .validators import (
    validate_email_format, 
    validate_password_strength, 
    validate_name,
    sanitize_input
)
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["email", "password", "password_confirm", "first_name", "last_name", "role"]

    def validate_email(self, value):
        """Validate and sanitize email"""
        value = value.lower().strip()
        validate_email_format(value)
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        
        return value

    def validate_password(self, value):
        """Validate password strength"""
        validate_password_strength(value)
        return value
    
    def validate_first_name(self, value):
        """Validate and sanitize first name"""
        return validate_name(sanitize_input(value, max_length=50))
    
    def validate_last_name(self, value):
        """Validate and sanitize last name"""
        return validate_name(sanitize_input(value, max_length=50))
    
    def validate(self, attrs):
        """Cross-field validation"""
        password = attrs.get('password')
        password_confirm = attrs.pop('password_confirm', None)
        
        if password_confirm and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """Create user with transaction safety"""
        try:
            user = User.objects.create_user(**validated_data)
            logger.info(f"New user registered: {user.email}")
            return user
        except Exception as e:
            logger.error(f"User registration failed: {str(e)}")
            raise serializers.ValidationError({"error": "Registration failed. Please try again."})

class UpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password", "password_confirm"]
        read_only_fields = ["email"]

    def validate_password(self, value):
        """Validate password strength"""
        if value:
            validate_password_strength(value)
        return value
    
    def validate_first_name(self, value):
        """Validate and sanitize first name"""
        if value:
            return validate_name(sanitize_input(value, max_length=50))
        return value
    
    def validate_last_name(self, value):
        """Validate and sanitize last name"""
        if value:
            return validate_name(sanitize_input(value, max_length=50))
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        password = attrs.get('password')
        password_confirm = attrs.pop('password_confirm', None)
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        """Update user with transaction safety"""
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
            logger.info(f"Password updated for user: {instance.email}")

        instance.save()
        return instance

class LoginUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        """Normalize email"""
        return value.lower().strip()

class LogoutUserSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=[
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('2fa_login', '2FA Login'),
    ])
    
    def validate_email(self, value):
        """Validate email exists"""
        value = value.lower().strip()
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email.")
        return value

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)
    purpose = serializers.ChoiceField(choices=[
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('2fa_login', '2FA Login'),
    ])
    
    def validate_otp_code(self, value):
        """Validate OTP format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True, min_length=8, max_length=128)
    
    def validate_new_password(self, value):
        """Validate password strength"""
        validate_password_strength(value)
        return value
    
    def validate(self, attrs):
        """Verify passwords match"""
        if attrs['new_password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
    