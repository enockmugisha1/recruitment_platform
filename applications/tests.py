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