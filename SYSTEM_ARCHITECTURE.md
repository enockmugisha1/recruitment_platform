# Recruitment Platform - System Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication Flow](#authentication-flow)
7. [File Structure](#file-structure)

---

## 🎯 Overview

### Technology Stack

**Backend:**
- Framework: Django 5.x + Django REST Framework
- Database: PostgreSQL (production) / SQLite (development)
- Authentication: JWT (JSON Web Tokens)
- API Documentation: Swagger/OpenAPI (drf-yasg)
- Task Queue: Celery (for async tasks)
- Caching: Redis

**Frontend:**
- Framework: React 18+ with TypeScript
- Build Tool: Vite
- Routing: React Router v6
- HTTP Client: Axios
- State Management: React Context API
- UI: Tailwind CSS
- Notifications: React Toastify

---

## 🔧 Backend Architecture

### Django Project Structure

```
recruitment_platform/
├── applications/          # Job postings and applications
├── users/                 # User authentication and management
├── profiles/              # User profiles (Recruiter/Job Seeker)
├── recruitment_platform/  # Main project settings
└── media/                 # File uploads (resumes, etc.)
```

### Core Modules

#### 1. **Users Module** (`users/`)
*Handles authentication, user management, and OTP verification*

**Models:**
- `MyUser` - Custom user model extending AbstractUser
- `OTP` - One-time password for email verification and password reset

**Key Features:**
- User registration (Job Seeker / Recruiter)
- JWT-based authentication
- Email verification via OTP
- Password reset functionality
- Account security (login attempts, account locking)

**Main Endpoints:**
```
POST   /auth/register/           # User registration
POST   /auth/login/              # User login (returns JWT tokens)
POST   /auth/logout/             # User logout
POST   /auth/request-otp/        # Request OTP for verification
POST   /auth/verify-otp/         # Verify OTP code
POST   /auth/forgot-password/    # Password reset request
POST   /auth/reset-password/     # Reset password with OTP
```

#### 2. **Profiles Module** (`profiles/`)
*Manages user profiles for both recruiters and job seekers*

**Models:**
- `RecruiterProfile` - Extended profile for recruiters
  - Company information
  - Contact details
  
- `JobSeekerProfile` - Extended profile for job seekers
  - Personal information (location, nationality, bio)
  - Education and experience
  - Skills and qualifications
  - Profile picture

**Main Endpoints:**
```
GET    /profile/recruiter/       # Get recruiter profile
POST   /profile/recruiter/       # Create recruiter profile
PUT    /profile/recruiter/{id}/  # Update recruiter profile

GET    /profile/job-seeker/      # Get job seeker profile
POST   /profile/job-seeker/      # Create job seeker profile
PUT    /profile/job-seeker/{id}/ # Update job seeker profile
```

#### 3. **Applications Module** (`applications/`)
*Manages job postings, applications, and calendar events*

**Models:**

**Job:**
```python
- recruiter: ForeignKey to RecruiterProfile
- title: CharField
- description: TextField
- requirements: TextField
- location: CharField
- job_type: CharField (full_time, part_time, contract, internship)
- salary_range: CharField
- deadline: DateField
- created_at, updated_at: DateTime
```

**JobSeekerApplication:**
```python
- job: ForeignKey to Job
- applicant: ForeignKey to JobSeekerProfile
- resume: FileField (PDF/DOC/DOCX)
- cover_letter: FileField (optional)
- status: CharField (submitted, under_review, shortlisted, rejected, accepted)
- applied_at: DateTime
```

**CalendarEvent:**
```python
- recruiter: ForeignKey to RecruiterProfile
- title: CharField
- event_type: CharField (interview, meeting, deadline, other)
- date: DateTime
- candidate: ForeignKey to JobSeekerProfile (optional)
- location, description: CharField/TextField
```

**Main Endpoints:**
```
# Jobs
GET    /access/jobs/                    # List all jobs (public)
POST   /access/jobs/                    # Create job (recruiter)
GET    /access/jobs/{id}/               # Get job details
PUT    /access/jobs/{id}/               # Update job
DELETE /access/jobs/{id}/               # Delete job
GET    /access/jobs/statistics/         # Job statistics
GET    /access/jobs/dashboard_stats/    # Dashboard stats (recruiter)

# Applications
GET    /access/applications/            # List applications
POST   /access/applications/            # Submit application
GET    /access/applications/{id}/       # Get application details
PUT    /access/applications/{id}/       # Update application
DELETE /access/applications/{id}/       # Delete application

# Calendar
GET    /access/calendar/                # List events (recruiter)
POST   /access/calendar/                # Create event
GET    /access/calendar/{id}/           # Get event details
PUT    /access/calendar/{id}/           # Update event
DELETE /access/calendar/{id}/           # Delete event
GET    /access/calendar/upcoming/       # Get upcoming events
```

### Request/Response Flow

```
User Request (Frontend)
    ↓
Axios Interceptor (adds JWT token)
    ↓
Django URL Router
    ↓
ViewSet (REST Framework)
    ↓
Permission Classes (IsAuthenticated, etc.)
    ↓
Serializer Validation
    ↓
Database Query (PostgreSQL/SQLite)
    ↓
Serializer (format response)
    ↓
JSON Response
    ↓
Frontend (display data)
```

---

## ⚛️ Frontend Architecture

### React Application Structure

```
Application-analyzer/src/
├── api/
│   ├── axios.ts              # Axios configuration
│   └── services.ts           # API service functions
├── components/               # Reusable components
│   ├── AdminSidebar.tsx
│   ├── JobSeekerSidebar.tsx
│   └── AIResumeAnalyzer.tsx
├── contexts/
│   └── AuthContext.tsx       # Authentication state
├── features/                 # Feature modules
│   ├── candidates/
│   └── home/
├── layouts/
│   ├── AdminLayout.tsx       # Recruiter layout
│   └── JobSeekerLayout.tsx   # Job seeker layout
├── pages/                    # Page components
│   ├── Home.tsx
│   ├── Jobs.tsx
│   ├── Candidates.tsx
│   ├── Login.tsx
│   └── Signup.tsx
└── App.tsx                   # Main app component
```

### Key Services (`api/services.ts`)

**Authentication:**
```typescript
authService.register(userData)
authService.login(credentials)
authService.logout(refreshToken)
authService.requestOTP(email, purpose)
authService.verifyOTP(email, otp_code, purpose)
```

**Jobs:**
```typescript
jobService.getAllJobs(params)
jobService.getJob(jobId)
jobService.createJob(jobData)
jobService.updateJob(jobId, jobData)
jobService.deleteJob(jobId)
jobService.getStatistics()
```

**Applications:**
```typescript
applicationService.getMyApplications(params)
applicationService.getApplication(applicationId)
applicationService.applyForJob(formData)
applicationService.updateApplication(applicationId, formData)
```

**Profiles:**
```typescript
profileService.getJobSeekerProfile()
profileService.updateJobSeekerProfile(profileId, formData)
profileService.getRecruiterProfile()
profileService.updateRecruiterProfile(profileId, formData)
```

### Routing Structure

```
/ (root)
├── /login                    # Login page
├── /signup                   # Registration page
├── /forgot-password          # Password reset
│
├── Admin/Recruiter Routes (with AdminLayout)
│   ├── /                     # Dashboard/Overview
│   ├── /jobs                 # Job listings
│   ├── /jobs/create          # Create new job
│   ├── /jobs/:id             # Job details
│   ├── /candidates           # Candidate list
│   ├── /candidates/:id       # Candidate details
│   ├── /calendar             # Calendar/Events
│   └── /reports             # Reports and analytics
│
└── Job Seeker Routes (with JobSeekerLayout)
    ├── /dashboard            # Job seeker dashboard
    ├── /browse-jobs          # Browse available jobs
    ├── /my-applications      # User's applications
    └── /profile              # User profile
```

---

## 💾 Database Schema

### Entity Relationship Diagram

```
MyUser (users)
 ├─1:1─> RecruiterProfile
 │       └─1:N─> Job
 │               └─1:N─> JobSeekerApplication
 │       └─1:N─> CalendarEvent
 │
 └─1:1─> JobSeekerProfile
         └─1:N─> JobSeekerApplication
```

### Key Relationships

- **One User** → **One Profile** (either Recruiter OR Job Seeker)
- **One Recruiter** → **Many Jobs**
- **One Job** → **Many Applications**
- **One Job Seeker** → **Many Applications**
- **One Recruiter** → **Many Calendar Events**
- **One Application** → **One Job** + **One Job Seeker**

### Indexes

**Optimized queries with indexes on:**
- `Job`: recruiter, job_type, location, deadline, created_at
- `JobSeekerApplication`: job, applicant, status, applied_at
- `CalendarEvent`: recruiter, event_type, date, created_at

---

## 📡 API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

### Authentication

**All authenticated endpoints require JWT token in header:**
```
Authorization: Bearer <access_token>
```

### Token Structure

**Access Token:**
- Lifetime: 30 minutes
- Used for: All API requests

**Refresh Token:**
- Lifetime: 7 days  
- Used for: Obtaining new access token

### Common Response Formats

**Success Response:**
```json
{
  "id": 1,
  "title": "Senior Developer",
  "created_at": "2026-01-12T10:30:00Z"
}
```

**Error Response:**
```json
{
  "detail": "Error message here",
  "errors": {
    "field_name": ["Error description"]
  }
}
```

**Paginated Response:**
```json
{
  "count": 100,
  "next": "http://api/jobs/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## 🔐 Authentication Flow

### Registration Flow

```
1. User fills registration form
   ↓
2. POST /auth/register/
   - email, password, role (job_seeker/recruiter)
   ↓
3. System creates user account (inactive)
   ↓
4. OTP sent to email
   ↓
5. User enters OTP
   ↓
6. POST /auth/verify-otp/
   ↓
7. Account activated
   ↓
8. User can login
```

### Login Flow

```
1. User enters credentials
   ↓
2. POST /auth/login/
   ↓
3. Backend validates credentials
   ↓
4. Returns JWT tokens:
   {
     "access": "eyJ...",
     "refresh": "eyJ...",
     "user": {...}
   }
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Axios interceptor adds token to all requests
```

### Token Refresh

```
When access token expires:
1. Request fails with 401
   ↓
2. Frontend sends refresh token
   ↓
3. POST /auth/token/refresh/
   ↓
4. Receives new access token
   ↓
5. Retry original request
```

---

## 📁 File Structure Details

### Backend File Structure

```
recruitment_platform/
│
├── applications/
│   ├── models.py           # Job, Application, CalendarEvent models
│   ├── views.py            # ViewSets for API endpoints
│   ├── serializers.py      # Data serialization
│   ├── urls.py             # URL routing
│   ├── permissions.py      # Custom permissions
│   ├── filters.py          # Query filters
│   └── validators.py       # Custom validators
│
├── users/
│   ├── models.py           # MyUser, OTP models
│   ├── views.py            # Auth endpoints
│   ├── serializers.py      # User serialization
│   ├── urls.py             # Auth routes
│   └── tasks.py            # Celery tasks (email sending)
│
├── profiles/
│   ├── models.py           # RecruiterProfile, JobSeekerProfile
│   ├── views.py            # Profile endpoints
│   ├── serializers.py      # Profile serialization
│   └── urls.py             # Profile routes
│
├── recruitment_platform/
│   ├── settings.py         # Django settings
│   ├── urls.py             # Main URL configuration
│   ├── wsgi.py             # WSGI config
│   └── celery.py           # Celery configuration
│
├── media/                  # User-uploaded files
│   ├── applications/
│   │   ├── resumes/
│   │   └── letters/
│   └── profiles/
│       └── pictures/
│
├── manage.py               # Django management
├── requirements.txt        # Python dependencies
└── .env                    # Environment variables
```

### Frontend File Structure

```
Application-analyzer/
│
├── src/
│   ├── api/
│   │   ├── axios.ts        # HTTP client config
│   │   └── services.ts     # API functions
│   │
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── features/           # Feature modules
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── tsconfig.json           # TypeScript config
```

---

## 🚀 Environment Variables

### Backend (.env)

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/recruitment_db

# Email (for OTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

---

## 📊 Data Flow Examples

### Creating a Job Application

```
1. Job Seeker uploads resume
   ↓
2. Frontend: Creates FormData with file
   ↓
3. POST /access/applications/
   - job: 123
   - resume: File
   - cover_letter: File (optional)
   ↓
4. Backend validates:
   - File size < 5MB
   - File type: PDF/DOC/DOCX
   - Job exists
   - Not duplicate application
   ↓
5. Saves to database + file system
   ↓
6. Returns application object
   ↓
7. Frontend shows success message
```

### Recruiter Dashboard Statistics

```
1. Recruiter loads dashboard
   ↓
2. GET /access/jobs/dashboard_stats/
   ↓
3. Backend queries:
   - Count of recruiter's jobs
   - Count of applications
   - Pending reviews
   - Upcoming interviews
   ↓
4. Returns aggregated data
   ↓
5. Frontend displays stats cards
```

---

## 🛠️ Development Workflow

### Backend Development

```bash
# 1. Activate virtual environment
source venv/bin/activate  # or env/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Create superuser (admin access)
python manage.py createsuperuser

# 5. Run development server
python manage.py runserver

# 6. Access Swagger docs
http://localhost:8000/swagger/
```

### Frontend Development

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Access application
http://localhost:5173
```

---

This document provides a comprehensive overview of the system architecture. For AI/ML integration specifics, see the AI Integration Guide document.
