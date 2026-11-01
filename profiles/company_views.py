"""
Company onboarding API.

  /business/companies/...   the business (ThinkGreen Afrika) registers companies
                            and creates / manages the recruiters of any company
  /company/...              a recruiter's own company: everyone can see it and
                            its team, company admins can add / manage recruiters

Both share the same team logic (``TeamMixin``) so the two behave identically.
"""
from django.db.models import Count
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company, RecruiterProfile
from .permissions import IsBusiness, IsCompanyAdmin, IsCompanyRecruiter
from .serializers import (
    CompanySerializer, CompanySelfSerializer, RecruiterMemberSerializer,
    RecruiterCreateSerializer, RecruiterUpdateSerializer,
)
from .services import provision_recruiter, reset_recruiter_password


class TeamMixin:
    """Add / list / update / reset the recruiters of ONE company."""

    def _members(self, company):
        return (
            RecruiterProfile.objects.filter(company=company)
            .select_related('user').order_by('-is_company_admin', 'user__first_name', 'user__last_name')
        )

    def _member(self, company, member_id):
        # looked up inside the company, so another company's recruiter is a 404
        return get_object_or_404(self._members(company), pk=member_id)

    def list_team(self, request, company):
        return Response(RecruiterMemberSerializer(self._members(company), many=True).data)

    def add_member(self, request, company):
        serializer = RecruiterCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile, temporary_password, email_sent = provision_recruiter(company=company, **serializer.validated_data)
        return Response({
            "recruiter": RecruiterMemberSerializer(profile).data,
            # shown once so it can be handed over if the email does not arrive
            "temporary_password": temporary_password,
            "email_sent": email_sent,
        }, status=status.HTTP_201_CREATED)

    def update_member(self, request, company, member_id, acting_profile=None):
        profile = self._member(company, member_id)
        serializer = RecruiterUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if acting_profile is not None and acting_profile.pk == profile.pk:
            if data.get('is_active') is False or data.get('is_company_admin') is False:
                raise PermissionDenied("You cannot deactivate or demote your own account.")

        if 'is_company_admin' in data:
            profile.is_company_admin = data['is_company_admin']
            profile.save(update_fields=['is_company_admin'])
        if 'is_active' in data:
            profile.user.is_active = data['is_active']
            profile.user.save(update_fields=['is_active'])
        return Response(RecruiterMemberSerializer(profile).data)

    def reset_member_password(self, request, company, member_id, acting_profile=None):
        profile = self._member(company, member_id)
        if acting_profile is not None and acting_profile.pk == profile.pk:
            raise PermissionDenied("Use 'change password' for your own account.")
        temporary_password, email_sent = reset_recruiter_password(profile)
        return Response({
            "recruiter": RecruiterMemberSerializer(profile).data,
            "temporary_password": temporary_password,
            "email_sent": email_sent,
        })


# --------------------------------------------------------------------------
# Business: manage every company
# --------------------------------------------------------------------------
class BusinessCompanyViewSet(TeamMixin, viewsets.ModelViewSet):
    permission_classes = [IsBusiness]
    serializer_class = CompanySerializer
    # No DELETE: removing a company would delete its jobs and every application.
    # Deactivate it instead (PATCH is_active=false).
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'contact_email']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Company.objects.none()
        return Company.objects.annotate(
            recruiter_count=Count('recruiters', distinct=True),
            job_count=Count('jobs', distinct=True),
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @swagger_auto_schema(method='post', request_body=RecruiterCreateSerializer,
                         operation_summary="Add a recruiter to this company")
    @action(detail=True, methods=['get', 'post'], url_path='recruiters')
    def recruiters(self, request, pk=None):
        company = self.get_object()
        if request.method == 'POST':
            return self.add_member(request, company)
        return self.list_team(request, company)

    @swagger_auto_schema(method='patch', request_body=RecruiterUpdateSerializer)
    @action(detail=True, methods=['patch'], url_path=r'recruiters/(?P<member_id>[0-9]+)')
    def recruiter_detail(self, request, pk=None, member_id=None):
        return self.update_member(request, self.get_object(), member_id)

    @swagger_auto_schema(method='post', request_body=None,
                         operation_summary="Reset a recruiter's password to a new temporary one")
    @action(detail=True, methods=['post'], url_path=r'recruiters/(?P<member_id>[0-9]+)/reset-password')
    def recruiter_reset_password(self, request, pk=None, member_id=None):
        return self.reset_member_password(request, self.get_object(), member_id)


# --------------------------------------------------------------------------
# A recruiter's own company
# --------------------------------------------------------------------------
def _my_profile(request):
    return request.user.recruiter_profile


class MyCompanyView(APIView):
    """GET: company details (any recruiter of it). PATCH: edit them (company admin)."""

    def get_permissions(self):
        return [IsCompanyAdmin()] if self.request.method == 'PATCH' else [IsCompanyRecruiter()]

    @swagger_auto_schema(responses={200: CompanySelfSerializer})
    def get(self, request):
        company = Company.objects.annotate(
            recruiter_count=Count('recruiters', distinct=True), job_count=Count('jobs', distinct=True),
        ).get(pk=_my_profile(request).company_id)
        data = CompanySelfSerializer(company).data
        data['is_company_admin'] = _my_profile(request).is_company_admin
        return Response(data)

    @swagger_auto_schema(request_body=CompanySelfSerializer, responses={200: CompanySelfSerializer})
    def patch(self, request):
        company = _my_profile(request).company
        serializer = CompanySelfSerializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyCompanyTeamView(TeamMixin, APIView):
    """GET: everyone at your company. POST: add a recruiter (company admin)."""

    def get_permissions(self):
        return [IsCompanyAdmin()] if self.request.method == 'POST' else [IsCompanyRecruiter()]

    def get(self, request):
        return self.list_team(request, _my_profile(request).company)

    @swagger_auto_schema(request_body=RecruiterCreateSerializer)
    def post(self, request):
        return self.add_member(request, _my_profile(request).company)


class MyCompanyTeamMemberView(TeamMixin, APIView):
    permission_classes = [IsCompanyAdmin]

    @swagger_auto_schema(request_body=RecruiterUpdateSerializer)
    def patch(self, request, member_id):
        me = _my_profile(request)
        return self.update_member(request, me.company, member_id, acting_profile=me)


class MyCompanyTeamResetPasswordView(TeamMixin, APIView):
    permission_classes = [IsCompanyAdmin]

    @swagger_auto_schema(request_body=None)
    def post(self, request, member_id):
        me = _my_profile(request)
        return self.reset_member_password(request, me.company, member_id, acting_profile=me)
