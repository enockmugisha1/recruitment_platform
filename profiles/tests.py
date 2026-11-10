from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from profiles.models import Company, RecruiterProfile

User = get_user_model()
PASSWORD = 'Str0ngPass!'


def make_user(email, role, **extra):
    return User.objects.create_user(email=email, password=PASSWORD, role=role,
                                    first_name=extra.pop('first_name', 'Test'),
                                    last_name=extra.pop('last_name', 'User'), **extra)


class SignupTests(TestCase):
    """Public sign-up is for job seekers only."""

    def setUp(self):
        self.client = APIClient()

    def _signup(self, **extra):
        data = {'email': 'new@x.com', 'password': PASSWORD, 'password_confirm': PASSWORD,
                'first_name': 'Nina', 'last_name': 'Newcomer'}
        data.update(extra)
        return self.client.post('/auth/register/', data, format='json')

    def test_signup_creates_a_job_seeker(self):
        self.assertEqual(self._signup().status_code, 201)
        self.assertEqual(User.objects.get(email='new@x.com').role, 'job_seeker')
        self.assertEqual(self._signup(email='b@x.com', role='job_seeker').status_code, 201)

    def test_signup_refuses_recruiter_and_business_roles(self):
        for role in ('recruiter', 'business'):
            res = self._signup(email=f'{role}@x.com', role=role)
            self.assertEqual(res.status_code, 400, role)
            self.assertIn('role', res.data)
            self.assertFalse(User.objects.filter(email=f'{role}@x.com').exists())


class BusinessOnboardingTests(TestCase):
    """business -> company -> recruiters (temporary password) -> forced change"""

    def setUp(self):
        self.business = make_user('biz@tga.org', 'business')
        self.client = APIClient()
        self.client.force_authenticate(self.business)

    def _company(self, name='Green Energy Ltd'):
        res = self.client.post('/business/companies/', {'name': name, 'location': 'Kigali',
                                                        'contact_email': 'hr@green.com'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        return res.data['id']

    def _recruiter(self, company_id, email='rita@green.com', **extra):
        data = {'first_name': 'Rita', 'last_name': 'Recruiter', 'email': email}
        data.update(extra)
        return self.client.post(f'/business/companies/{company_id}/recruiters/', data, format='json')

    # ---- who may use the business API ----
    def test_only_business_users_can_use_business_api(self):
        for user in (make_user('s@x.com', 'job_seeker'), make_user('r@x.com', 'recruiter')):
            c = APIClient()
            c.force_authenticate(user)
            self.assertEqual(c.get('/business/companies/').status_code, 403, user.role)
            self.assertEqual(c.post('/business/companies/', {'name': 'X Co'}, format='json').status_code, 403)
        self.assertEqual(APIClient().get('/business/companies/').status_code, 401)

    # ---- companies ----
    def test_business_registers_and_edits_company(self):
        cid = self._company()
        res = self.client.get('/business/companies/')
        self.assertEqual([c['name'] for c in res.data['results']], ['Green Energy Ltd'])
        self.assertEqual(Company.objects.get(id=cid).created_by, self.business)

        res = self.client.patch(f'/business/companies/{cid}/', {'description': 'Solar'}, format='json')
        self.assertEqual(res.status_code, 200)
        # companies are deactivated, never deleted (that would wipe their jobs)
        self.assertEqual(self.client.delete(f'/business/companies/{cid}/').status_code, 405)

    def test_company_names_are_unique_ignoring_case(self):
        self._company('Green Energy Ltd')
        res = self.client.post('/business/companies/', {'name': 'green energy ltd'}, format='json')
        self.assertEqual(res.status_code, 400)

    # ---- recruiters ----
    def test_recruiter_gets_temporary_password_by_email_and_must_change_it(self):
        cid = self._company()
        res = self._recruiter(cid)
        self.assertEqual(res.status_code, 201, res.data)
        temp = res.data['temporary_password']
        self.assertTrue(res.data['email_sent'])

        # the email carries the login link, the address and the temporary password
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['rita@green.com'])
        self.assertIn(temp, mail.outbox[0].body)
        self.assertIn('/login', mail.outbox[0].body)

        user = User.objects.get(email='rita@green.com')
        self.assertEqual(user.role, 'recruiter')
        self.assertTrue(user.must_change_password)
        profile = user.recruiter_profile
        self.assertEqual(profile.company_id, cid)
        self.assertEqual(profile.company_name, 'Green Energy Ltd')

        # log in with the temporary password: told to change it, company included
        anon = APIClient()
        login = anon.post('/auth/login/', {'email': 'rita@green.com', 'password': temp}, format='json')
        self.assertEqual(login.status_code, 200, login.data)
        self.assertTrue(login.data['user_data']['must_change_password'])
        self.assertEqual(login.data['user_data']['company']['name'], 'Green Energy Ltd')

        # ... and until she does, the API refuses everything else
        anon.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        blocked = anon.get('/access/jobs/')
        self.assertEqual(blocked.status_code, 403)
        self.assertEqual(blocked.data['code'], 'password_change_required')
        self.assertEqual(anon.get('/auth/me/').status_code, 200)   # allowed

        # wrong current password / weak / same password are rejected
        url = '/auth/password/change/'
        bad = anon.post(url, {'current_password': 'nope', 'new_password': 'Brand-new1', 'password_confirm': 'Brand-new1'}, format='json')
        self.assertEqual(bad.status_code, 400)
        weak = anon.post(url, {'current_password': temp, 'new_password': 'short', 'password_confirm': 'short'}, format='json')
        self.assertEqual(weak.status_code, 400)
        same = anon.post(url, {'current_password': temp, 'new_password': temp, 'password_confirm': temp}, format='json')
        self.assertEqual(same.status_code, 400)

        ok = anon.post(url, {'current_password': temp, 'new_password': 'Brand-new1', 'password_confirm': 'Brand-new1'}, format='json')
        self.assertEqual(ok.status_code, 200, ok.data)
        self.assertFalse(ok.data['user_data']['must_change_password'])

        # now she can work, and the old temporary password no longer logs in
        self.assertEqual(anon.get('/access/jobs/').status_code, 200)
        again = APIClient().post('/auth/login/', {'email': 'rita@green.com', 'password': temp}, format='json')
        self.assertEqual(again.status_code, 400)

    def test_duplicate_email_rejected(self):
        cid = self._company()
        self.assertEqual(self._recruiter(cid).status_code, 201)
        self.assertEqual(self._recruiter(cid).status_code, 400)
        make_user('taken@x.com', 'job_seeker')
        self.assertEqual(self._recruiter(cid, email='taken@x.com').status_code, 400)

    def test_email_failure_still_returns_the_password(self):
        from unittest import mock
        cid = self._company()
        with mock.patch('django.core.mail.message.EmailMultiAlternatives.send', side_effect=OSError('smtp down')):
            res = self._recruiter(cid)
        self.assertEqual(res.status_code, 201)
        self.assertFalse(res.data['email_sent'])
        self.assertTrue(res.data['temporary_password'])

    def test_reset_password_issues_new_temporary_password(self):
        cid = self._company()
        first = self._recruiter(cid)
        rid = first.data['recruiter']['id']
        # she sets her own password first
        c = APIClient()
        login = c.post('/auth/login/', {'email': 'rita@green.com', 'password': first.data['temporary_password']}, format='json')
        c.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        c.post('/auth/password/change/', {'current_password': first.data['temporary_password'],
                                          'new_password': 'Mine-now-1', 'password_confirm': 'Mine-now-1'}, format='json')
        self.assertFalse(User.objects.get(email='rita@green.com').must_change_password)

        res = self.client.post(f'/business/companies/{cid}/recruiters/{rid}/reset-password/')
        self.assertEqual(res.status_code, 200, res.data)
        user = User.objects.get(email='rita@green.com')
        self.assertTrue(user.must_change_password)
        self.assertTrue(user.check_password(res.data['temporary_password']))
        self.assertFalse(user.check_password('Mine-now-1'))

    def test_deactivated_recruiter_and_inactive_company_cannot_log_in(self):
        cid = self._company()
        res = self._recruiter(cid)
        rid, temp = res.data['recruiter']['id'], res.data['temporary_password']
        creds = {'email': 'rita@green.com', 'password': temp}

        self.client.patch(f'/business/companies/{cid}/recruiters/{rid}/', {'is_active': False}, format='json')
        self.assertEqual(APIClient().post('/auth/login/', creds, format='json').status_code, 403)
        self.client.patch(f'/business/companies/{cid}/recruiters/{rid}/', {'is_active': True}, format='json')
        self.assertEqual(APIClient().post('/auth/login/', creds, format='json').status_code, 200)

        self.client.patch(f'/business/companies/{cid}/', {'is_active': False}, format='json')
        self.assertEqual(APIClient().post('/auth/login/', creds, format='json').status_code, 403)

    def test_recruiters_cannot_delete_their_account(self):
        cid = self._company()
        self._recruiter(cid)
        c = APIClient()
        c.force_authenticate(User.objects.get(email='rita@green.com'))
        self.assertEqual(c.delete('/auth/delete/').status_code, 403)
        self.assertTrue(User.objects.filter(email='rita@green.com').exists())


class CompanyTeamTests(TestCase):
    """A company's own admin adds the rest of its recruiters, nobody else's."""

    def setUp(self):
        self.co_a = Company.objects.create(name='Co A')
        self.co_b = Company.objects.create(name='Co B')

        def rec(email, company, admin=False):
            user = make_user(email, 'recruiter', first_name='Pat', last_name=email.split('@')[0].title())
            RecruiterProfile.objects.create(user=user, company=company, company_name=company.name, is_company_admin=admin)
            return user

        self.admin_a = rec('admin@a.com', self.co_a, admin=True)
        self.staff_a = rec('staff@a.com', self.co_a)
        self.admin_b = rec('admin@b.com', self.co_b, admin=True)

        def client(user):
            c = APIClient()
            c.force_authenticate(user)
            return c
        self.as_admin, self.as_staff, self.as_other_admin = client(self.admin_a), client(self.staff_a), client(self.admin_b)

    def test_everyone_sees_own_team_only(self):
        res = self.as_staff.get('/company/team/')
        self.assertEqual(sorted(m['email'] for m in res.data), ['admin@a.com', 'staff@a.com'])
        res = self.as_staff.get('/company/me/')
        self.assertEqual(res.data['name'], 'Co A')
        self.assertFalse(res.data['is_company_admin'])

    def test_only_company_admin_can_add_recruiters_to_own_company(self):
        payload = {'first_name': 'Neo', 'last_name': 'Newhire', 'email': 'neo@a.com'}
        self.assertEqual(self.as_staff.post('/company/team/', payload, format='json').status_code, 403)

        res = self.as_admin.post('/company/team/', payload, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        profile = RecruiterProfile.objects.get(user__email='neo@a.com')
        self.assertEqual(profile.company, self.co_a)
        self.assertFalse(profile.is_company_admin)
        self.assertTrue(profile.user.must_change_password)
        self.assertTrue(res.data['temporary_password'])

    def test_admin_cannot_reach_another_companys_recruiters(self):
        other_id = self.admin_b.recruiter_profile.id
        self.assertEqual(self.as_admin.patch(f'/company/team/{other_id}/', {'is_active': False}, format='json').status_code, 404)
        self.assertEqual(self.as_admin.post(f'/company/team/{other_id}/reset-password/').status_code, 404)
        self.assertEqual(self.as_admin.get('/company/team/').status_code, 200)

    def test_admin_manages_colleagues_but_not_themselves(self):
        staff_id = self.staff_a.recruiter_profile.id
        res = self.as_admin.patch(f'/company/team/{staff_id}/', {'is_company_admin': True}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['is_company_admin'])

        me = self.admin_a.recruiter_profile.id
        self.assertEqual(self.as_admin.patch(f'/company/team/{me}/', {'is_active': False}, format='json').status_code, 403)
        self.assertEqual(self.as_admin.patch(f'/company/team/{me}/', {'is_company_admin': False}, format='json').status_code, 403)
        self.assertEqual(self.as_admin.post(f'/company/team/{me}/reset-password/').status_code, 403)

        res = self.as_admin.post(f'/company/team/{staff_id}/reset-password/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(User.objects.get(email='staff@a.com').must_change_password)

    def test_company_admin_edits_company_details_but_not_its_name(self):
        res = self.as_admin.patch('/company/me/', {'description': 'We hire', 'name': 'Hacked', 'is_active': False}, format='json')
        self.assertEqual(res.status_code, 200)
        self.co_a.refresh_from_db()
        self.assertEqual(self.co_a.description, 'We hire')
        self.assertEqual(self.co_a.name, 'Co A')
        self.assertTrue(self.co_a.is_active)
        self.assertEqual(self.as_staff.patch('/company/me/', {'description': 'x'}, format='json').status_code, 403)

    def test_job_seekers_have_no_company_api(self):
        c = APIClient()
        c.force_authenticate(make_user('s@x.com', 'job_seeker'))
        self.assertEqual(c.get('/company/me/').status_code, 403)
        self.assertEqual(c.get('/company/team/').status_code, 403)


class BusinessDashboardTests(TestCase):
    """Platform-wide numbers + freezing from one place (business accounts only)."""

    def setUp(self):
        from datetime import timedelta
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.utils import timezone
        from applications.models import Job, JobSeekerApplication, ApplicationAIAnalysis
        from profiles.models import JobSeekerProfile

        self.business = make_user('biz@tga.org', 'business')
        self.client = APIClient()
        self.client.force_authenticate(self.business)

        self.co_a = Company.objects.create(name='Alpha')
        self.co_b = Company.objects.create(name='Beta', is_active=False)   # frozen
        self.co_empty = Company.objects.create(name='Gamma')                # no recruiters

        def rec(email, company, **flags):
            user = make_user(email, 'recruiter', first_name=email.split('@')[0].title(), **flags)
            return user, RecruiterProfile.objects.create(user=user, company=company, company_name=company.name)

        self.ra, self.pa = rec('ann@a.com', self.co_a)
        self.rpend, self.ppend = rec('pat@a.com', self.co_a, must_change_password=True)   # never logged in
        self.rfrozen, self.pfrozen = rec('fay@a.com', self.co_a, is_active=False)
        self.rb, self.pb = rec('bob@b.com', self.co_b)

        today = timezone.localdate()

        def job(profile, title, days):
            return Job.objects.create(recruiter=profile, company=profile.company, title=title, description='d',
                                      requirements='r', location='K', job_type='full_time',
                                      deadline=today + timedelta(days=days))
        self.open_a = job(self.pa, 'Open A', 10)
        self.old_a = job(self.pa, 'Old A', -5)
        self.open_b = job(self.pb, 'Open B', 10)

        seeker = make_user('s@x.com', 'job_seeker')
        profile = JobSeekerProfile.objects.create(user=seeker, location='K', gender='N', phone='1')
        self.apps = []
        for j, st in ((self.open_a, 'submitted'), (self.old_a, 'under_review'), (self.open_b, 'accepted')):
            a = JobSeekerApplication.objects.create(
                job=j, applicant=profile, status=st,
                resume=SimpleUploadedFile('cv.pdf', b'%PDF-1.4', content_type='application/pdf'))
            self.apps.append(a)
        ApplicationAIAnalysis.objects.filter(application=self.apps[0]).update(status='completed', match_score=80)
        ApplicationAIAnalysis.objects.filter(application=self.apps[1]).update(status='completed', match_score=60)

    def test_only_business_can_see_the_dashboard(self):
        for user in (make_user('s2@x.com', 'job_seeker'), self.ra):
            c = APIClient()
            c.force_authenticate(user)
            self.assertEqual(c.get('/business/dashboard/').status_code, 403)
            self.assertEqual(c.get('/business/recruiters/').status_code, 403)
        self.assertEqual(APIClient().get('/business/dashboard/').status_code, 401)

    def test_overall_numbers(self):
        d = self.client.get('/business/dashboard/').data
        self.assertEqual(d['companies'], {'total': 3, 'active': 2, 'frozen': 1})
        self.assertEqual(d['recruiters'], {'total': 4, 'active': 3, 'frozen': 1, 'awaiting_first_login': 1})
        self.assertEqual(d['job_seekers']['total'], 1)
        self.assertEqual((d['jobs']['total'], d['jobs']['open'], d['jobs']['expired']), (3, 2, 1))
        self.assertEqual(d['applications']['total'], 3)
        self.assertEqual(d['applications']['by_status'],
                         {'submitted': 1, 'under_review': 1, 'shortlisted': 0, 'accepted': 1, 'rejected': 0})
        self.assertEqual(d['applications']['last_7_days'], 3)
        self.assertEqual(d['ai']['completed'], 2)
        self.assertEqual(d['ai']['average_score'], 70)

    def test_trend_covers_30_days_and_counts_today(self):
        trend = self.client.get('/business/dashboard/').data['trend']
        self.assertEqual(len(trend), 30)
        self.assertEqual(trend[-1]['applications'], 3)
        self.assertEqual(trend[-1]['jobs'], 3)
        self.assertEqual(trend[0]['applications'], 0)

    def test_top_companies_and_attention_lists(self):
        d = self.client.get('/business/dashboard/').data
        top = d['top_companies'][0]
        self.assertEqual((top['name'], top['applications'], top['jobs']), ('Alpha', 2, 2))

        attention = d['attention']
        self.assertEqual([c['name'] for c in attention['companies_without_recruiters']['items']], ['Gamma'])
        self.assertEqual(attention['awaiting_first_login']['items'][0]['email'], 'pat@a.com')
        self.assertEqual(attention['frozen_recruiters']['items'][0]['email'], 'fay@a.com')
        # no applicant details leak into the dashboard
        self.assertNotIn('s@x.com', str(d))

    def test_company_list_carries_per_company_stats(self):
        rows = {c['name']: c for c in self.client.get('/business/companies/').data['results']}
        a = rows['Alpha']
        self.assertEqual((a['recruiter_count'], a['active_recruiter_count'], a['frozen_recruiter_count']), (3, 2, 1))
        self.assertEqual((a['job_count'], a['open_job_count'], a['application_count']), (2, 1, 2))
        self.assertEqual(rows['Gamma']['recruiter_count'], 0)

    def test_recruiter_directory_search_and_filters(self):
        def names(**params):
            return sorted(r['email'] for r in self.client.get('/business/recruiters/', params).data)
        self.assertEqual(len(names()), 4)
        self.assertEqual(names(status='frozen'), ['fay@a.com'])
        self.assertEqual(names(status='pending'), ['pat@a.com'])
        self.assertEqual(names(status='active'), ['ann@a.com', 'bob@b.com'])
        self.assertEqual(names(company=self.co_b.id), ['bob@b.com'])
        self.assertEqual(names(search='beta'), ['bob@b.com'])
        row = self.client.get('/business/recruiters/', {'search': 'ann'}).data[0]
        self.assertEqual((row['company_name'], row['company_is_active']), ('Alpha', True))

    def test_freeze_and_unfreeze_a_recruiter_from_the_directory(self):
        url = f'/business/recruiters/{self.pa.id}/'
        self.assertEqual(self.client.patch(url, {'is_active': False}, format='json').status_code, 200)
        login = {'email': 'ann@a.com', 'password': PASSWORD}
        self.assertEqual(APIClient().post('/auth/login/', login, format='json').status_code, 403)
        self.client.patch(url, {'is_active': True}, format='json')
        self.assertEqual(APIClient().post('/auth/login/', login, format='json').status_code, 200)

        reset = self.client.post(f'{url}reset-password/')
        self.assertEqual(reset.status_code, 200)
        self.assertTrue(User.objects.get(email='ann@a.com').must_change_password)
        self.assertEqual(self.client.patch('/business/recruiters/99999/', {'is_active': False}, format='json').status_code, 404)

    def test_freezing_a_company_locks_out_recruiters_already_logged_in(self):
        login = APIClient().post('/auth/login/', {'email': 'ann@a.com', 'password': PASSWORD}, format='json')
        self.assertEqual(login.status_code, 200)
        token = f"Bearer {login.data['access']}"
        live = APIClient()
        live.credentials(HTTP_AUTHORIZATION=token)
        self.assertEqual(live.get('/access/jobs/').status_code, 200)

        self.client.patch(f'/business/companies/{self.co_a.id}/', {'is_active': False}, format='json')
        blocked = live.get('/access/jobs/')
        self.assertEqual(blocked.status_code, 403)
        self.assertEqual(blocked.data['code'], 'account_frozen')

        self.client.patch(f'/business/companies/{self.co_a.id}/', {'is_active': True}, format='json')
        self.assertEqual(live.get('/access/jobs/').status_code, 200)
