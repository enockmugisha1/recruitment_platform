from django.urls import path
from rest_framework.routers import DefaultRouter

from .business_dashboard import (
    BusinessDashboardView, BusinessRecruiterListView,
    BusinessRecruiterDetailView, BusinessRecruiterResetPasswordView,
)
from .company_views import (
    BusinessCompanyViewSet, MyCompanyView, MyCompanyTeamView,
    MyCompanyTeamMemberView, MyCompanyTeamResetPasswordView,
)

business_router = DefaultRouter()
business_router.register(r'companies', BusinessCompanyViewSet, basename='business-companies')

# mounted at /business/
business_urlpatterns = [
    path('dashboard/', BusinessDashboardView.as_view(), name='business-dashboard'),
    path('recruiters/', BusinessRecruiterListView.as_view(), name='business-recruiters'),
    path('recruiters/<int:recruiter_id>/', BusinessRecruiterDetailView.as_view(), name='business-recruiter'),
    path('recruiters/<int:recruiter_id>/reset-password/', BusinessRecruiterResetPasswordView.as_view(),
         name='business-recruiter-reset'),
] + business_router.urls

# mounted at /company/
company_urlpatterns = [
    path('me/', MyCompanyView.as_view(), name='my-company'),
    path('team/', MyCompanyTeamView.as_view(), name='my-company-team'),
    path('team/<int:member_id>/', MyCompanyTeamMemberView.as_view(), name='my-company-team-member'),
    path('team/<int:member_id>/reset-password/', MyCompanyTeamResetPasswordView.as_view(), name='my-company-team-reset'),
]
