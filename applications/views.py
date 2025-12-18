from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .serializers import JobSeekerApplicationSerializer, JobSerializer, CalendarEventSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import JobSeekerApplication, Job, CalendarEvent
from .permissions import IsJobPoster, IsJobApplicant
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Job view
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related('recruiter__user').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'requirements']
    ordering_fields = ['created_at', 'deadline', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Allow anyone to view jobs (list, retrieve)
        Require authentication and IsJobPoster for create, update, delete
        """
        if self.action in ['list', 'retrieve', 'search_jobs', 'statistics']:
            # Public access for viewing jobs
            return []
        else:
            # Require authentication and job poster permission for modifications
            return [IsAuthenticated(), IsJobPoster()]
    
    def get_queryset(self):
        """
        Filter jobs by job_type, location, and active deadline
        """
        queryset = super().get_queryset()
        
        # Filter by job type
        job_type = self.request.query_params.get('job_type', None)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by active jobs (deadline not passed)
        active_only = self.request.query_params.get('active_only', None)
        if active_only == 'true':
            from django.utils import timezone
            queryset = queryset.filter(deadline__gte=timezone.now().date())
        
        return queryset

    def perform_create(self, serializer):
        try:
            recruiter_profile = self.request.user.recruiter_profile
            serializer.save(recruiter=recruiter_profile)
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create recruiter profile.')
    
    @swagger_auto_schema(
        operation_description="List all jobs. Supports filtering by job_type, location, and active_only. Search by title, description, location, requirements.",
        operation_summary="List Jobs",
        manual_parameters=[
            openapi.Parameter('job_type', openapi.IN_QUERY, description="Filter by job type (full_time, part_time, contract, internship)", type=openapi.TYPE_STRING),
            openapi.Parameter('location', openapi.IN_QUERY, description="Filter by location", type=openapi.TYPE_STRING),
            openapi.Parameter('active_only', openapi.IN_QUERY, description="Show only active jobs (true/false)", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="Search in title, description, location, requirements", type=openapi.TYPE_STRING),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="Order by field (created_at, deadline, title). Use - for descending", type=openapi.TYPE_STRING),
        ]
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
    
    @action(detail=False, methods=['get'])
    @swagger_auto_schema(
        operation_summary="Job Statistics",
        operation_description="Get statistics about jobs and applications."
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get job statistics"""
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(deadline__gte=timezone.now().date()).count()
        total_applications = JobSeekerApplication.objects.count()
        
        return Response({
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'by_job_type': list(Job.objects.values('job_type').annotate(count=Count('id')))
        })

    @swagger_auto_schema(
        operation_summary="Dashboard Statistics",
        operation_description="Get comprehensive dashboard statistics for recruiters."
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_stats(self, request):
        """Get dashboard statistics for recruiter"""
        # Check if user is recruiter
        try:
            recruiter_profile = request.user.recruiter_profile
        except:
            return Response({'error': 'Only recruiters can access dashboard stats'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get recruiter's jobs
        recruiter_jobs = Job.objects.filter(recruiter=recruiter_profile)
        
        # Get all applications for recruiter's jobs
        all_applications = JobSeekerApplication.objects.filter(job__recruiter=recruiter_profile)
        
        # Get calendar events
        upcoming_interviews = CalendarEvent.objects.filter(
            recruiter=recruiter_profile,
            event_type='interview',
            date__gte=timezone.now()
        ).order_by('date')[:10]
        
        # Calculate statistics
        stats = {
            'interviews_scheduled': upcoming_interviews.count(),
            'feedback_pending': all_applications.filter(status='under_review').count(),
            'approval_pending': all_applications.filter(status='submitted').count(),
            'offer_acceptance_pending': all_applications.filter(status='shortlisted').count(),
            'documentation_pending': all_applications.filter(status='accepted').count(),
            'total_candidates': all_applications.count(),
            'supervisor_allocation_pending': 0,  # Can be extended
            'project_allocation_pending': 0,  # Can be extended
            'total_jobs': recruiter_jobs.count(),
            'active_jobs': recruiter_jobs.filter(deadline__gte=timezone.now().date()).count(),
        }
        
        return Response(stats)

# Job seeker application view
class JobSeekerApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsJobApplicant]
    serializer_class = JobSeekerApplicationSerializer
    queryset = JobSeekerApplication.objects.select_related('applicant__user', 'job__recruiter').all()
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['applied_at', 'status']
    ordering = ['-applied_at']

    def get_queryset(self):
        # Handle swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return JobSeekerApplication.objects.none()
        
        try:
            job_seeker_profile = self.request.user.job_seeker_profile
            queryset = JobSeekerApplication.objects.filter(applicant=job_seeker_profile)
            
            # Filter by status
            status_filter = self.request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create a job seeker profile.')

    def perform_create(self, serializer):
        try:
            job_seeker_profile = self.request.user.job_seeker_profile
            serializer.save(applicant=job_seeker_profile)
        except Exception as error:
            raise PermissionDenied(f'{error} You have to create a job seeker profile.')

    @swagger_auto_schema(
        operation_description="List all job applications of the job seeker. Can filter by status.",
        operation_summary="List Job Applications",
        manual_parameters=[
            openapi.Parameter('status', openapi.IN_QUERY, description="Filter by status (submitted, under_review, shortlisted, rejected, accepted)", type=openapi.TYPE_STRING),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="Order by field (applied_at, status). Use - for descending", type=openapi.TYPE_STRING),
        ]
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


# Calendar Event ViewSet
class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    permission_classes = [IsAuthenticated, IsJobPoster]
    
    def get_queryset(self):
        """
        Return calendar events for the authenticated recruiter only
        Can filter by month and year
        """
        queryset = CalendarEvent.objects.select_related('recruiter__user', 'candidate__user').filter(recruiter=self.request.user.recruiter_profile)
        
        # Optional filters
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        event_type = self.request.query_params.get('type', None)
        
        if month and year:
            queryset = queryset.filter(date__month=month, date__year=year)
        elif year:
            queryset = queryset.filter(date__year=year)
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset.order_by('date')
    
    def perform_create(self, serializer):
        """
        Automatically set the recruiter when creating an event
        """
        try:
            recruiter_profile = self.request.user.recruiter_profile
            serializer.save(recruiter=recruiter_profile)
        except AttributeError:
            raise PermissionDenied("Only recruiters can create calendar events.")
    
    @swagger_auto_schema(
        operation_summary="List Calendar Events",
        operation_description="Get all calendar events for the authenticated recruiter. Can filter by month, year, and event type.",
        manual_parameters=[
            openapi.Parameter('month', openapi.IN_QUERY, description="Filter by month (1-12)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('year', openapi.IN_QUERY, description="Filter by year (e.g., 2025)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('type', openapi.IN_QUERY, description="Filter by event type (interview, meeting, deadline, other)", type=openapi.TYPE_STRING),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Create Calendar Event",
        operation_description="Schedule a new interview, meeting, deadline, or other event."
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Retrieve Calendar Event",
        operation_description="Get details of a specific calendar event."
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Update Calendar Event",
        operation_description="Update an existing calendar event."
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Partial Update Calendar Event",
        operation_description="Partially update a calendar event."
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Delete Calendar Event",
        operation_description="Delete a calendar event."
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Upcoming Events",
        operation_description="Get upcoming calendar events grouped by today, tomorrow, and this week."
    )
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events grouped by time period"""
        try:
            recruiter_profile = request.user.recruiter_profile
        except:
            return Response({'error': 'Only recruiters can access calendar'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        tomorrow_end = today_end + timedelta(days=1)
        week_end = today_start + timedelta(days=7)
        
        # Get events
        today_events = CalendarEvent.objects.filter(
            recruiter=recruiter_profile,
            date__gte=today_start,
            date__lt=today_end
        ).select_related('candidate__user').order_by('date')
        
        tomorrow_events = CalendarEvent.objects.filter(
            recruiter=recruiter_profile,
            date__gte=today_end,
            date__lt=tomorrow_end
        ).select_related('candidate__user').order_by('date')
        
        week_events = CalendarEvent.objects.filter(
            recruiter=recruiter_profile,
            date__gte=tomorrow_end,
            date__lt=week_end
        ).select_related('candidate__user').order_by('date')
        
        serializer = self.get_serializer([today_events, tomorrow_events, week_events], many=False)
        
        return Response({
            'today': CalendarEventSerializer(today_events, many=True).data,
            'tomorrow': CalendarEventSerializer(tomorrow_events, many=True).data,
            'this_week': CalendarEventSerializer(week_events, many=True).data,
        })
