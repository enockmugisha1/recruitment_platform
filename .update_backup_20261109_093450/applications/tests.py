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
from applications.models import ApplicationStatusEvent


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
