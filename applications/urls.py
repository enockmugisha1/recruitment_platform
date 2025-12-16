from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, JobSeekerApplicationViewSet, CalendarEventViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename="posted-jobs")
router.register(r'applications', JobSeekerApplicationViewSet, basename="applicant-details")
router.register(r'calendar', CalendarEventViewSet, basename="calendar-events")

urlpatterns = [
    path("", include(router.urls)),   
]
