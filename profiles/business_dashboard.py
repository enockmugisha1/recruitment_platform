"""
Business (ThinkGreen Afrika) dashboard: platform-wide numbers, and the cross-company
recruiter list used to add / freeze recruiters from one place.
No applicant details are exposed here, only counts.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import ApplicationAIAnalysis, Job, JobSeekerApplication
from .company_views import TeamMixin
from .models import Company, RecruiterProfile
from .permissions import IsBusiness
from .serializers import RecruiterMemberSerializer

User = get_user_model()
TREND_DAYS = 30
ATTENTION_LIMIT = 8


def _daily(queryset, field, start_date):
    rows = queryset.annotate(day=TruncDate(field)).values('day').annotate(n=Count('id'))
    counts = {row['day']: row['n'] for row in rows}
    today = timezone.localdate()
    days = [start_date + timedelta(days=i) for i in range((today - start_date).days + 1)]
    return days, [counts.get(day, 0) for day in days]


class BusinessDashboardView(APIView):
    permission_classes = [IsBusiness]

    def get(self, request):
        now = timezone.now()
        today = timezone.localdate()
        since7, since30 = now - timedelta(days=7), now - timedelta(days=30)

        # ---- companies / recruiters / job seekers ----
        companies_total = Company.objects.count()
        companies_active = Company.objects.filter(is_active=True).count()
        recruiters = RecruiterProfile.objects.all()
        recruiters_active = recruiters.filter(user__is_active=True).count()
        awaiting = recruiters.filter(user__is_active=True, user__must_change_password=True).count()
        seekers = User.objects.filter(role='job_seeker')

        # ---- jobs ----
        jobs_total = Job.objects.count()
        jobs_open = Job.objects.filter(deadline__gte=today).count()

        # ---- applications ----
        applications = JobSeekerApplication.objects.all()
        by_status = {key: 0 for key, _ in JobSeekerApplication.STATUS_CHOICES}
        for row in applications.values('status').annotate(n=Count('id')):
            by_status[row['status']] = row['n']

        # ---- AI analysis (counts only; per-applicant results are for recruiters) ----
        ai_counts = {key: 0 for key, _ in ApplicationAIAnalysis.STATUS_CHOICES}
        for row in ApplicationAIAnalysis.objects.values('status').annotate(n=Count('id')):
            ai_counts[row['status']] = row['n']
        average = ApplicationAIAnalysis.objects.filter(status='completed', match_score__isnull=False) \
            .aggregate(avg=Avg('match_score'))['avg']

        # ---- last 30 days ----
        start = today - timedelta(days=TREND_DAYS - 1)
        days, app_series = _daily(applications.filter(applied_at__date__gte=start), 'applied_at', start)
        _, job_series = _daily(Job.objects.filter(created_at__date__gte=start), 'created_at', start)
        trend = [{'date': d.isoformat(), 'applications': a, 'jobs': j}
                 for d, a, j in zip(days, app_series, job_series)]

        # ---- leaderboard ----
        top_companies = [
            {'id': c.id, 'name': c.name, 'jobs': c.jobs_n, 'applications': c.apps_n, 'is_active': c.is_active}
            for c in Company.objects.annotate(
                jobs_n=Count('jobs', distinct=True), apps_n=Count('jobs__applications', distinct=True)
            ).order_by('-apps_n', '-jobs_n', 'name')[:5]
        ]

        # ---- things the business may want to act on ----
        no_recruiters = Company.objects.filter(recruiters__isnull=True).order_by('-created_at')
        waiting = recruiters.filter(user__is_active=True, user__must_change_password=True,
                                    company__is_active=True).select_related('user', 'company').order_by('created_at')
        frozen_recruiters = recruiters.filter(user__is_active=False).select_related('user', 'company')

        return Response({
            'generated_at': now,
            'companies': {'total': companies_total, 'active': companies_active,
                          'frozen': companies_total - companies_active},
            'recruiters': {'total': recruiters.count(), 'active': recruiters_active,
                           'frozen': recruiters.count() - recruiters_active, 'awaiting_first_login': awaiting},
            'job_seekers': {'total': seekers.count(), 'new_last_30_days': seekers.filter(date_joined__gte=since30).count()},
            'jobs': {'total': jobs_total, 'open': jobs_open, 'expired': jobs_total - jobs_open,
                     'posted_last_30_days': Job.objects.filter(created_at__gte=since30).count()},
            'applications': {'total': applications.count(), 'last_7_days': applications.filter(applied_at__gte=since7).count(),
                             'last_30_days': applications.filter(applied_at__gte=since30).count(), 'by_status': by_status},
            'ai': {**ai_counts, 'average_score': round(average) if average is not None else None},
            'trend': trend,
            'top_companies': top_companies,
            'attention': {
                'companies_without_recruiters': {
                    'count': no_recruiters.count(),
                    'items': [{'id': c.id, 'name': c.name, 'is_active': c.is_active}
                              for c in no_recruiters[:ATTENTION_LIMIT]],
                },
                'awaiting_first_login': {
                    'count': waiting.count(),
                    'items': [{'id': r.id, 'name': f"{r.user.first_name} {r.user.last_name}".strip(),
                               'email': r.user.email, 'company_id': r.company_id, 'company_name': r.company.name,
                               'created_at': r.created_at} for r in waiting[:ATTENTION_LIMIT]],
                },
                'frozen_recruiters': {
                    'count': frozen_recruiters.count(),
                    'items': [{'id': r.id, 'name': f"{r.user.first_name} {r.user.last_name}".strip(),
                               'email': r.user.email, 'company_id': r.company_id, 'company_name': r.company.name}
                              for r in frozen_recruiters[:ATTENTION_LIMIT]],
                },
            },
        })


class BusinessRecruiterListView(APIView):
    """Every recruiter on the platform, searchable, with their company."""
    permission_classes = [IsBusiness]

    def get(self, request):
        queryset = RecruiterProfile.objects.filter(company__isnull=False).select_related('user', 'company')

        search = (request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search) | Q(company__name__icontains=search))
        company = request.query_params.get('company')
        if company and company.isdigit():
            queryset = queryset.filter(company_id=int(company))
        state = request.query_params.get('status')
        if state == 'active':
            queryset = queryset.filter(user__is_active=True, user__must_change_password=False)
        elif state == 'frozen':
            queryset = queryset.filter(user__is_active=False)
        elif state == 'pending':
            queryset = queryset.filter(user__is_active=True, user__must_change_password=True)

        queryset = queryset.order_by('company__name', 'user__first_name', 'user__last_name')[:500]
        return Response(RecruiterMemberSerializer(queryset, many=True).data)


class _BusinessRecruiterAction(TeamMixin, APIView):
    permission_classes = [IsBusiness]

    def _company_of(self, recruiter_id):
        profile = get_object_or_404(RecruiterProfile.objects.select_related('company'), pk=recruiter_id,
                                    company__isnull=False)
        return profile.company


class BusinessRecruiterDetailView(_BusinessRecruiterAction):
    def patch(self, request, recruiter_id):
        return self.update_member(request, self._company_of(recruiter_id), recruiter_id)


class BusinessRecruiterResetPasswordView(_BusinessRecruiterAction):
    def post(self, request, recruiter_id):
        return self.reset_member_password(request, self._company_of(recruiter_id), recruiter_id)
