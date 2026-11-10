from django.urls import path
from rest_framework.routers import DefaultRouter

from .company_views import (
    BusinessCompanyViewSet, MyCompanyView, MyCompanyTeamView,
    MyCompanyTeamMemberView, MyCompanyTeamResetPasswordView,
)

business_router = DefaultRouter()
business_router.register(r'companies', BusinessCompanyViewSet, basename='business-companies')

# mounted at /business/
business_urlpatterns = business_router.urls

# mounted at /company/
company_urlpatterns = [
    path('me/', MyCompanyView.as_view(), name='my-company'),
    path('team/', MyCompanyTeamView.as_view(), name='my-company-team'),
    path('team/<int:member_id>/', MyCompanyTeamMemberView.as_view(), name='my-company-team-member'),
    path('team/<int:member_id>/reset-password/', MyCompanyTeamResetPasswordView.as_view(), name='my-company-team-reset'),
]
