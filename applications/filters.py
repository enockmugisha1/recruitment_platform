from django_filters import rest_framework as filters
from .models import Job, JobSeekerApplication

class JobFilter(filters.FilterSet):
    """Advanced filtering for Job model"""
    title = filters.CharFilter(lookup_expr='icontains')
    location = filters.CharFilter(lookup_expr='icontains')
    job_type = filters.ChoiceFilter(choices=Job.JOB_TYPE_CHOICES)
    min_salary = filters.NumberFilter(field_name='salary_range', lookup_expr='gte')
    deadline_after = filters.DateFilter(field_name='deadline', lookup_expr='gte')
    deadline_before = filters.DateFilter(field_name='deadline', lookup_expr='lte')
    
    class Meta:
        model = Job
        fields = ['title', 'location', 'job_type', 'deadline']


class ApplicationFilter(filters.FilterSet):
    """Advanced filtering for JobSeekerApplication model"""
    status = filters.ChoiceFilter(choices=JobSeekerApplication.STATUS_CHOICES)
    job_title = filters.CharFilter(field_name='job__title', lookup_expr='icontains')
    applied_after = filters.DateTimeFilter(field_name='applied_at', lookup_expr='gte')
    applied_before = filters.DateTimeFilter(field_name='applied_at', lookup_expr='lte')
    
    class Meta:
        model = JobSeekerApplication
        fields = ['status', 'job_title', 'applied_at']
