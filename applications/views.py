from rest_framework import status, viewsets
from .serializers import JobSeekerApplicationSerializer, JobSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import JobSeekerApplication, Job
from .permissions import IsJobPoster, IsJobApplicant
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Job view
class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobPoster]
    serializer_class =  JobSerializer
    queryset = Job.objects.all()

    def perform_create(self, serializer):
        try:
            recruiter_profile = self.request.user.recruiter_profile
            serializer.save(recruiter=recruiter_profile)
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create recruiter profile.')
    
    @swagger_auto_schema(
        operation_description="List all jobs created by the recruiter.",
        operation_summary="List Jobs"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new job.",
        operation_summary="Create Job"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a job by ID.",
        operation_summary="Retrieve Job"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a job posting.",
        operation_summary="Update Job"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a job posting.",
        operation_summary="Partial Update Job"
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a job posting.",
        operation_summary="Delete Job"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

# Job seeker application view
class JobSeekerApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobApplicant]
    serializer_class = JobSeekerApplicationSerializer
    queryset = JobSeekerApplication.objects.all()

    def get_queryset(self):
        # Handle swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return JobSeekerApplication.objects.none()
        
        try:
            job_seeker_profile = self.request.user.job_seeker_profile
            applicant = JobSeekerApplication.objects.filter(applicant=job_seeker_profile)
            return applicant
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create a job seeker profile.')

    def perform_create(self, serializer):
        try:
            job_seeker_profile = self.request.user.job_seeker_profile
            serializer.save(applicant=job_seeker_profile)
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create a job seeker profile.')

    @swagger_auto_schema(
        operation_description="List all job applications of the job seeker.",
        operation_summary="List Job Applications"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Submit a new job application.",
        operation_summary="Create Job Application"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a job application by ID.",
        operation_summary="Retrieve Job Application"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a job application.",
        operation_summary="Update Job Application"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a job application.",
        operation_summary="Partial Update Job Application"
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a job application.",
        operation_summary="Delete Job Application"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
