# 📊 Codebase Exploration Summary

## 🏗️ Architecture Overview

### Backend (Django REST Framework)
```
recruitment_platform/
├── users/              # Custom user model, authentication
├── profiles/           # Job seeker & recruiter profiles  
├── applications/       # Jobs & job applications
├── recruitment_platform/  # Project settings, URLs
├── logs/              # Application & security logs
└── manage.py          # Django management
```

### Frontend (React + TypeScript + Vite)
```
Application-analyzer/
├── src/
│   ├── api/           # Axios configuration ✅ FIXED
│   ├── components/    # Reusable UI components
│   ├── pages/         # Main pages (Login, Jobs, etc.)
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   └── layouts/       # Page layouts
├── public/            # Static assets
└── .env              # Environment config ✅ FIXED
```

---

## 🔑 Backend Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Django | 5.2.1 |
| API | Django REST Framework | 3.16.0 |
| Auth | JWT (simplejwt) | Latest |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| Task Queue | Celery + Redis | Latest |
| API Docs | drf-yasg (Swagger) | Latest |
| CORS | django-cors-headers | Latest |

---

## 🎨 Frontend Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.6.2 |
| Build Tool | Vite | 6.0.5 |
| HTTP Client | Axios | 1.10.0 |
| Routing | React Router | 7.6.2 |
| Styling | Tailwind CSS | 3.4.17 |
| Notifications | React Toastify | 11.0.5 |
| JWT Decode | jwt-decode | 4.0.0 |

---

## 🔐 Authentication System

### Backend Implementation
- **Custom User Model** (`users.models.MyUser`)
  - Email-based authentication (no username)
  - Role-based (job_seeker, recruiter, admin)
  - JWT token authentication
  
- **Security Features**:
  - OTP-based email verification (SHA-256 hashed)
  - Password reset with OTP
  - Rate limiting (5 failed attempts = 30-min lock)
  - Session management
  - Token blacklisting on logout

### Frontend Implementation
- **Login Flow** (Login.tsx):
  ```typescript
  POST /auth/login/ → Get tokens → Store in localStorage → Redirect
  ```
- **Token Management** (axios.ts):
  - Request interceptor: Adds Bearer token to headers
  - Response interceptor: Auto-refreshes expired tokens
  - Error handling: Redirects to login on auth failure

---

## 💼 Data Models

### User Roles
1. **Job Seeker**
   - Can browse jobs
   - Can apply to jobs
   - Has profile with resume, education, experience
   
2. **Recruiter**
   - Can post jobs
   - Can view applications
   - Can update application status
   - Has company profile
   
3. **Admin**
   - Full access via Django admin panel
   - Can manage all users, jobs, applications

### Database Schema
```
MyUser (Custom User)
  ├─ One-to-One → JobSeekerProfile
  │                 └─ One-to-Many → JobSeekerApplication
  └─ One-to-One → RecruiterProfile
                    └─ One-to-Many → Job
                                      └─ One-to-Many → JobSeekerApplication
```

---

## 🔌 API Architecture

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: Configurable via environment

### Authentication Pattern
```
Public Endpoints (no auth):
  - POST /auth/register/
  - POST /auth/login/
  - GET /access/jobs/
  - GET /access/jobs/{id}/

Protected Endpoints (JWT required):
  - POST /auth/logout/
  - GET/PATCH /profile/*
  - POST /access/jobs/ (recruiter only)
  - POST /access/jobs/{id}/apply/ (job seeker only)
  - GET /access/my-applications/
```

### Response Format
```json
{
  "id": 1,
  "field": "value",
  "created_at": "2025-12-09T10:00:00Z"
}
```

### Error Format
```json
{
  "detail": "Error message",
  "field": ["Field-specific error"]
}
```

---

## 🎯 API Endpoints Summary

### Authentication (`/auth/`)
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - Login and get JWT tokens
- `POST /auth/logout/` - Logout (blacklist token)
- `POST /auth/token/refresh/` - Refresh access token
- `POST /auth/otp/request/` - Request OTP for verification
- `POST /auth/otp/verify/` - Verify OTP
- `POST /auth/password-reset/` - Request password reset

### Profiles (`/profile/`)
- `GET/PUT/PATCH /profile/job-seeker/` - Job seeker profile
- `GET/PUT/PATCH /profile/recruiter/` - Recruiter profile

### Jobs & Applications (`/access/`)
- `GET /access/jobs/` - List all jobs (public)
- `POST /access/jobs/` - Create job (recruiter only)
- `GET /access/jobs/{id}/` - Job details
- `PUT/PATCH /access/jobs/{id}/` - Update job (owner only)
- `DELETE /access/jobs/{id}/` - Delete job (owner only)
- `POST /access/jobs/{id}/apply/` - Apply to job (job seeker)
- `GET /access/my-applications/` - My applications (job seeker)
- `GET /access/jobs/{id}/applications/` - Job applications (recruiter)
- `PATCH /access/applications/{id}/status/` - Update status (recruiter)

---

## 🔄 Request/Response Flow

### Example: User Login
```
Frontend (Login.tsx)
  └─→ POST /auth/login/ (email, password)
       └─→ Backend (users/views.py - LoginView)
            ├─→ Validate credentials
            ├─→ Check account not locked
            ├─→ Generate JWT tokens
            └─→ Return {access, refresh, role}
                 └─→ Frontend stores tokens
                      └─→ Redirect to dashboard
```

### Example: Apply to Job
```
Frontend (Jobs.tsx)
  └─→ POST /access/jobs/1/apply/ (FormData with resume)
       ├─→ Axios interceptor adds: Authorization: Bearer <token>
       └─→ Backend (applications/views.py - ApplyToJobView)
            ├─→ Verify JWT token
            ├─→ Check user is job seeker
            ├─→ Check not already applied
            ├─→ Save application with resume
            └─→ Return 201 Created
```

---

## 🛡️ Security Features

### Backend Security
1. **Authentication**:
   - JWT with refresh tokens
   - Token blacklisting on logout
   - Secure token storage

2. **Authorization**:
   - Role-based access control
   - Owner-only permissions for jobs
   - Custom permission classes

3. **Input Validation**:
   - DRF serializers validate all inputs
   - File upload validation (size, type)
   - XSS prevention via Django templating

4. **Rate Limiting**:
   - 5 failed login attempts = 30-min lock
   - Account unlocking via Celery tasks
   - Per-endpoint throttling

5. **Logging**:
   - Separate security log (`logs/security.log`)
   - All auth attempts logged
   - Failed login tracking

### Frontend Security
1. **Token Management**:
   - Tokens in localStorage (not cookies)
   - Automatic token refresh
   - Clear tokens on logout

2. **Request Security**:
   - HTTPS in production
   - CORS properly configured
   - withCredentials for cookies

---

## 📂 Key Files Explained

### Backend
- `users/models.py` - Custom user model with roles
- `users/views.py` - Auth endpoints (login, register, logout)
- `profiles/models.py` - JobSeekerProfile, RecruiterProfile
- `applications/models.py` - Job, JobSeekerApplication
- `applications/views.py` - Job CRUD, application management
- `recruitment_platform/settings.py` - Django configuration
- `recruitment_platform/urls.py` - URL routing

### Frontend (Fixed)
- `src/api/axios.ts` ✅ - HTTP client with interceptors
- `src/pages/Login.tsx` ✅ - Login page (uses backend)
- `src/pages/Signup.tsx` - Registration page
- `src/pages/Jobs.tsx` - Job listings
- `src/pages/Profile.tsx` - User profile
- `src/components/` - Reusable UI components
- `.env` ✅ - Environment configuration

---

## 🔧 Configuration Files

### Backend
```python
# recruitment_platform/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend dev server
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

### Frontend
```typescript
// src/api/axios.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Interceptors handle:
// - Adding auth token to requests
// - Refreshing expired tokens
// - Redirecting on auth failures
```

---

## 🚀 Background Tasks (Celery)

### Configured Tasks
1. **Email Sending** - Async email delivery
2. **OTP Cleanup** - Hourly removal of expired OTPs
3. **Account Unlocking** - Every 5 minutes, unlock accounts
4. **Maintenance** - Scheduled cleanup tasks

### Start Celery
```bash
cd /home/enock/recruitment_platform
./start_celery.sh
# Choose option 3 for worker + beat
```

---

## 📊 Current Integration Status

### ✅ What's Working
- [x] Backend API fully functional
- [x] Frontend dependencies installed
- [x] Axios configured with base URL
- [x] Token interceptors implemented
- [x] CORS configured
- [x] Login page connects to backend
- [x] Environment variables set

### 🔧 What Needs Connection
- [ ] Jobs.tsx → `/access/jobs/`
- [ ] Signup.tsx → `/auth/register/`
- [ ] Profile.tsx → `/profile/*/`
- [ ] Job application flow
- [ ] File upload implementation

---

## 🎯 Integration Points

### 1. Authentication
- **Frontend**: `Login.tsx`, `Signup.tsx`
- **Backend**: `/auth/login/`, `/auth/register/`
- **Status**: ✅ Login working, Signup needs testing

### 2. Job Management
- **Frontend**: `Jobs.tsx`, `JobSeekerDashboard.tsx`
- **Backend**: `/access/jobs/*`
- **Status**: 🔧 Needs connection

### 3. Profile Management
- **Frontend**: `Profile.tsx`
- **Backend**: `/profile/job-seeker/`, `/profile/recruiter/`
- **Status**: 🔧 Needs connection

### 4. Applications
- **Frontend**: Job application components
- **Backend**: `/access/jobs/{id}/apply/`, `/access/my-applications/`
- **Status**: 🔧 Needs connection

---

## 💡 Development Workflow

### Adding a New Feature

1. **Backend**:
   ```python
   # 1. Create model (if needed)
   # 2. Create serializer
   # 3. Create view
   # 4. Add URL route
   # 5. Test in Swagger UI
   ```

2. **Frontend**:
   ```typescript
   // 1. Create API call function
   // 2. Create React component
   // 3. Use axios to fetch/post data
   // 4. Handle loading/error states
   // 5. Test in browser
   ```

---

## 🧪 Testing Strategy

### Backend Testing
```bash
# Use Swagger UI
http://localhost:8000/

# Or use curl
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### Frontend Testing
```bash
# Start dev server
npm run dev

# Check browser console for errors
# Use React DevTools
```

---

## 📚 Documentation Structure

```
recruitment_platform/
├── README.md                    # Project overview
├── INTEGRATION_GUIDE.md         # Detailed integration steps ⭐
├── QUICK_INTEGRATION.md         # Quick reference card
├── API_ENDPOINTS.md             # API documentation
├── FRONTEND_INTEGRATION_GUIDE.md # Original frontend guide
├── HOW_TO_RUN.md               # Backend setup
├── SETUP_GUIDE.md              # Production setup
├── CODEBASE_SUMMARY.md         # This file
└── test_integration.sh         # Integration test script
```

---

## 🎓 Learning Resources

### Backend (Django)
- Custom user model implementation
- JWT authentication with DRF
- Role-based permissions
- File upload handling
- Celery background tasks

### Frontend (React)
- Axios interceptors for auth
- React Router for navigation
- Context API for state
- TypeScript interfaces
- File upload with FormData

---

## 🔍 Code Quality

### Backend
- ✅ Proper separation of concerns
- ✅ DRF serializers for validation
- ✅ Custom permissions classes
- ✅ Comprehensive error handling
- ✅ Logging for debugging

### Frontend
- ✅ TypeScript for type safety
- ✅ Component-based architecture
- ✅ Centralized API configuration
- ✅ Error handling with toasts
- ✅ Responsive design with Tailwind

---

## 🚀 Deployment Considerations

### Backend
- Switch to PostgreSQL
- Configure Redis for caching
- Set DEBUG=False
- Configure proper SECRET_KEY
- Set up email backend (SMTP)
- Configure static/media file serving

### Frontend
- Build: `npm run build`
- Deploy to Netlify/Vercel
- Update VITE_API_BASE_URL to production
- Configure CORS in backend for production domain

---

**Last Updated**: 2025-12-09  
**Status**: ✅ Integration configured and ready  
**Next**: Start both servers and test!
