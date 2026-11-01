from django.contrib import admin
from .models import JobSeekerProfile, RecruiterProfile, Company

@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'nationality', 'education', 'institution_or_company', 'years_of_experience', 'phone', 'gender', 'created_at')
    list_filter = ('gender', 'location', 'nationality', 'education', 'created_at')
    search_fields = ('user__username', 'user__email', 'location', 'nationality', 'institution_or_company', 'phone')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'is_company_admin', 'created_at')
    list_filter = ('company', 'is_company_admin')
    search_fields = ('user__username', 'user__email', 'company_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'contact_email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_email', 'location')
    readonly_fields = ('created_at', 'updated_at')
