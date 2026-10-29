from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta
from applications.models import Job, JobSeekerApplication
from profiles.models import JobSeekerProfile, RecruiterProfile

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
# Recruiter scoping + application review flow
# ---------------------------------------------------------------------------
from rest_framework.test import APIClient


class ApplicationFlowTests(TestCase):
    """
    * submission carries the applicant's info and starts at "submitted"
    * recruiter moves it submitted -> under_review -> shortlisted -> accepted
    * a recruiter only ever sees what they posted
    """

    def setUp(self):
        deadline = timezone.now().date() + timedelta(days=30)

        def make_recruiter(email, company):
            user = User.objects.create_user(email=email, password='pass12345', role='recruiter',
                                            first_name='Rec', last_name=company)
            profile = RecruiterProfile.objects.create(user=user, company_name=company)
            return user, profile

        self.rec_a, self.prof_a = make_recruiter('a@x.com', 'A')
        self.rec_b, self.prof_b = make_recruiter('b@x.com', 'B')

        def make_job(profile, title):
            return Job.objects.create(recruiter=profile, title=title, description='d',
                                      requirements='r', location='Kigali',
                                      job_type='full_time', deadline=deadline)

        self.job_a = make_job(self.prof_a, 'Job A')
        self.job_b = make_job(self.prof_b, 'Job B')

        self.seeker = User.objects.create_user(email='s@x.com', password='pass12345',
                                               role='job_seeker', first_name='Sam', last_name='Seeker')
        self.seeker_profile = JobSeekerProfile.objects.create(
            user=self.seeker, location='Kigali', gender='N', phone='0788', years_of_experience=3)

        self.client = APIClient()

    def _apply(self, job):
        self.client.force_authenticate(self.seeker)
        resume = SimpleUploadedFile('cv.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        # try to sneak in a status — must be ignored
        return self.client.post('/access/applications/',
                                {'job': job.id, 'resume': resume, 'status': 'accepted'},
                                format='multipart')

    def test_submission_includes_info_and_starts_submitted(self):
        res = self._apply(self.job_a)
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['status'], 'submitted')
        self.assertEqual(res.data['first_name'], 'Sam')
        self.assertEqual(res.data['email'], 's@x.com')
        self.assertEqual(res.data['job_title'], 'Job A')
        self.assertEqual(res.data['phone'], '0788')
        self.assertEqual(res.data['allowed_next_statuses'], ['under_review', 'rejected'])

    def test_cannot_apply_twice(self):
        self._apply(self.job_a)
        res = self._apply(self.job_a)
        self.assertEqual(res.status_code, 400)

    def test_recruiter_cannot_apply(self):
        self.client.force_authenticate(self.rec_a)
        resume = SimpleUploadedFile('cv.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        res = self.client.post('/access/applications/', {'job': self.job_a.id, 'resume': resume},
                               format='multipart')
        self.assertEqual(res.status_code, 403)

    def test_recruiter_sees_only_own_applications(self):
        app_a = self._apply(self.job_a).data['id']
        app_b = self._apply(self.job_b).data['id']

        self.client.force_authenticate(self.rec_a)
        ids = [a['id'] for a in self.client.get('/access/applications/').data['results']]
        self.assertEqual(ids, [app_a])
        self.assertEqual(self.client.get(f'/access/applications/{app_b}/').status_code, 404)

    def test_status_flow_and_isolation(self):
        app_id = self._apply(self.job_a).data['id']

        # recruiter B (not the poster) cannot touch it
        self.client.force_authenticate(self.rec_b)
        res = self.client.post(f'/access/applications/{app_id}/status/', {'status': 'under_review'})
        self.assertEqual(res.status_code, 404)

        # recruiter A walks it through the pipeline
        self.client.force_authenticate(self.rec_a)
        url = f'/access/applications/{app_id}/status/'
        # can't skip straight to accepted
        self.assertEqual(self.client.post(url, {'status': 'accepted'}).status_code, 400)
        for nxt in ['under_review', 'shortlisted', 'accepted']:
            res = self.client.post(url, {'status': nxt})
            self.assertEqual(res.status_code, 200, res.data)
            self.assertEqual(res.data['status'], nxt)
        # accepted is final
        self.assertEqual(self.client.post(url, {'status': 'rejected'}).status_code, 400)

        # the applicant sees the new status
        self.client.force_authenticate(self.seeker)
        mine = self.client.get('/access/applications/').data['results']
        self.assertEqual(mine[0]['status'], 'accepted')

    def test_applicant_cannot_change_status(self):
        app_id = self._apply(self.job_a).data['id']
        self.client.force_authenticate(self.seeker)
        res = self.client.post(f'/access/applications/{app_id}/status/', {'status': 'accepted'})
        self.assertEqual(res.status_code, 403)
        res = self.client.patch(f'/access/applications/{app_id}/', {'status': 'accepted'}, format='json')
        self.assertEqual(JobSeekerApplication.objects.get(id=app_id).status, 'submitted')

    def test_recruiter_cannot_delete_application(self):
        app_id = self._apply(self.job_a).data['id']
        self.client.force_authenticate(self.rec_a)
        self.assertEqual(self.client.delete(f'/access/applications/{app_id}/').status_code, 403)

    def test_recruiter_job_list_is_scoped_but_public_is_not(self):
        self.client.force_authenticate(self.rec_a)
        titles = [j['title'] for j in self.client.get('/access/jobs/').data['results']]
        self.assertEqual(titles, ['Job A'])

        self.client.force_authenticate(self.seeker)
        self.assertEqual(len(self.client.get('/access/jobs/').data['results']), 2)

        self.client.force_authenticate(None)
        self.assertEqual(len(self.client.get('/access/jobs/').data['results']), 2)

    def test_only_poster_can_edit_or_delete_job(self):
        self.client.force_authenticate(self.rec_b)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 404)
        self.client.force_authenticate(self.seeker)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 403)
        self.client.force_authenticate(self.rec_a)
        self.assertEqual(self.client.delete(f'/access/jobs/{self.job_a.id}/').status_code, 204)
