# Frontend-Backend Integration Guide

## Overview
This document explains how the frontend (React/TypeScript) integrates with the Django REST API backend.

## Architecture

### Backend APIs
The backend provides REST APIs at `/access/` endpoints:

**Authentication (`/auth/`)**
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `POST /auth/otp/request/` - Request OTP
- `POST /auth/otp/verify/` - Verify OTP
- `POST /auth/password/reset/` - Reset password
- `PUT /auth/update/` - Update user profile

**Jobs (`/access/jobs/`)**
- `GET /access/jobs/` - List all jobs (public)
- `POST /access/jobs/` - Create job (recruiter only)
- `GET /access/jobs/{id}/` - Get job details
- `PUT /access/jobs/{id}/` - Update job
- `DELETE /access/jobs/{id}/` - Delete job
- `GET /access/jobs/statistics/` - Get job statistics

**Query Parameters for Jobs:**
- `?search=keyword` - Search in title, description, location, requirements
- `?job_type=full_time` - Filter by job type
- `?location=Remote` - Filter by location
- `?active_only=true` - Show only active jobs
- `?ordering=-created_at` - Sort results

**Applications (`/access/applications/`)**
- `GET /access/applications/` - List user's applications
- `POST /access/applications/` - Submit application
- `GET /access/applications/{id}/` - Get application details
- `PUT /access/applications/{id}/` - Update application
- `DELETE /access/applications/{id}/` - Delete application

**Query Parameters for Applications:**
- `?status=submitted` - Filter by status
- `?ordering=-applied_at` - Sort results

**Profiles**
- `GET /access/job-seeker-profile/` - Get job seeker profile
- `POST /access/job-seeker-profile/` - Create job seeker profile
- `PUT /access/job-seeker-profile/{id}/` - Update job seeker profile
- `GET /access/recruiter-profile/` - Get recruiter profile
- `POST /access/recruiter-profile/` - Create recruiter profile
- `PUT /access/recruiter-profile/{id}/` - Update recruiter profile

**Calendar (`/access/calendar-events/`)**
- `GET /access/calendar-events/` - List events
- `POST /access/calendar-events/` - Create event
- `GET /access/calendar-events/{id}/` - Get event details
- `PUT /access/calendar-events/{id}/` - Update event
- `DELETE /access/calendar-events/{id}/` - Delete event

**Query Parameters for Calendar:**
- `?month=1` - Filter by month
- `?year=2025` - Filter by year
- `?type=interview` - Filter by event type

## Frontend Service Layer

### Location
`Application-analyzer/src/api/services.ts`

### Services Available

1. **authService** - Authentication operations
2. **jobService** - Job management
3. **applicationService** - Application management
4. **profileService** - Profile management
5. **calendarService** - Calendar event management

### Example Usage

```typescript
import { jobService, applicationService } from '../api/services';

// Fetch all jobs
const jobs = await jobService.getAllJobs({
  search: 'developer',
  job_type: 'full_time',
  active_only: true
});

// Create a job
const newJob = await jobService.createJob({
  title: 'Senior Developer',
  description: 'We are looking for...',
  requirements: 'Required skills...',
  location: 'Remote',
  job_type: 'full_time',
  salary_range: '$80k - $120k',
  deadline: '2025-12-31'
});

// Apply for a job
const formData = new FormData();
formData.append('job', jobId.toString());
formData.append('resume', resumeFile);
formData.append('cover_letter', coverLetterFile);

await applicationService.applyForJob(formData);

// Get my applications
const myApplications = await applicationService.getMyApplications({
  status: 'under_review',
  ordering: '-applied_at'
});
```

## Pages Updated

### 1. Jobs.tsx
**File**: `Application-analyzer/src/pages/Jobs.tsx`

**Features**:
- Fetches real jobs from backend API
- Search and filter functionality
- Apply for jobs with file upload
- Shows loading and error states
- Paginated results handling

**Usage**:
- Public access (anyone can view jobs)
- Authenticated users can apply

### 2. CreateJob.tsx
**File**: `Application-analyzer/src/pages/CreateJob.tsx`

**Features**:
- Create new job postings
- Form validation
- Error handling with toast notifications
- Redirects to jobs page after success

**Usage**:
- Recruiter only
- Requires authentication

### 3. MyApplications.tsx (New)
**File**: `Application-analyzer/src/pages/MyApplications.tsx`

**Features**:
- View all user's job applications
- Filter by status
- View application details
- Download resume/cover letter
- Statistics dashboard

**Usage**:
- Job seeker only
- Requires authentication

### 4. RecruiterApplications.tsx (New)
**File**: `Application-analyzer/src/pages/RecruiterApplications.tsx`

**Features**:
- View applications for recruiter's jobs
- Filter by job and status
- Update application status
- View candidate details
- Download resumes

**Usage**:
- Recruiter only
- Requires authentication

## Authentication Flow

### Token Management

**Storage**:
- Access token stored in `localStorage.getItem('accessToken')`
- Refresh token stored in `localStorage.getItem('refreshToken')`
- User data stored in `localStorage.getItem('user')`

**Automatic Token Refresh**:
The axios interceptor automatically refreshes expired access tokens:

```typescript
// In axios.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isPublicEndpoint) {
      // Refresh token logic
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      localStorage.setItem('accessToken', response.data.access);
      // Retry original request
    }
  }
);
```

### Login Example

```typescript
import { authService } from '../api/services';

const handleLogin = async (email: string, password: string) => {
  try {
    const data = await authService.login({ email, password });
    
    // Store tokens
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user_data));
    
    // Redirect based on role
    if (data.user_data.role === 'recruiter') {
      navigate('/dashboard');
    } else {
      navigate('/jobs');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## File Upload Handling

### Uploading Files

```typescript
// Create FormData
const formData = new FormData();
formData.append('job', jobId.toString());
formData.append('resume', resumeFile);
formData.append('cover_letter', coverLetterFile);

// Send with proper headers
await axios.post('/access/applications/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});
```

### Backend Validation
- Max file size: 5MB
- Allowed extensions: .pdf, .doc, .docx
- Resume is required
- Cover letter is optional

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message",
  "error": "Specific error",
  "field_name": ["Field specific error"]
}
```

### Frontend Error Handling Pattern

```typescript
try {
  const data = await jobService.createJob(jobData);
  toast.success('Job created successfully!');
} catch (err: any) {
  let errorMessage = 'Operation failed';
  
  if (err.response?.data) {
    if (err.response.data.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.response.data.error) {
      errorMessage = err.response.data.error;
    } else {
      // Get first field error
      const firstError = Object.values(err.response.data)[0];
      if (Array.isArray(firstError)) {
        errorMessage = firstError[0];
      }
    }
  }
  
  toast.error(errorMessage);
}
```

## Environment Variables

### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional, defaults to SQLite)
USE_POSTGRESQL=False
DB_NAME=recruitment_db
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# Redis (optional)
USE_REDIS_CACHE=False
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@recruitment.com
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Testing the Integration

### 1. Start Backend
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate  # or env/bin/activate
python manage.py runserver
```

### 2. Start Frontend
```bash
cd Application-analyzer
npm install
npm run dev
```

### 3. Test Flow

**User Registration**:
1. Navigate to `/signup`
2. Register as job_seeker or recruiter
3. Verify email with OTP (check console logs)
4. Login at `/login`

**Job Seeker Flow**:
1. Browse jobs at `/jobs`
2. Search and filter jobs
3. Apply for jobs
4. View applications at `/my-applications`

**Recruiter Flow**:
1. Create job at `/create-job`
2. View applications at `/recruiter-applications`
3. Update application status
4. Schedule interviews in calendar

## Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Check `CORS_ALLOWED_ORIGINS` in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
]
```

### Issue: 401 Unauthorized
**Solution**: 
- Check if token is stored: `localStorage.getItem('accessToken')`
- Verify token is not expired
- Check if endpoint requires authentication

### Issue: File Upload Fails
**Solution**:
- Check file size (max 5MB)
- Verify file extension (.pdf, .doc, .docx)
- Ensure `Content-Type: multipart/form-data` header

### Issue: Jobs Not Loading
**Solution**:
- Check backend is running (`python manage.py runserver`)
- Verify endpoint: `http://localhost:8000/access/jobs/`
- Check browser console for errors
- Verify CORS settings

## API Response Formats

### Paginated Response
```json
{
  "count": 100,
  "next": "http://localhost:8000/access/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Software Engineer",
      ...
    }
  ]
}
```

### Job Object
```json
{
  "id": 1,
  "title": "Software Engineer",
  "description": "We are looking for...",
  "requirements": "Required skills...",
  "location": "Remote",
  "job_type": "full_time",
  "salary_range": "$80k - $120k",
  "deadline": "2025-12-31",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "recruiter": 1
}
```

### Application Object
```json
{
  "id": 1,
  "job": 1,
  "applicant": 1,
  "resume": "http://localhost:8000/media/applications/resumes/resume.pdf",
  "cover_letter": "http://localhost:8000/media/applications/letters/cover.pdf",
  "status": "submitted",
  "applied_at": "2025-01-15T12:00:00Z"
}
```

## Next Steps

1. **Add Email Notifications**: Configure SMTP settings in `.env`
2. **Add Profile Pages**: Create profile viewing/editing pages
3. **Add Calendar Integration**: Implement calendar view for interviews
4. **Add Dashboard Stats**: Create analytics dashboard
5. **Add Real-time Updates**: Implement WebSocket for live notifications

## Support

For issues or questions:
- Check `/api/swagger/` for API documentation
- Review backend logs: `logs/recruitment.log`
- Check frontend console for errors
- Test endpoints with Postman
