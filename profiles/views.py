from django.shortcuts import render, get_object_or_404
from rest_framework import status,viewsets
from .serializers import JobSeekerProfileSerializer, RecruiterProfileSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .permissions import IsRecruiter, IsStaff
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import JobSeekerProfile, RecruiterProfile
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Job seeker view
class JobSeekerProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSeekerProfileSerializer
    queryset = JobSeekerProfile.objects.all()

    def get_queryset(self):
        # Handle swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return JobSeekerProfile.objects.none()
        
        job_seeker = self.request.user
        user = JobSeekerProfile.objects.filter(user=job_seeker)
        return user

    def perform_create(self, serializer):
        user = self.request.user
        # Check if the user has already a profile
        if JobSeekerProfile.objects.filter(user=user).exists():
            raise PermissionDenied("You already have a profile. You cannot create multiple profiles.")

        serializer.save(user=user)

    def perform_update(self, serializer):
        # Checking if the user is the owner of the custom profile before updating
        if self.get_object().user != self.request.user:
            raise PermissionDenied("You can only update your own profile.")

        serializer.save()
        
    def perform_destroy(self, instance):
        # Checking if the user is the owner of the custom profile before deleting
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own profile")

        instance.delete()

    @swagger_auto_schema(
        operation_description="Get the job seeker profile of the logged-in user.",
        operation_summary="List Job Seeker Profiles"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new job seeker profile.",
        operation_summary="Create Job Seeker Profile"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve job seeker profile by ID.",
        operation_summary="Retrieve Job Seeker Profile"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a job seeker profile.",
        operation_summary="Update Job Seeker Profile"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a job seeker profile.",
        operation_summary="Partial Update Job Seeker Profile"
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a job seeker profile.",
        operation_summary="Delete Job Seeker Profile"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

# Recruiter view
class RecruiterProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser | IsRecruiter | IsStaff]
    serializer_class = RecruiterProfileSerializer
    queryset = RecruiterProfile.objects.all()

    def get_queryset(self):
        # Handle swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return RecruiterProfile.objects.none()
        
        recruiter = self.request.user
        user = RecruiterProfile.objects.filter(user=recruiter)
        return user

    def perform_create(self, serializer):
        user = self.request.user
        # Check if the user has already a profile
        if RecruiterProfile.objects.filter(user=user).exists():
            raise PermissionDenied("You already have a profile. You cannot create multiple profiles.")

        serializer.save(user=user)
    
    @swagger_auto_schema(
        operation_description="Get the recruiter profile of the logged-in user.",
        operation_summary="List Recruiter Profiles"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new recruiter profile.",
        operation_summary="Create Recruiter Profile"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve recruiter profile by ID.",
        operation_summary="Retrieve Recruiter Profile"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a recruiter profile.",
        operation_summary="Update Recruiter Profile"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a recruiter profile.",
        operation_summary="Partial Update Recruiter Profile"
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a recruiter profile.",
        operation_summary="Delete Recruiter Profile"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)