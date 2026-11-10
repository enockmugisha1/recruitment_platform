from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta
from applications.models import Job, JobSeekerApplication
from profiles.models import JobSeekerProfile, RecruiterProfile, Company

User = get_user_model()

class JobModelTest(TestCase):
    """Test the Job model"""
    
    def setUp(self):
        """Set up test data"""
        self.recruiter_user = User.objects.create_user(
            email='recruiter@example.com',
            password='pass123',
            role='recruiter',
            first_name='Jane',
            last_name='Smith'
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company_name='Tech Corp'
        )
    
    def test_create_job(self):
        """Test creating a job posting"""
        deadline = timezone.now().date() + timedelta(days=30)
        job = Job.objects.create(
            recruiter=self.recruiter_profile,
            title='Software Engineer',
            description='Build amazing software',
            requirements='Python, Django experience',
            location='Remote',
            job_type='full_time',
            salary_range='$80k - $120k',
            deadline=deadline
        )
        self.assertEqual(job.title, 'Software Engineer')
        self.assertEqual(job.recruiter, self.recruiter_profile)
        self.assertEqual(job.job_type, 'full_time')
        self.assertEqual(job.location, 'Remote')
    
    def test_job_string_representation(self):
        """Test the string representation of job"""
        deadline = timezone.now().date() + timedelta(days=30)
        job = Job.objects.create(
            recruiter=self.recruiter_profile,
            title='Data Scientist',
            description='Analyze data',
            requirements='ML experience',
            location='New York',
            job_type='full_time',
            deadline=deadline
        )
        self.assertEqual(str(job), 'Data Scientist')
    
    def test_job_type_choices(self):
        """Test different job type choices"""
        deadline = timezone.now().date() + timedelta(days=30)
        job_types = ['full_time', 'part_time', 'contract', 'internship']
        
        for job_type in job_types:
            job = Job.objects.create(
                recruiter=self.recruiter_profile,
                title=f'{job_type} position',
                description='Test job',
                requirements='Test',
                location='Test Location',
                job_type=job_type,
                deadline=deadline
            )
            self.assertEqual(job.job_type, job_type)


class JobSeekerApplicationModelTest(TestCase):
    """Test the JobSeekerApplication model"""
    
    def setUp(self):
        """Set up test data"""
        # Create recruiter
        self.recruiter_user = User.objects.create_user(
            email='recruiter@example.com',
            password='pass123',
            role='recruiter'
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company_name='Tech Corp'
        )
        
        # Create job seeker
        self.job_seeker_user = User.objects.create_user(
            email='jobseeker@example.com',
            password='pass123',
            role='job_seeker',
            first_name='John',
            last_name='Doe'
        )
        self.job_seeker_profile = JobSeekerProfile.objects.create(
            user=self.job_seeker_user,
            location='New York',
            nationality='American',
            bio='Developer',
            education='BS',
            institution_or_company='University',
            phone='+1234567890',
            gender='M'
        )
        
        # Create job
        deadline = timezone.now().date() + timedelta(days=30)
        self.job = Job.objects.create(
            recruiter=self.recruiter_profile,
            title='Software Engineer',
            description='Build software',
            requirements='Python',
            location='Remote',
            job_type='full_time',
            deadline=deadline
        )
    
    def test_create_application(self):
        """Test creating a job application"""
        resume = SimpleUploadedFile("resume.pdf", b"file_content", content_type="application/pdf")
        application = JobSeekerApplication.objects.create(
            job=self.job,
            applicant=self.job_seeker_profile,
            resume=resume,
            status='submitted'
        )
        self.assertEqual(application.job, self.job)
        self.assertEqual(application.applicant, self.job_seeker_profile)
        self.assertEqual(application.status, 'submitted')
    
    def test_application_string_representation(self):
        """Test the string representation of application"""
        resume = SimpleUploadedFile("resume.pdf", b"file_content", content_type="application/pdf")
        application = JobSeekerApplication.objects.create(
            job=self.job,
            applicant=self.job_seeker_profile,
            resume=resume
        )
        expected = f"{self.job_seeker_user.first_name} -> {self.job.title}"
        self.assertEqual(str(application), expected)
    
    def test_application_status_choices(self):
        """Test different application status choices"""
        statuses = ['submitted', 'under_review', 'shortlisted', 'rejected', 'accepted']
        resume = SimpleUploadedFile("resume.pdf", b"file_content", content_type="application/pdf")
        
        application = JobSeekerApplication.objects.create(
            job=self.job,
            applicant=self.job_seeker_profile,
            resume=resume
        )
        
        for status in statuses:
            application.status = status
            application.save()
            self.assertEqual(application.status, status)
    
    def test_application_unique_constraint(self):
        """Test that a user can only apply once to the same job"""
        resume1 = SimpleUploadedFile("resume1.pdf", b"file_content", content_type="application/pdf")
        resume2 = SimpleUploadedFile("resume2.pdf", b"file_content", content_type="application/pdf")
        
        JobSeekerApplication.objects.create(
            job=self.job,
            applicant=self.job_seeker_profile,
            resume=resume1
        )
        
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            JobSeekerApplication.objects.create(
                job=self.job,
                applicant=self.job_seeker_profile,
                resume=resume2
            )

# ---------------------------------------------------------------------------
# Company scoping + application review flow
# ---------------------------------------------------------------------------
from rest_framework.test import APIClient
from applications.models import ApplicationStatusEvent, ApplicationAIAnalysis


class ApplicationFlowTests(TestCase):
    """
    * submission carries the applicant's info and starts at "submitted"
    * a recruiter moves it submitted -> under_review -> shortlisted -> accepted
    * every recruiter of a COMPANY shares that company's jobs and applications,
      and recruiters of other companies see none of them
    """

    def setUp(self):
        deadline = timezone.now().date() + timedelta(days=30)

        self.co_a = Company.objects.create(name='Company A')
        self.co_b = Company.objects.create(name='Company B')

        def make_recruiter(email, company, first='Rec'):
            user = User.objects.create_user(email=email, password='pass12345', role='recruiter',
                                            first_name=first, last_name=company.name)
            profile = RecruiterProfile.objects.create(user=user, company=company, company_name=company.name)
            return user, profile

        self.rec_a, self.prof_a = make_recruiter('a@x.com', self.co_a, 'Ann')
        self.rec_a2, self.prof_a2 = make_recruiter('a2@x.com', self.co_a, 'Alex')   # colleague
        self.rec_b, self.prof_b = make_recruiter('b@x.com', self.co_b, 'Bob')

        def make_job(profile, title):
            return Job.objects.create(recruiter=profile, company=profile.company, title=title,
                                      description='d', requirements='r', location='Kigali',
                                      job_type='full_time', deadline=deadline)

        self.job_a = make_job(self.prof_a, 'Job A')
        self.job_b = make_job(self.prof_b, 'Job B')

        self.seeker = User.objects.create_user(email='s@x.com', password='pass12345',
                                               role='job_seeker', first_name='Sam', last_name='Seeker')
        self.seeker_profile = JobSeekerProfile.objects.create(
            user=self.seeker, location='Kigali', gender='N', phone='0788', years_of_experience=3,
            nationality='Rwandan', bio='Hello there', institution_or_company='ACME')

        self.client = APIClient()

    def _apply(self, job):
        self.client.force_authenticate(self.seeker)
        resume = SimpleUploadedFile('cv.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        # try to sneak in a status - must be ignored
        return self.client.post('/access/applications/',
                                {'job': job.id, 'resume': resume, 'status': 'accepted'},
                                format='multipart')

    # ---- submission ----
    def test_submission_includes_info_and_starts_submitted(self):
        res = self._apply(self.job_a)
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['status'], 'submitted')
        self.assertEqual(res.data['first_name'], 'Sam')
        self.assertEqual(res.data['email'], 's@x.com')
        self.assertEqual(res.data['job_title'], 'Job A')
        self.assertEqual(res.data['company_name'], 'Company A')
        self.assertEqual(res.data['phone'], '0788')
        # personal details
        self.assertEqual(res.data['nationality'], 'Rwandan')
        self.assertEqual(res.data['bio'], 'Hello there')
        self.assertEqual(res.data['institution_or_company'], 'ACME')
        self.assertEqual(res.data['gender'], 'Prefer not to say')
        # an applicant can never move their own application on
        self.assertEqual(res.data['allowed_next_statuses'], [])
        self.assertEqual([h['status'] for h in res.data['status_history']], ['submitted'])

    def test_cannot_apply_twice(self):
        self._apply(self.job_a)
        self.assertEqual(self._apply(self.job_a).status_code, 400)

    def test_recruiter_cannot_apply(self):
        self.client.force_authenticate(self.rec_a)
        resume = SimpleUploadedFile('cv.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        res = self.client.post('/access/applications/', {'job': self.job_a.id, 'resume': resume},
                               format='multipart')
        self.assertEqual(res.status_code, 403)

    def test_cannot_apply_to_inactive_company_job(self):
        self.co_a.is_active = False
        self.co_a.save()
        self.assertEqual(self._apply(self.job_a).status_code, 400)

    # ---- company scoping ----
    def test_recruiters_share_their_company_applications_but_not_others(self):
        app_a = self._apply(self.job_a).data['id']
        app_b = self._apply(self.job_b).data['id']

        for colleague in (self.rec_a, self.rec_a2):
            self.client.force_authenticate(colleague)
            ids = [a['id'] for a in self.client.get('/access/applications/').data['results']]
            self.assertEqual(ids, [app_a])
            self.assertEqual(self.client.get(f'/access/applications/{app_b}/').status_code, 404)

        self.client.force_authenticate(self.rec_b)
        ids = [a['id'] for a in self.client.get('/access/applications/').data['results']]
        self.assertEqual(ids, [app_b])

    def test_status_flow_colleague_can_move_other_company_cannot(self):
        app_id = self._apply(self.job_a).data['id']
        url = f'/access/applications/{app_id}/status/'

        # recruiter of ANOTHER company: not found
        self.client.force_authenticate(self.rec_b)
        self.assertEqual(self.client.post(url, {'status': 'under_review'}).status_code, 404)

        # can't skip straight to accepted
        self.client.force_authenticate(self.rec_a)
        self.assertEqual(self.client.post(url, {'status': 'accepted'}).status_code, 400)

        # Ann starts the review, her colleague Alex carries it on
        res = self.client.post(url, {'status': 'under_review'})
        self.assertEqual(res.status_code, 200, res.data)
        self.client.force_authenticate(self.rec_a2)
        for nxt in ['shortlisted', 'accepted']:
            res = self.client.post(url, {'status': nxt})
            self.assertEqual(res.status_code, 200, res.data)
            self.assertEqual(res.data['status'], nxt)
        # accepted is final
        self.assertEqual(self.client.post(url, {'status': 'rejected'}).status_code, 400)

        # history records who moved it (visible to recruiters)
        history = res.data['status_history']
        self.assertEqual([h['status'] for h in history],
                         ['submitted', 'under_review', 'shortlisted', 'accepted'])
        self.assertEqual(history[1]['changed_by'], 'Ann Company A')
        self.assertEqual(history[2]['changed_by'], 'Alex Company A')

        # the applicant sees the new status and the timeline, but not who did it
        self.client.force_authenticate(self.seeker)
        mine = self.client.get('/access/applications/').data['results'][0]
        self.assertEqual(mine['status'], 'accepted')
        self.assertEqual(len(mine['status_history']), 4)
        self.assertNotIn('changed_by', mine['status_history'][1])

    def test_applicant_cannot_change_status(self):
        app_id = self._apply(self.job_a).data['id']
        self.client.force_authenticate(self.seeker)
        res = self.client.post(f'/access/applications/{app_id}/status/', {'status': 'accepted'})
        self.assertEqual(res.status_code, 403)
        self.client.patch(f'/access/applications/{app_id}/', {'status': 'accepted'}, format='json')
        self.assertEqual(JobSeekerApplication.objects.get(id=app_id).status, 'submitted')

    def test_recruiter_cannot_delete_application(self):
        app_id = self._apply(self.job_a).data['id']
        self.client.force_authenticate(self.rec_a)
        self.assertEqual(self.client.delete(f'/access/applications/{app_id}/').status_code, 403)

    # ---- jobs ----
    def test_job_list_is_company_scoped_but_public_is_not(self):
        self.client.force_authenticate(self.rec_a2)   # colleague of the poster
        titles = [j['title'] for j in self.client.get('/access/jobs/').data['results']]
        self.assertEqual(titles, ['Job A'])
        self.assertEqual(self.client.get(f'/access/jobs/{self.job_b.id}/').status_code, 404)

        self.client.force_authenticate(self.seeker)
        self.assertEqual(len(self.client.get('/access/jobs/').data['results']), 2)
        self.client.force_authenticate(None)
        self.assertEqual(len(self.client.get('/access/jobs/').data['results']), 2)

    def test_inactive_company_jobs_hidden_from_public(self):
        self.co_b.is_active = False
        self.co_b.save()
        self.client.force_authenticate(self.seeker)
        titles = [j['title'] for j in self.client.get('/access/jobs/').data['results']]
        self.assertEqual(titles, ['Job A'])

    def test_new_job_belongs_to_the_recruiters_company(self):
        self.client.force_authenticate(self.rec_a2)
        res = self.client.post('/access/jobs/', {
            'title': 'New role', 'description': 'd', 'requirements': 'r', 'location': 'Kigali',
            'job_type': 'full_time',
            'deadline': (timezone.now().date() + timedelta(days=10)).isoformat(),
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['company'], self.co_a.id)
        self.assertEqual(res.data['company_name'], 'Company A')
        self.assertEqual(res.data['posted_by'], 'Alex Company A')

    def test_colleague_can_edit_job_other_company_cannot(self):
        self.client.force_authenticate(self.rec_a2)
        res = self.client.patch(f'/access/jobs/{self.job_a.id}/', {'title': 'Renamed'}, format='json')
        self.assertEqual(res.status_code, 200, res.data)

        self.client.force_authenticate(self.rec_b)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 404)
        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 403)
        self.client.force_authenticate(self.rec_a)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 204)


# ---------------------------------------------------------------------------
# Submission email + recruiter-only AI analysis
# ---------------------------------------------------------------------------
from unittest import mock
from django.core import mail
from django.conf import settings as django_settings
from django.test import override_settings

ML_URL = 'http://ml.test/api/v1/ai/analyze-application/'
ML_RESULT = {
    'match_score': 85,
    'recommendation': 'Strong match - recommend for interview',
    'summary': 'Experienced developer with a strong skills match.',
    'matched_skills': ['Python', 'Django'],
    'missing_skills': ['Docker'],
    'score_breakdown': {'skills': 75, 'experience': 95, 'education': 90, 'overall': 85},
}


def ml_response(payload=None, status=200):
    response = mock.Mock(status_code=status)
    response.json.return_value = payload if payload is not None else ML_RESULT
    if status >= 400:
        import requests
        error = requests.HTTPError(response=response)
        response.raise_for_status.side_effect = error
    else:
        response.raise_for_status.return_value = None
    return response


class AIAndEmailTests(TestCase):
    setUp = ApplicationFlowTests.setUp
    _apply = ApplicationFlowTests._apply

    def _submit(self, job=None):
        """Apply and let the on-commit work (email, AI call) run, as it would in production."""
        with self.captureOnCommitCallbacks(execute=True):
            return self._apply(job or self.job_a)

    # ---- the "we received your application" email ----
    def test_job_seeker_gets_a_no_reply_confirmation_email(self):
        res = self._submit()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, ['s@x.com'])
        self.assertIn('ThinkGreen Afrika', message.from_email)
        self.assertIn(django_settings.DEFAULT_FROM_EMAIL, message.from_email)
        self.assertIn('Job A', message.subject)
        self.assertIn('Sam', message.body)
        self.assertIn('Company A', message.body)
        self.assertIn('keep an eye', message.body)
        self.assertIn('/my-applications', message.body)
        self.assertIn("don't reply", message.body)
        html = message.alternatives[0][0]
        self.assertIn('Track my application', html)

    def test_confirmation_is_not_sent_for_a_rejected_submission(self):
        self._submit()
        mail.outbox.clear()
        self.assertEqual(self._submit().status_code, 400)   # duplicate application
        self.assertEqual(len(mail.outbox), 0)

    def test_mail_server_failure_does_not_break_submission(self):
        with mock.patch('django.core.mail.message.EmailMultiAlternatives.send', side_effect=OSError('smtp down')):
            res = self._submit()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(JobSeekerApplication.objects.count(), 1)

    def test_status_change_emails_the_applicant(self):
        app_id = self._submit().data['id']
        mail.outbox.clear()
        self.client.force_authenticate(self.rec_a)
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(f'/access/applications/{app_id}/status/', {'status': 'under_review'})
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['s@x.com'])
        self.assertIn('Under Review', mail.outbox[0].subject)

    # ---- AI analysis ----
    def test_ai_marked_unavailable_until_the_ml_service_is_configured(self):
        app_id = self._submit().data['id']
        self.client.force_authenticate(self.rec_a)
        data = self.client.get(f'/access/applications/{app_id}/').data
        self.assertEqual(data['ai_analysis']['status'], 'unavailable')
        self.assertIsNone(data['ai_analysis']['match_score'])
        res = self.client.post(f'/access/applications/{app_id}/analyze/')
        self.assertEqual(res.status_code, 503)

    @override_settings(ML_SERVICE_URL=ML_URL, ML_SERVICE_API_KEY='secret-key')
    def test_submission_is_analysed_and_recruiter_sees_the_result(self):
        with mock.patch('applications.ai.requests.post', return_value=ml_response()) as post:
            app_id = self._submit().data['id']

        # what we sent: the resume file, job + applicant details, and the API key
        kwargs = post.call_args.kwargs
        self.assertEqual(post.call_args.args[0], ML_URL)
        self.assertIn('resume', kwargs['files'])
        self.assertEqual(kwargs['headers']['Authorization'], 'Bearer secret-key')
        self.assertIn('"title": "Job A"', kwargs['data']['job'])
        self.assertIn('"years_of_experience": 3', kwargs['data']['applicant'])

        for recruiter in (self.rec_a, self.rec_a2):          # any recruiter of the company
            self.client.force_authenticate(recruiter)
            ai = self.client.get(f'/access/applications/{app_id}/').data['ai_analysis']
            self.assertEqual(ai['status'], 'completed')
            self.assertEqual(ai['match_score'], 85)
            self.assertEqual(ai['recommendation'], 'Strong match - recommend for interview')
            self.assertEqual(ai['details']['matched_skills'], ['Python', 'Django'])
            self.assertIsNotNone(ai['analyzed_at'])

        # the list view carries it too (the Candidates table shows the score)
        listed = self.client.get('/access/applications/').data['results'][0]
        self.assertEqual(listed['ai_analysis']['match_score'], 85)

    @override_settings(ML_SERVICE_URL=ML_URL)
    def test_ai_results_are_never_visible_to_the_job_seeker(self):
        with mock.patch('applications.ai.requests.post', return_value=ml_response()):
            created = self._submit()
        self.assertNotIn('ai_analysis', created.data)

        self.client.force_authenticate(self.seeker)
        listed = self.client.get('/access/applications/').data['results'][0]
        self.assertNotIn('ai_analysis', listed)
        detail = self.client.get(f'/access/applications/{listed["id"]}/').data
        self.assertNotIn('ai_analysis', detail)
        self.assertNotIn('85', str(detail.get('status_history', '')))
        # and they cannot trigger or read it through the analyze endpoint
        self.assertEqual(self.client.post(f'/access/applications/{listed["id"]}/analyze/').status_code, 403)

    @override_settings(ML_SERVICE_URL=ML_URL)
    def test_other_companys_recruiter_cannot_see_or_run_the_analysis(self):
        with mock.patch('applications.ai.requests.post', return_value=ml_response()):
            app_id = self._submit().data['id']
        self.client.force_authenticate(self.rec_b)
        self.assertEqual(self.client.get(f'/access/applications/{app_id}/').status_code, 404)
        self.assertEqual(self.client.post(f'/access/applications/{app_id}/analyze/').status_code, 404)

    @override_settings(ML_SERVICE_URL=ML_URL)
    def test_ml_failure_is_recorded_and_a_recruiter_can_retry(self):
        import requests
        with mock.patch('applications.ai.requests.post', side_effect=requests.ConnectionError('boom')):
            app_id = self._submit().data['id']                      # submission itself still succeeds
        self.client.force_authenticate(self.rec_a)
        ai = self.client.get(f'/access/applications/{app_id}/').data['ai_analysis']
        self.assertEqual(ai['status'], 'failed')
        self.assertEqual(ai['error'], 'Could not reach the ML service.')

        with mock.patch('applications.ai.requests.post', return_value=ml_response()):
            with self.captureOnCommitCallbacks(execute=True):
                res = self.client.post(f'/access/applications/{app_id}/analyze/')
        # accepted and queued: the analysis itself finishes in the background
        self.assertEqual(res.status_code, 202)
        self.assertEqual(res.data['ai_analysis']['status'], 'pending')
        ai = self.client.get(f'/access/applications/{app_id}/').data['ai_analysis']
        self.assertEqual((ai['status'], ai['match_score']), ('completed', 85))

    @override_settings(ML_SERVICE_URL=ML_URL)
    def test_http_error_and_alternate_score_shapes(self):
        with mock.patch('applications.ai.requests.post', return_value=ml_response(status=500)):
            app_id = self._submit().data['id']
        self.assertEqual(ApplicationAIAnalysis.objects.get(application_id=app_id).error, 'The ML service returned HTTP 500.')

        from applications.ai import analyze_application
        for payload, expected in (({'score': 71.6, 'summary': 'ok'}, 72),
                                  ({'score_breakdown': {'overall': 64}}, 64),
                                  ({'match_score': 250}, 100)):
            with mock.patch('applications.ai.requests.post', return_value=ml_response(payload)):
                analysis = analyze_application(app_id, force=True)
            self.assertEqual((analysis.status, analysis.match_score), ('completed', expected))

    @override_settings(ML_SERVICE_URL=ML_URL)
    def test_missing_requests_package_does_not_break_the_app(self):
        with mock.patch('applications.ai.requests', None):
            app_id = self._submit().data['id']          # submitting still works
        analysis = ApplicationAIAnalysis.objects.get(application_id=app_id)
        self.assertEqual(analysis.status, 'failed')
        self.assertIn('pip install requests', analysis.error)
