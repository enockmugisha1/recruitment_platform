from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class MyUserModelTest(TestCase):
    """Test the custom user model"""
    
    def setUp(self):
        """Set up test data"""
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'testpass123',
            'role': 'job_seeker',
            'username': 'testuser'
        }
    
    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.role, 'job_seeker')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            role='recruiter'
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_active)
    
    def test_user_email_unique(self):
        """Test that email must be unique"""
        User.objects.create_user(**self.user_data)
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                email='testuser@example.com',
                password='pass123',
                role='recruiter'
            )
    
    def test_user_email_required(self):
        """Test that email is required"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                password='pass123',
                role='job_seeker'
            )
    
    def test_user_password_required(self):
        """Test that password is required"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='test@example.com',
                password=None,
                role='job_seeker'
            )
    
    def test_user_role_choices(self):
        """Test user role choices"""
        job_seeker = User.objects.create_user(
            email='jobseeker@example.com',
            password='pass123',
            role='job_seeker'
        )
        recruiter = User.objects.create_user(
            email='recruiter@example.com',
            password='pass123',
            role='recruiter'
        )
        self.assertEqual(job_seeker.role, 'job_seeker')
        self.assertEqual(recruiter.role, 'recruiter')
    
    def test_user_string_representation(self):
        """Test the string representation of user"""
        user = User.objects.create_user(**self.user_data)
        expected = f'{user.email}: A {user.role}'
        self.assertEqual(str(user), expected)
