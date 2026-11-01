from django.contrib import admin
from .models import JobSeekerProfile, RecruiterProfile

@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'nationality', 'education', 'institution_or_company', 'years_of_experience', 'phone', 'gender', 'created_at')
    list_filter = ('gender', 'location', 'nationality', 'education', 'created_at')
    search_fields = ('user__username', 'user__email', 'location', 'nationality', 'institution_or_company', 'phone')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'company_website', 'created_at')
    search_fields = ('user__username', 'user__email', 'company_name')
    readonly_fields = ('created_at', 'updated_at')
