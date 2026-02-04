# 🏗️ TGA Recruitment Platform - Complete Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [API Integration](#api-integration)
5. [Data Flow](#data-flow)
6. [Security & Authentication](#security--authentication)
7. [Development Guide](#development-guide)

---

## System Overview

The TGA Recruitment Platform is a full-stack application that connects job seekers with recruiters through an intuitive interface and robust backend system.

### Technology Stack

#### Backend
- **Framework**: Django 5.2.1
- **API Framework**: Django REST Framework 3.16.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Task Queue**: Celery + Redis
- **API Documentation**: drf-yasg (Swagger/OpenAPI)

#### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **Routing**: React Router DOM 7.1.3
- **HTTP Client**: Axios 1.10.0
- **Styling**: TailwindCSS 3.4.17
- **State Management**: Context API
- **Notifications**: React Toastify 11.0.5

---

## Backend Architecture

### 📁 Project Structure

```
recruitment_platform/
├── recruitment_platform/        # Main project configuration
│   ├── settings.py             # Django settings & configuration
│   ├── urls.py                 # Root URL configuration
│   ├── celery.py               # Celery task queue configuration
│   └── wsgi.py                 # WSGI application
│
├── users/                       # User authentication & management
│   ├── models.py               # User model, OTP model
│   ├── serializers.py          # API serializers for user data
│   ├── views.py                # Authentication endpoints
│   ├── tasks.py                # Celery tasks (email, cleanup)
│   ├── throttling.py           # Rate limiting configuration
│   ├── validators.py           # Input validation
│   └── utils.py                # Helper functions (OTP, security)
│
├── profiles/                    # User profiles
│   ├── models.py               # JobSeekerProfile, RecruiterProfile
│   ├── serializers.py          # Profile serializers
│   ├── views.py                # Profile CRUD endpoints
│   └── permissions.py          # Role-based access control
│
├── applications/                # Jobs & Applications
│   ├── models.py               # Job, JobSeekerApplication, CalendarEvent
│   ├── serializers.py          # Job & application serializers
│   ├── views.py                # Job management endpoints
│   ├── filters.py              # Job search & filtering
│   ├── email_utils.py          # Email notifications
│   └── validators.py           # Application validation
│
├── templates/                   # Email templates
├── media/                       # User-uploaded files
├── logs/                        # Application logs
└── manage.py                   # Django management script
```

### 🗄️ Database Models

#### 1. User Model (`users/models.py`)

```python
class MyUser(AbstractUser):
    """Custom user model with role-based authentication"""
    
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('recruiter', 'Recruiter')
    ]
    
    # Fields
    email = models.EmailField(unique=True)  # Primary identifier
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_email_verified = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField()
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField()
```

**Key Features**:
- Email-based authentication (no username)
- Role-based access control
- Account locking after 5 failed login attempts
- Email verification required
- IP tracking for security

#### 2. OTP Model (`users/models.py`)

```python
class OTP(models.Model):
    """One-Time Password for email verification and password reset"""
    
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    otp_hash = models.CharField(max_length=64)  # SHA-256 hashed
    purpose = models.CharField(max_length=50)   # email_verification, password_reset
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    ip_address = models.GenericIPAddressField()
```

**Key Features**:
- Hashed storage (SHA-256) for security
- 15-minute expiration
- Rate limiting (5 attempts max)
- Purpose-specific (email verification, password reset)
- Automatic cleanup via Celery

#### 3. Profile Models (`profiles/models.py`)

**Job Seeker Profile**:
```python
class JobSeekerProfile(models.Model):
    user = models.OneToOneField(MyUser, on_delete=models.CASCADE)
    bio = models.TextField()
    education = models.TextField()
    experience = models.TextField()
    skills = models.TextField()
    resume = models.FileField(upload_to='resumes/')
    phone_number = models.CharField(max_length=15)
```

**Recruiter Profile**:
```python
class RecruiterProfile(models.Model):
    user = models.OneToOneField(MyUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    company_description = models.TextField()
    website = models.URLField()
    phone_number = models.CharField(max_length=15)
    company_logo = models.ImageField(upload_to='logos/')
```

#### 4. Job Model (`applications/models.py`)

```python
class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]
    
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    salary_range = models.CharField(max_length=100)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 5. Application Model (`applications/models.py`)

```python
class JobSeekerApplication(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='applications/resumes/')
    cover_letter = models.FileField(upload_to='applications/letters/')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    applied_at = models.DateTimeField(auto_now_add=True)
```

**Unique Constraint**: Prevents duplicate applications (job + applicant)

#### 6. Calendar Event Model (`applications/models.py`)

```python
class CalendarEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('interview', 'Interview'),
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
        ('other', 'Other'),
    ]
    
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE)
    application = models.ForeignKey(JobSeekerApplication, on_delete=models.SET_NULL)
    title = models.CharField(max_length=255)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    meeting_link = models.URLField()
```

### 🔌 API Endpoints

#### Authentication Endpoints (`/auth/`)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/register/` | Register new user | No |
| POST | `/auth/login/` | Login and get JWT tokens | No |
| POST | `/auth/logout/` | Logout and blacklist token | Yes |
| PUT | `/auth/update/` | Update user information | Yes |
| POST | `/auth/otp/request/` | Request OTP code | No |
| POST | `/auth/otp/verify/` | Verify OTP code | No |
| POST | `/auth/password/reset/` | Reset password with OTP | No |
| POST | `/auth/token/refresh/` | Refresh access token | No |

#### Profile Endpoints (`/profile/`)

| Method | Endpoint | Purpose | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/profile/job-seeker/` | Get job seeker profile | Yes | Job Seeker |
| PUT | `/profile/job-seeker/` | Update job seeker profile | Yes | Job Seeker |
| GET | `/profile/recruiter/` | Get recruiter profile | Yes | Recruiter |
| PUT | `/profile/recruiter/` | Update recruiter profile | Yes | Recruiter |

#### Job Endpoints (`/access/jobs/`)

| Method | Endpoint | Purpose | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/access/jobs/` | List all jobs (with filters) | No (public) | All |
| POST | `/access/jobs/` | Create new job | Yes | Recruiter |
| GET | `/access/jobs/{id}/` | Get job details | No (public) | All |
| PUT | `/access/jobs/{id}/` | Update job | Yes | Recruiter (owner) |
| DELETE | `/access/jobs/{id}/` | Delete job | Yes | Recruiter (owner) |
| GET | `/access/jobs/{id}/applicants/` | Get job applicants | Yes | Recruiter (owner) |

**Job Filtering Parameters**:
- `search`: Search in title, description, requirements
- `job_type`: Filter by job type
- `location`: Filter by location
- `salary_min` / `salary_max`: Salary range
- `active_only`: Only show jobs before deadline
- `ordering`: Sort results (e.g., `-created_at`)
- `page`: Pagination (10 items per page)

#### Application Endpoints (`/access/applications/`)

| Method | Endpoint | Purpose | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/access/applications/` | List user's applications | Yes | Job Seeker |
| POST | `/access/applications/` | Apply to a job | Yes | Job Seeker |
| GET | `/access/applications/{id}/` | Get application details | Yes | Owner or Recruiter |
| DELETE | `/access/applications/{id}/` | Withdraw application | Yes | Job Seeker (owner) |
| PATCH | `/access/applications/{id}/status/` | Update application status | Yes | Recruiter |

#### Calendar Endpoints (`/access/calendar/`)

| Method | Endpoint | Purpose | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/access/calendar/events/` | List calendar events | Yes | Recruiter |
| POST | `/access/calendar/events/` | Create event | Yes | Recruiter |
| GET | `/access/calendar/events/{id}/` | Get event details | Yes | Recruiter |
| PUT | `/access/calendar/events/{id}/` | Update event | Yes | Recruiter (owner) |
| DELETE | `/access/calendar/events/{id}/` | Delete event | Yes | Recruiter (owner) |

### 🔒 Security Features

#### 1. Authentication & Authorization

- **JWT Tokens**: Access tokens (15 min) and refresh tokens (7 days)
- **Token Blacklisting**: Logout invalidates refresh tokens
- **Role-Based Access**: Endpoints restricted by user role
- **Email Verification**: Required before full access

#### 2. Rate Limiting

```python
# Throttling rates (per hour)
LoginThrottle: 10 requests
RegistrationThrottle: 5 requests
OTPRequestThrottle: 5 requests
OTPVerifyThrottle: 10 requests
```

#### 3. Account Security

- **Account Locking**: 5 failed login attempts = 30-minute lock
- **OTP Expiration**: 15 minutes
- **OTP Rate Limiting**: Max 5 verification attempts
- **Password Hashing**: SHA-256 for OTPs, Argon2 for passwords
- **IP Tracking**: Log IP addresses for security events

#### 4. Input Validation

- **XSS Prevention**: Input sanitization
- **File Upload Validation**: Size limits, extension checks
- **Email Format Validation**: RFC-compliant email validation
- **Password Strength**: Minimum requirements enforced

### ⚙️ Background Tasks (Celery)

#### Scheduled Tasks

```python
# Every hour: Clean expired OTPs
@periodic_task(run_every=crontab(minute=0))
def cleanup_expired_otps():
    OTP.objects.filter(expires_at__lt=timezone.now()).delete()

# Every 5 minutes: Unlock accounts
@periodic_task(run_every=crontab(minute='*/5'))
def unlock_expired_accounts():
    MyUser.objects.filter(
        account_locked_until__lt=timezone.now()
    ).update(
        account_locked_until=None,
        failed_login_attempts=0
    )
```

#### Async Tasks

```python
@shared_task
def send_otp_email(email, otp_code, purpose):
    """Send OTP via email asynchronously"""
    # Email sending logic
    
@shared_task
def send_application_notification(recruiter_email, job_title, applicant_name):
    """Notify recruiter of new application"""
    # Email sending logic
```

---

## Frontend Architecture

### 📁 Project Structure

```
Application-analyzer/
├── src/
│   ├── api/                    # API integration layer
│   │   ├── axios.ts           # Axios configuration & interceptors
│   │   ├── services.ts        # API service functions
│   │   └── utils.ts           # API utility functions
│   │
│   ├── components/            # Reusable components
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   ├── AuthLayout.tsx     # Authentication pages layout
│   │   ├── StatCard.tsx       # Statistics display card
│   │   ├── StatusBadge.tsx    # Application status badge
│   │   ├── Pagination.tsx     # Pagination component
│   │   ├── OTPDisplay.tsx     # OTP input display
│   │   └── ErrorBoundary.tsx  # Error handling boundary
│   │
│   ├── pages/                 # Page components
│   │   ├── Login.tsx          # Login page
│   │   ├── Signup.tsx         # Registration page
│   │   ├── ForgotPassword.tsx # Password reset page
│   │   ├── Home.tsx           # Recruiter dashboard
│   │   ├── JobSeekerDashboard.tsx  # Job seeker dashboard
│   │   ├── Jobs.tsx           # Job management (recruiter)
│   │   ├── BrowseJobs.tsx     # Job browsing (job seeker)
│   │   ├── JobDetail.tsx      # Job details page
│   │   ├── CreateJob.tsx      # Create/edit job form
│   │   ├── Candidates.tsx     # Candidate list (recruiter)
│   │   ├── CandidateDetail.tsx # Candidate profile view
│   │   ├── MyApplications.tsx # Job seeker applications
│   │   ├── Calendar.tsx       # Calendar/scheduling
│   │   ├── Profile.tsx        # User profile management
│   │   └── Reports.tsx        # Analytics & reports
│   │
│   ├── layouts/               # Layout components
│   │   ├── AdminLayout.tsx    # Recruiter layout wrapper
│   │   └── JobSeekerLayout.tsx # Job seeker layout wrapper
│   │
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.tsx    # Authentication state
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   │
│   ├── features/              # Feature-specific modules
│   │   ├── authentication/
│   │   ├── candidates/
│   │   └── home/
│   │
│   ├── App.tsx                # Root component & routing
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
│
├── public/                    # Static assets
├── dist/                      # Production build output
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # TailwindCSS configuration
└── tsconfig.json              # TypeScript configuration
```

### 🔧 Core Components

#### 1. Axios Configuration (`src/api/axios.ts`)

**Base Configuration**:
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptor** (Adds JWT token):
```typescript
axiosInstance.interceptors.request.use((config) => {
  // Skip token for public endpoints
  const publicEndpoints = ['/auth/register/', '/auth/login/', ...];
  
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});
```

**Response Interceptor** (Handles token refresh):
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      
      // Store new token and retry request
      localStorage.setItem('accessToken', response.data.access);
      return axiosInstance(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

#### 2. API Services (`src/api/services.ts`)

**Authentication Service**:
```typescript
export const authService = {
  register: async (userData) => {
    const response = await axios.post('/auth/register/', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axios.post('/auth/login/', credentials);
    return response.data;
  },
  
  logout: async (refreshToken) => {
    const response = await axios.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },
  
  requestOTP: async (email, purpose) => {
    const response = await axios.post('/auth/otp/request/', { email, purpose });
    return response.data;
  },
  
  verifyOTP: async (email, otp_code, purpose) => {
    const response = await axios.post('/auth/otp/verify/', { email, otp_code, purpose });
    return response.data;
  },
};
```

**Job Service**:
```typescript
export const jobService = {
  getAllJobs: async (params) => {
    const response = await axios.get('/access/jobs/', { params });
    return response.data;
  },
  
  getJob: async (jobId) => {
    const response = await axios.get(`/access/jobs/${jobId}/`);
    return response.data;
  },
  
  createJob: async (jobData) => {
    const response = await axios.post('/access/jobs/', jobData);
    return response.data;
  },
  
  updateJob: async (jobId, jobData) => {
    const response = await axios.put(`/access/jobs/${jobId}/`, jobData);
    return response.data;
  },
  
  deleteJob: async (jobId) => {
    const response = await axios.delete(`/access/jobs/${jobId}/`);
    return response.data;
  },
};
```

**Application Service**:
```typescript
export const applicationService = {
  getMyApplications: async () => {
    const response = await axios.get('/access/applications/');
    return response.data;
  },
  
  applyToJob: async (applicationData) => {
    const formData = new FormData();
    formData.append('job', applicationData.job);
    formData.append('resume', applicationData.resume);
    if (applicationData.cover_letter) {
      formData.append('cover_letter', applicationData.cover_letter);
    }
    
    const response = await axios.post('/access/applications/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  updateApplicationStatus: async (applicationId, status) => {
    const response = await axios.patch(`/access/applications/${applicationId}/status/`, { status });
    return response.data;
  },
};
```

#### 3. Authentication Context (`src/contexts/AuthContext.tsx`)

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Decode token and set user
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
    setLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    setUser(jwtDecode(response.access));
  };
  
  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authService.logout(refreshToken);
    }
    localStorage.clear();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 4. Routing (`src/App.tsx`)

```typescript
const router = createBrowserRouter(createRoutesFromElements(
  <Route errorElement={<ErrorBoundary />}>
    {/* Admin/Recruiter Routes */}
    <Route path='/' element={<AdminLayout />}>
      <Route index element={<Home />} />
      <Route path='/jobs' element={<Jobs />} />
      <Route path='/jobs/create' element={<CreateJob />} />
      <Route path='/jobs/:id' element={<JobDetail />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidates/:id" element={<CandidateDetail />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/reports" element={<Reports />} />
    </Route>
    
    {/* Job Seeker Routes */}
    <Route path='/job-seeker' element={<JobSeekerLayout />}>
      <Route index element={<JobSeekerDashboard />} />
      <Route path='jobs' element={<BrowseJobs />} />
      <Route path='jobs/:id' element={<JobDetail />} />
      <Route path='applications' element={<MyApplications />} />
      <Route path='profile' element={<Profile />} />
    </Route>
    
    {/* Authentication Routes */}
    <Route path='/login' element={<Login />} />
    <Route path='/signup' element={<Signup />} />
    <Route path='/forgot-password' element={<ForgotPassword />} />
  </Route>
));
```

### 🎨 UI Components

#### Sidebar Component
- Role-based navigation (different for recruiters and job seekers)
- Active link highlighting
- Responsive design
- Logout functionality

#### Dashboard Components
- **StatCard**: Display key metrics (total jobs, applications, etc.)
- **StatusBadge**: Color-coded application status
- **Pagination**: Navigate through paginated results
- **OTPDisplay**: OTP input with auto-focus

#### Layout Components
- **AdminLayout**: Wrapper for recruiter pages (sidebar + content)
- **JobSeekerLayout**: Wrapper for job seeker pages
- **AuthLayout**: Wrapper for login/signup pages

---

## API Integration

### Request Flow

```
Frontend Component
    ↓
API Service Function (services.ts)
    ↓
Axios Instance (axios.ts)
    ↓
[Request Interceptor] → Add JWT Token
    ↓
Backend API Endpoint
    ↓
[Response Interceptor] → Handle Token Refresh
    ↓
Return Data to Component
```

### Authentication Flow

#### Registration Flow
```
1. User submits registration form
   ↓
2. Frontend: POST /auth/register/
   ↓
3. Backend: Create user, generate OTP
   ↓
4. Backend: Return success + OTP (debug mode)
   ↓
5. Frontend: Show OTP verification page
   ↓
6. User enters OTP
   ↓
7. Frontend: POST /auth/otp/verify/
   ↓
8. Backend: Verify OTP, mark email as verified
   ↓
9. Frontend: Redirect to login
```

#### Login Flow
```
1. User submits credentials
   ↓
2. Frontend: POST /auth/login/
   ↓
3. Backend: Validate credentials
   ↓
4. Backend: Check account lock status
   ↓
5. Backend: Generate JWT tokens
   ↓
6. Frontend: Store tokens in localStorage
   ↓
7. Frontend: Decode token to get user info
   ↓
8. Frontend: Redirect to dashboard
```

#### Token Refresh Flow
```
1. API request receives 401 Unauthorized
   ↓
2. Axios interceptor catches error
   ↓
3. POST /auth/token/refresh/ with refresh token
   ↓
4. Backend: Validate refresh token
   ↓
5. Backend: Generate new access token
   ↓
6. Frontend: Store new access token
   ↓
7. Retry original request with new token
```

### File Upload Flow

```typescript
// Frontend: Prepare FormData
const formData = new FormData();
formData.append('resume', file);
formData.append('job', jobId);

// Send with multipart/form-data header
const response = await axios.post('/access/applications/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Backend: Handle file upload
class ApplyToJobView(APIView):
    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        # File automatically saved to media/applications/resumes/
        serializer.save()
```

---

## Data Flow

### Job Posting Flow (Recruiter)

```
1. Recruiter clicks "Create Job"
   ↓
2. Fills in job form (CreateJob.tsx)
   ↓
3. Form validation (frontend)
   ↓
4. POST /access/jobs/ (jobService.createJob)
   ↓
5. Backend validation (serializer)
   ↓
6. Check permissions (IsRecruiter)
   ↓
7. Create Job instance
   ↓
8. Return job data + ID
   ↓
9. Frontend: Show success toast
   ↓
10. Redirect to job list
```

### Job Application Flow (Job Seeker)

```
1. Job seeker browses jobs (BrowseJobs.tsx)
   ↓
2. Clicks on job to view details
   ↓
3. Clicks "Apply" button
   ↓
4. Upload resume + optional cover letter
   ↓
5. POST /access/applications/ (applicationService.applyToJob)
   ↓
6. Backend: Validate file size & type
   ↓
7. Backend: Check for duplicate application
   ↓
8. Backend: Save application (status: "submitted")
   ↓
9. Backend: Send email notification to recruiter (Celery)
   ↓
10. Frontend: Show success message
   ↓
11. Redirect to "My Applications"
```

### Application Status Update Flow

```
1. Recruiter views applicants
   ↓
2. Selects application to review
   ↓
3. Changes status (dropdown)
   ↓
4. PATCH /access/applications/{id}/status/
   ↓
5. Backend: Verify recruiter owns the job
   ↓
6. Backend: Update application status
   ↓
7. Backend: Send email to applicant (Celery)
   ↓
8. Frontend: Update UI with new status
```

---

## Security & Authentication

### JWT Token Management

#### Access Token
- **Lifetime**: 15 minutes
- **Purpose**: Authenticate API requests
- **Storage**: localStorage
- **Format**: `Bearer <token>` in Authorization header

#### Refresh Token
- **Lifetime**: 7 days
- **Purpose**: Get new access token
- **Storage**: localStorage
- **Blacklisting**: Invalidated on logout

### Protected Routes

```typescript
// Frontend Route Protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Backend Permission Classes
class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'recruiter'

class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'job_seeker'

class IsOwnerOrRecruiter(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Owner can always access
        if obj.applicant.user == request.user:
            return True
        # Recruiter can access if they own the job
        if request.user.role == 'recruiter':
            return obj.job.recruiter.user == request.user
        return False
```

### CORS Configuration

```python
# Backend settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative port
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
CORS_ALLOW_HEADERS = ['content-type', 'authorization']
```

---

## Development Guide

### Backend Setup

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your settings

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver 0.0.0.0:8000

# 7. (Optional) Start Celery worker
celery -A recruitment_platform worker -l info

# 8. (Optional) Start Celery beat (scheduled tasks)
celery -A recruitment_platform beat -l info
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd Application-analyzer

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Create .env file:
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 4. Start development server
npm run dev
# Server runs on http://localhost:5173

# 5. Build for production
npm run build
# Output in dist/ directory

# 6. Preview production build
npm run preview
```

### Environment Variables

#### Backend (.env)
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Production)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis (Production)
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

#### Frontend (.env)
```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Production
# VITE_API_BASE_URL=https://api.your-domain.com
```

### Testing API Endpoints

#### Using Swagger UI
1. Start backend server
2. Navigate to http://localhost:8000/
3. Explore and test endpoints interactively

#### Using curl
```bash
# Register
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker"
  }'

# Login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Get jobs (with token)
curl -X GET http://localhost:8000/access/jobs/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Common Development Tasks

#### Add New API Endpoint
```python
# 1. Add URL pattern (e.g., applications/urls.py)
path('jobs/<int:pk>/applicants/', GetJobApplicantsView.as_view(), name='job-applicants'),

# 2. Create view (applications/views.py)
class GetJobApplicantsView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk, recruiter__user=request.user)
        applications = job.applications.all()
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

# 3. Add frontend service (src/api/services.ts)
export const jobService = {
  getJobApplicants: async (jobId: number) => {
    const response = await axios.get(`/access/jobs/${jobId}/applicants/`);
    return response.data;
  },
};
```

#### Add New Frontend Page
```typescript
// 1. Create page component (src/pages/NewPage.tsx)
import React from 'react';

const NewPage: React.FC = () => {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;

// 2. Add route (src/App.tsx)
import NewPage from './pages/NewPage';

<Route path='/new-page' element={<NewPage />} />

// 3. Add navigation link (src/components/Sidebar.tsx)
<Link to="/new-page">New Page</Link>
```

---

## Production Deployment

### Backend Deployment

```bash
# 1. Set production environment variables
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# 2. Collect static files
python manage.py collectstatic --no-input

# 3. Run migrations
python manage.py migrate

# 4. Start with Gunicorn
gunicorn recruitment_platform.wsgi:application --bind 0.0.0.0:8000

# 5. Start Celery worker
celery -A recruitment_platform worker -l info

# 6. Start Celery beat
celery -A recruitment_platform beat -l info
```

### Frontend Deployment

```bash
# 1. Set production API URL
VITE_API_BASE_URL=https://api.your-domain.com

# 2. Build
npm run build

# 3. Serve static files
# Option 1: Using serve
npm run start

# Option 2: Copy dist/ to web server
cp -r dist/* /var/www/html/
```

### Deployment Platforms

#### Backend Options
- **Render**: Easy deployment with PostgreSQL
- **Heroku**: One-click deployment
- **DigitalOcean**: VPS with full control
- **AWS**: Scalable infrastructure

#### Frontend Options
- **Netlify**: Static site hosting
- **Vercel**: React-optimized hosting
- **Render**: Static site hosting
- **AWS S3 + CloudFront**: Scalable CDN

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check CORS_ALLOWED_ORIGINS in backend settings.py

#### 2. 401 Unauthorized
```
Error: Request failed with status code 401
```
**Solution**: Check if token exists and is valid, verify token not expired

#### 3. Token Refresh Loop
```
Error: Continuous refresh token requests
```
**Solution**: Check refresh token validity, ensure _retry flag works

#### 4. File Upload Fails
```
Error: File size exceeds maximum allowed size
```
**Solution**: Check MAX_UPLOAD_SIZE in settings, verify file validators

#### 5. Celery Tasks Not Running
```
Error: Tasks remain in pending state
```
**Solution**: Ensure Redis is running, check Celery worker status

### Debugging Tips

```bash
# Backend logs
tail -f logs/recruitment.log
tail -f logs/security.log

# Django shell
python manage.py shell
>>> from users.models import MyUser
>>> MyUser.objects.all()

# Frontend logs
# Check browser console (F12)

# Test API directly
curl -X GET http://localhost:8000/access/jobs/

# Check Celery tasks
celery -A recruitment_platform inspect active
```

---

## Additional Resources

### Documentation
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [TailwindCSS](https://tailwindcss.com/)

### Internal Documentation
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Detailed API documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [HOW_TO_RUN.md](HOW_TO_RUN.md) - Quick start guide

---

**Last Updated**: 2026-02-04  
**Version**: 2.0.0  
**Maintained by**: TGA Development Team
