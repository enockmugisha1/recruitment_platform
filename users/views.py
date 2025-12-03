from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .serializers import (
    RegisterUserSerializer, UpdateUserSerializer, LoginUserSerializer, 
    LogoutUserSerializer, OTPRequestSerializer, OTPVerifySerializer,
    PasswordResetSerializer
)
from .models import OTP
from .utils import hash_otp, generate_otp, verify_otp_hash, check_rate_limit, log_security_event
from .throttling import LoginThrottle, RegistrationThrottle, OTPRequestThrottle, OTPVerifyThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class RegisterUserView(views.APIView):
    throttle_classes = [RegistrationThrottle]
    
    @swagger_auto_schema(
        operation_summary="Register a user",
        operation_description="Register a new user with enhanced validation and security.",
        request_body=RegisterUserSerializer,
        responses={
            201: openapi.Response('User registered successfully'),
            400: 'Validation error',
            429: 'Too many requests'
        }
    )
    @transaction.atomic
    def post(self, request):
        try:
            serializer = RegisterUserSerializer(data=request.data)
            
            if serializer.is_valid():
                user = serializer.save()
                
                # Generate OTP for email verification
                otp_code = generate_otp()
                otp_hash = hash_otp(otp_code)
                
                OTP.objects.create(
                    user=user,
                    otp_hash=otp_hash,
                    purpose='email_verification',
                    expires_at=timezone.now() + timedelta(minutes=15),
                    ip_address=get_client_ip(request)
                )
                
                # TODO: Send OTP via email
                # send_otp_email(user.email, otp_code)
                
                log_security_event("USER_REGISTRATION", user.email, "New user registered")
                
                return Response({
                    "message": "User registered successfully. Please verify your email.",
                    "email": user.email,
                    # In production, don't send OTP in response
                    "otp_code": otp_code if request.data.get('debug') else None
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response(
                {"error": "Registration failed. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginUserView(views.APIView):
    throttle_classes = [LoginThrottle]
    
    @swagger_auto_schema(
        operation_summary="User Login",
        operation_description="Login with enhanced security and account locking.",
        request_body=LoginUserSerializer,
        responses={
            200: openapi.Response('JWT token returned'),
            400: 'Invalid credentials',
            423: 'Account locked',
            429: 'Too many requests'
        }
    )
    def post(self, request):
        try:
            serializer = LoginUserSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {"error": "Invalid email or password format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
            user_email = serializer.validated_data['email']
            user_password = serializer.validated_data['password']
            
            # Rate limiting check
            if not check_rate_limit(f"login:{user_email}", limit=10, period=3600):
                return Response(
                    {"error": "Too many login attempts. Please try again later."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
        
            try:
                user = User.objects.get(email=user_email)
                
                # Check if account is locked
                if user.is_account_locked():
                    log_security_event("LOGIN_ATTEMPT_LOCKED", user_email, "Attempt on locked account", "WARNING")
                    return Response(
                        {"error": "Account is temporarily locked. Please try again later."},
                        status=status.HTTP_423_LOCKED
                    )
                
                # Verify password
                if user.check_password(user_password):
                    # Reset failed attempts
                    user.failed_login_attempts = 0
                    user.last_login_ip = get_client_ip(request)
                    user.save(update_fields=['failed_login_attempts', 'last_login_ip'])
                    
                    user_data = {
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "role": user.role,
                        "is_email_verified": user.is_email_verified,
                    }

                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    log_security_event("LOGIN_SUCCESS", user_email, f"Login from IP: {get_client_ip(request)}")
                    
                    return Response({
                        'user_data': user_data,
                        'access': str(access_token),
                        'refresh': str(refresh)
                    })
                
                # Invalid password - increment failed attempts
                user.failed_login_attempts += 1
                
                # Lock account after 5 failed attempts
                if user.failed_login_attempts >= 5:
                    user.lock_account(duration_minutes=30)
                    log_security_event("ACCOUNT_LOCKED", user_email, "Too many failed login attempts", "WARNING")
                    user.save(update_fields=['failed_login_attempts'])
                    return Response(
                        {"error": "Account locked due to too many failed attempts. Try again in 30 minutes."},
                        status=status.HTTP_423_LOCKED
                    )
                
                user.save(update_fields=['failed_login_attempts'])
                log_security_event("LOGIN_FAILED", user_email, "Invalid password", "WARNING")
                
                return Response(
                    {"error": "Invalid password!"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            except User.DoesNotExist:
                log_security_event("LOGIN_FAILED", user_email, "User not found", "WARNING")
                return Response(
                    {"error": "Invalid email!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {"error": "Login failed. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateUserView(views.APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Update User",
        operation_description="Update current authenticated user information.",
        request_body=UpdateUserSerializer,
        responses={
            200: openapi.Response('User updated successfully'),
            400: 'Validation error'
        }
    )
    @transaction.atomic
    def put(self, request):
        try:
            instance = request.user
            serializer = UpdateUserSerializer(instance, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                log_security_event("USER_UPDATE", instance.email, "User profile updated")
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"User update error: {str(e)}")
            return Response(
                {"error": "Update failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutUserView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Logout User",
        operation_description="Logout user by blacklisting refresh token.",
        request_body=LogoutUserSerializer,
        responses={
            205: openapi.Response('Successfully logged out'),
            400: 'Invalid or already blacklisted token'
        }
    )
    def post(self, request):
        try:
            serializer = LogoutUserSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            log_security_event("LOGOUT", request.user.email, "User logged out")
            
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_205_RESET_CONTENT
            )
        
        except Exception as error:
            logger.error(f"Logout error: {str(error)}")
            return Response(
                {"error": "Invalid token or already blacklisted"},
                status=status.HTTP_400_BAD_REQUEST
            )

class DeleteUserView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Delete User",
        operation_description="Delete current user account permanently.",
        responses={
            204: openapi.Response('User deleted'),
            400: 'Error deleting user'
        }
    )
    @transaction.atomic
    def delete(self, request):
        try:
            instance = request.user
            email = instance.email
            instance.delete()
            
            log_security_event("USER_DELETION", email, "User account deleted", "WARNING")
            
            return Response(
                {"message": "User has been deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            logger.error(f"User deletion error: {str(e)}")
            return Response(
                {"error": "Deletion failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OTPRequestView(views.APIView):
    throttle_classes = [OTPRequestThrottle]
    
    @swagger_auto_schema(
        operation_summary="Request OTP",
        operation_description="Request an OTP for email verification or password reset.",
        request_body=OTPRequestSerializer,
        responses={
            200: openapi.Response('OTP sent successfully'),
            400: 'Validation error',
            429: 'Too many requests'
        }
    )
    @transaction.atomic
    def post(self, request):
        try:
            serializer = OTPRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            email = serializer.validated_data['email']
            purpose = serializer.validated_data['purpose']
            
            # Check for recent OTP requests (spam prevention)
            recent_otp = OTP.objects.filter(
                user__email=email,
                purpose=purpose,
                created_at__gte=timezone.now() - timedelta(minutes=2)
            ).exists()
            
            if recent_otp:
                return Response(
                    {"error": "Please wait 2 minutes before requesting another OTP."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            user = User.objects.get(email=email)
            
            # Generate and hash OTP
            otp_code = generate_otp()
            otp_hash = hash_otp(otp_code)
            
            OTP.objects.create(
                user=user,
                otp_hash=otp_hash,
                purpose=purpose,
                expires_at=timezone.now() + timedelta(minutes=15),
                ip_address=get_client_ip(request)
            )
            
            # TODO: Send OTP via email
            # send_otp_email(email, otp_code, purpose)
            
            log_security_event("OTP_REQUEST", email, f"OTP requested for {purpose}")
            
            return Response({
                "message": "OTP sent successfully. Please check your email.",
                # In production, don't include OTP in response
                "otp_code": otp_code if request.data.get('debug') else None
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"OTP request error: {str(e)}")
            return Response(
                {"error": "Failed to send OTP. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OTPVerifyView(views.APIView):
    throttle_classes = [OTPVerifyThrottle]
    
    @swagger_auto_schema(
        operation_summary="Verify OTP",
        operation_description="Verify OTP code for email verification or password reset.",
        request_body=OTPVerifySerializer,
        responses={
            200: openapi.Response('OTP verified successfully'),
            400: 'Invalid or expired OTP'
        }
    )
    @transaction.atomic
    def post(self, request):
        try:
            serializer = OTPVerifySerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            purpose = serializer.validated_data['purpose']
            
            user = User.objects.get(email=email)
            otp_hash = hash_otp(otp_code)
            
            # Find valid OTP
            otp = OTP.objects.filter(
                user=user,
                otp_hash=otp_hash,
                purpose=purpose,
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if not otp:
                log_security_event("OTP_VERIFICATION_FAILED", email, f"Invalid OTP for {purpose}", "WARNING")
                return Response(
                    {"error": "Invalid or expired OTP code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark OTP as used
            otp.mark_as_used()
            
            # Update user based on purpose
            if purpose == 'email_verification':
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])
            
            log_security_event("OTP_VERIFIED", email, f"OTP verified for {purpose}")
            
            return Response({
                "message": "OTP verified successfully.",
                "email_verified": user.is_email_verified
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"OTP verification error: {str(e)}")
            return Response(
                {"error": "Verification failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetView(views.APIView):
    throttle_classes = [OTPVerifyThrottle]
    
    @swagger_auto_schema(
        operation_summary="Reset Password",
        operation_description="Reset password using verified OTP code.",
        request_body=PasswordResetSerializer,
        responses={
            200: openapi.Response('Password reset successfully'),
            400: 'Invalid OTP or validation error'
        }
    )
    @transaction.atomic
    def post(self, request):
        try:
            serializer = PasswordResetSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            new_password = serializer.validated_data['new_password']
            
            user = User.objects.get(email=email)
            otp_hash = hash_otp(otp_code)
            
            # Verify OTP
            otp = OTP.objects.filter(
                user=user,
                otp_hash=otp_hash,
                purpose='password_reset',
                is_used=False,
                expires_at__gt=timezone.now()
            ).first()
            
            if not otp:
                log_security_event("PASSWORD_RESET_FAILED", email, "Invalid OTP", "WARNING")
                return Response(
                    {"error": "Invalid or expired OTP code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reset password
            user.set_password(new_password)
            user.failed_login_attempts = 0
            user.account_locked_until = None
            user.save()
            
            # Mark OTP as used
            otp.mark_as_used()
            
            log_security_event("PASSWORD_RESET", email, "Password reset successfully", "WARNING")
            
            return Response({
                "message": "Password reset successfully. You can now login with your new password."
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"error": "Password reset failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )