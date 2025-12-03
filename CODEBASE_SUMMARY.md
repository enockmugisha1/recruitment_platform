# 🎓 Recruitment Platform - Codebase Deep Dive

## 📂 File-by-File Breakdown

---

## 🔐 **users/** App (Authentication & User Management)

### `models.py`
**Purpose**: Define custom user model with role-based authentication

**Key Components**:
1. **MyUserManager** (Custom User Manager)
   - `create_user()`: Creates regular users with email & role
   - `create_superuser()`: Creates admin users
   - Handles password hashing and validation

2. **MyUser** (Custom User Model - extends AbstractUser)
   - Fields:
     - `email`: Unique, used for login (USERNAME_FIELD)
     - `username`: Not unique (differs from default Django)
     - `role`: Choice field (job_seeker/recruiter)
     - Inherits: password, first_name, last_name, is_active, etc.
   - Uses email-based authentication instead of username

**Why Custom User?**
- Default Django User uses username for login
- This project uses email for login
- Role-based access (job_seeker vs recruiter)

---

### `serializers.py`
**Purpose**: Validate and serialize user data for API requests/responses

**Key Serializers**:
1. **RegisterUserSerializer**
   - Validates registration data
   - Handles password hashing
   - Creates user with specified role

2. **LoginUserSerializer**
   - Validates email/password
   - Returns JWT tokens on success

3. **LogoutUserSerializer**
   - Blacklists refresh token on logout

4. **UpdateUserSerializer**
   - Allows updating user details (name, etc.)

**Validation Rules**:
- Email must be unique
- Password must meet Django's validation rules
- Role must be either 'job_seeker' or 'recruiter'

---

### `views.py`
**Purpose**: Handle HTTP requests for authentication

**Key Views**:
1. **RegisterUserView** (POST `/auth/register/`)
   - Creates new user account
   - Returns success message
   - No authentication required

2. **LoginUserView** (POST `/auth/login/`)
   - Validates credentials
   - Generates JWT access & refresh tokens
   - Returns tokens to client

3. **LogoutUserView** (POST `/auth/logout/`)
   - Requires authentication
   - Blacklists refresh token
   - Prevents token reuse

4. **UpdateUserView** (PUT/PATCH `/auth/update/`)
   - Updates user information
   - Requires authentication
   - Users can only update their own data

**View Pattern**: APIView (function-based approach)
- Explicit control over HTTP methods
- Swagger documentation with @swagger_auto_schema
- Clear error handling

---

### `urls.py`
**URL Patterns**:
```python
/auth/register/    → RegisterUserView
/auth/login/       → LoginUserView
/auth/logout/      → LogoutUserView
/auth/update/      → UpdateUserView
/auth/token/refresh/ → JWT TokenRefreshView
```

---

## 👤 **profiles/** App (User Profiles)

### `models.py`
**Purpose**: Store detailed user profile information

**Models**:

1. **JobSeekerProfile**
   - **Relationship**: One-to-One with User (user.job_seeker_profile)
   - **Fields**:
     - Personal: location, nationality, bio, phone, gender
     - Professional: education, institution_or_company, years_of_experience
     - Online: website, picture
     - Timestamps: created_at, updated_at
   - **File Upload**: picture → media/profile_pictures/

2. **RecruiterProfile**
   - **Relationship**: One-to-One with User (user.recruiter_profile)
   - **Fields**:
     - Company: company_name, company_website, company_description
     - Branding: company_logo
     - Timestamps: created_at, updated_at
   - **File Upload**: company_logo → media/company_logos/

**Design Pattern**: One-to-One relationship
- Each user has ONE profile
- Profile type depends on user role
- Job Seekers get JobSeekerProfile
- Recruiters get RecruiterProfile

---

### `serializers.py`
**Purpose**: Convert profile models to/from JSON

**Key Serializers**:
1. **JobSeekerProfileSerializer**
   - Handles all JobSeekerProfile fields
   - Validates and processes image uploads
   - Read-only fields: user, created_at, updated_at

2. **RecruiterProfileSerializer**
   - Handles all RecruiterProfile fields
   - Manages company logo uploads
   - Read-only fields: user, created_at, updated_at

**Validation**:
- Required fields must be provided
- Image files validated (format, size)
- URL fields must be valid URLs

---

### `views.py`
**Purpose**: Handle profile CRUD operations

**Key Views**:
1. **JobSeekerProfileView** (GET/PUT/PATCH `/profile/job-seeker/`)
   - Retrieves authenticated user's profile
   - Updates profile information
   - Permission: Only job seekers can access

2. **RecruiterProfileView** (GET/PUT/PATCH `/profile/recruiter/`)
   - Retrieves authenticated user's profile
   - Updates company information
   - Permission: Only recruiters can access

**View Pattern**: APIView with generics.RetrieveUpdateAPIView
- Automatic GET/PUT/PATCH handling
- Built-in validation
- Permission checking

---

### `permissions.py`
**Custom Permissions**:
1. **IsJobSeeker**: Checks if user.role == 'job_seeker'
2. **IsRecruiter**: Checks if user.role == 'recruiter'

**Usage**: Applied to views to restrict access by role

---

## 💼 **applications/** App (Jobs & Applications)

### `models.py`
**Purpose**: Manage job postings and applications

**Models**:

1. **Job**
   - **Relationship**: Foreign Key to RecruiterProfile (many jobs per recruiter)
   - **Fields**:
     - Basic: title, description, requirements, location
     - Details: job_type (choices), salary_range, deadline
     - Timestamps: created_at, updated_at
   - **Job Types**: full_time, part_time, contract, internship

2. **JobSeekerApplication**
   - **Relationships**:
     - Foreign Key to Job (many applications per job)
     - Foreign Key to JobSeekerProfile (many applications per seeker)
   - **Fields**:
     - Files: resume (required), cover_letter (optional)
     - Status: submitted, under_review, shortlisted, rejected, accepted
     - Timestamp: applied_at
   - **Constraints**: 
     - unique_together = ('job', 'applicant') - prevents duplicate applications
   - **File Uploads**:
     - resume → media/applications/resumes/
     - cover_letter → media/applications/letters/

**Business Logic**:
- One recruiter can post many jobs
- One job can have many applications
- One job seeker can apply to many jobs
- But: One job seeker can only apply ONCE to each job (unique_together)

---

### `serializers.py`
**Purpose**: Validate and serialize job and application data

**Key Serializers**:
1. **JobSerializer**
   - Validates job posting data
   - Read-only: id, recruiter, created_at, updated_at
   - Validates deadline is in future
   - Includes recruiter information in responses

2. **JobSeekerApplicationSerializer**
   - Handles application submission
   - Validates file uploads (resume required)
   - Read-only: id, applicant, applied_at, status
   - Prevents duplicate applications

**Nested Serializers**:
- Job includes recruiter details
- Application includes job and applicant details

---

### `views.py`
**Purpose**: Handle job and application operations

**Key Views**:

1. **JobViewSet** (ModelViewSet - full CRUD)
   - **Endpoints**:
     - GET `/access/jobs/` - List all jobs
     - POST `/access/jobs/` - Create job (recruiter only)
     - GET `/access/jobs/{id}/` - Get single job
     - PUT/PATCH `/access/jobs/{id}/` - Update job (owner only)
     - DELETE `/access/jobs/{id}/` - Delete job (owner only)
   
   - **Features**:
     - Automatic recruiter assignment on create
     - Search & filter (by keyword, location, type)
     - Ordering (by date, title, etc.)
     - Pagination
   
   - **Permissions**:
     - List/Retrieve: Anyone (authenticated)
     - Create: Recruiters only
     - Update/Delete: Job owner only

2. **JobSeekerApplicationViewSet** (ModelViewSet)
   - **Endpoints**:
     - GET `/access/my-applications/` - List my applications (job seeker)
     - POST `/access/jobs/{id}/apply/` - Apply to job (job seeker)
     - GET `/access/jobs/{id}/applications/` - View applications (recruiter)
     - PATCH `/access/applications/{id}/status/` - Update status (recruiter)
   
   - **Features**:
     - Automatic applicant assignment
     - File upload handling (resume, cover letter)
     - Status tracking and updates
     - Application filtering by job
   
   - **Permissions**:
     - Apply: Job seekers only
     - View applications: Job owner (recruiter) only
     - Update status: Job owner only

**View Pattern**: ViewSet (REST-based)
- Full CRUD operations
- Built-in routing
- Query parameter filtering
- Swagger documentation

---

### `permissions.py`
**Custom Permissions**:
1. **IsJobPoster**: Only recruiters can create/edit jobs
2. **IsJobApplicant**: Only job seekers can apply
3. **IsJobOwner**: Only job creator can manage their jobs

---

## ⚙️ **recruitment_platform/** (Project Settings)

### `settings.py`
**Key Configurations**:

1. **Apps**:
   - Django core apps (admin, auth, contenttypes, sessions, messages, staticfiles)
   - Custom apps: users, profiles, applications
   - Third-party: corsheaders, rest_framework, rest_framework_simplejwt, drf_yasg

2. **Middleware**:
   - Security, sessions, CORS
   - Authentication, messages
   - WhiteNoise (static file serving)

3. **Database**:
   - SQLite (db.sqlite3) for development
   - Easy to switch to PostgreSQL for production

4. **Authentication**:
   - Custom user model: 'users.MyUser'
   - JWT authentication via rest_framework_simplejwt
   - Token lifetimes: 30 min (access), 1 day (refresh)
   - Token rotation & blacklisting enabled

5. **Static & Media Files**:
   - Static: mystaticfiles/ (source), productionfiles/ (collected)
   - Media: media/ (uploaded files)
   - WhiteNoise serves static files efficiently

6. **CORS**:
   - Allowed origins: localhost:5173, localhost:5174, Netlify
   - Enables cross-origin API requests from frontend

7. **API Documentation**:
   - Swagger UI settings
   - Bearer token authentication
   - No session authentication

---

### `urls.py`
**Main URL Configuration**:
```python
/admin/          → Django Admin Panel
/auth/           → users.urls (authentication)
/profile/        → profiles.urls (user profiles)
/access/         → applications.urls (jobs & applications)
/                → Swagger UI (API docs)
/redoc/          → ReDoc (alternative docs)
/swagger.json    → OpenAPI schema
```

**Swagger Setup**:
- Interactive API documentation
- Try-it-out functionality
- Bearer token authentication UI
- Auto-generated from serializers and views

---

## 🔄 Request/Response Flow

### Example: Job Seeker Applies to Job

```
1. USER ACTION
   └─> POST /access/jobs/1/apply/
       Headers: Authorization: Bearer <token>
       Body: resume=file, cover_letter=file

2. DJANGO MIDDLEWARE
   ├─> SecurityMiddleware (HTTPS, headers)
   ├─> SessionMiddleware (session handling)
   ├─> CorsMiddleware (check CORS)
   ├─> AuthenticationMiddleware (JWT validation)
   └─> Request passed to view

3. URL ROUTING (urls.py)
   └─> /access/ → applications.urls
       └─> /jobs/{id}/apply/ → JobSeekerApplicationViewSet.apply()

4. VIEW (applications/views.py)
   ├─> Check permissions (IsJobApplicant)
   ├─> Get authenticated user
   ├─> Get job by ID
   └─> Pass data to serializer

5. SERIALIZER (applications/serializers.py)
   ├─> Validate resume file
   ├─> Validate cover_letter (optional)
   ├─> Check for duplicate application
   └─> If valid, save to database

6. MODEL (applications/models.py)
   ├─> Create JobSeekerApplication instance
   ├─> Save files to media/applications/
   ├─> Set status='submitted'
   └─> Save to database

7. RESPONSE
   ├─> Serializer returns application data
   ├─> View returns HTTP 201 Created
   └─> JSON response sent to client
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - Stateless authentication
   - Short-lived access tokens (30 min)
   - Refresh tokens with blacklisting
   - No session cookies needed

2. **Password Security**
   - Django password hashing (PBKDF2)
   - Password validation rules
   - No plain text storage

3. **Permission System**
   - Role-based access (job_seeker vs recruiter)
   - Object-level permissions (own data only)
   - Custom permission classes

4. **CORS Protection**
   - Whitelisted origins only
   - Prevents unauthorized cross-origin requests

5. **File Upload Security**
   - File type validation
   - Size limits (via Django settings)
   - Isolated media directory

6. **Database Security**
   - ORM prevents SQL injection
   - Parameterized queries
   - Model-level validation

---

## 🎯 Key Design Patterns

1. **Model-View-Serializer (MVS)**
   - Models: Data structure
   - Serializers: Data validation & transformation
   - Views: Business logic & HTTP handling

2. **Role-Based Access Control (RBAC)**
   - User roles determine permissions
   - Custom permission classes
   - Enforced at view level

3. **RESTful API Design**
   - Resource-based URLs (/jobs/, /applications/)
   - HTTP methods (GET, POST, PUT, DELETE)
   - Stateless requests

4. **One-to-One & Foreign Key Relationships**
   - User ↔ Profile (one-to-one)
   - Recruiter → Jobs (one-to-many)
   - Job ↔ Applications (many-to-many via through model)

5. **File Upload Handling**
   - Separate directories per file type
   - Unique filenames
   - Served via media URL

---

## 💡 Code Quality Features

1. **Swagger Documentation**
   - Every endpoint documented
   - Request/response schemas
   - Try-it-out functionality

2. **Error Handling**
   - Validation errors (400)
   - Authentication errors (401)
   - Permission errors (403)
   - Not found errors (404)
   - Server errors (500)

3. **Code Organization**
   - Separation of concerns
   - Reusable serializers
   - Custom permissions
   - Clean URL routing

4. **Django Best Practices**
   - Custom user model
   - Migrations for schema changes
   - Admin panel integration
   - Environment-based settings (DEBUG, SECRET_KEY)

---

## 🚀 Deployment Considerations

**Current Setup (Development)**:
- DEBUG = True
- SQLite database
- Allowed hosts = "*"
- Secret key in code

**Production Checklist**:
- [ ] Set DEBUG = False
- [ ] Use PostgreSQL
- [ ] Restrict ALLOWED_HOSTS
- [ ] Move SECRET_KEY to environment variable
- [ ] Set up HTTPS
- [ ] Configure static/media file serving (S3, CDN)
- [ ] Set up logging
- [ ] Enable database backups
- [ ] Configure email backend
- [ ] Set up monitoring (Sentry, etc.)

---

## 📊 Database Schema Visualization

```
┌─────────────┐
│   MyUser    │
├─────────────┤
│ id (PK)     │
│ email       │◄───────────────────┐
│ password    │                    │
│ role        │                    │
│ first_name  │                    │
│ last_name   │                    │
└─────────────┘                    │
       │                           │
       │ (one-to-one)              │
       │                           │
       ├──────────────┬────────────┘
       │              │
       ▼              ▼
┌────────────────┐  ┌────────────────┐
│JobSeekerProfile│  │RecruiterProfile│
├────────────────┤  ├────────────────┤
│ id (PK)        │  │ id (PK)        │
│ user (FK)      │  │ user (FK)      │
│ location       │  │ company_name   │
│ bio            │  │ company_logo   │
│ education      │  │ description    │
│ experience     │  └────────────────┘
│ resume         │          │
│ picture        │          │ (one-to-many)
└────────────────┘          │
       │                    ▼
       │              ┌──────────┐
       │              │   Job    │
       │              ├──────────┤
       │              │ id (PK)  │
       │              │ recruiter│
       │              │ title    │
       │              │ location │
       │              │ job_type │
       │              │ deadline │
       │              └──────────┘
       │                    │
       │                    │ (many-to-many via)
       │                    │
       └───────────┬────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │JobSeekerApplication  │
        ├──────────────────────┤
        │ id (PK)              │
        │ job (FK)             │
        │ applicant (FK)       │
        │ resume               │
        │ cover_letter         │
        │ status               │
        │ applied_at           │
        └──────────────────────┘
        UNIQUE(job, applicant)
```

---

## 🎓 Learning Resources Within Code

**Well-Commented Areas**:
- users/views.py: Authentication flow
- profiles/models.py: One-to-one relationships
- applications/models.py: Many-to-many through model
- settings.py: Django configuration

**Good Examples Of**:
- Custom user models (users/models.py)
- JWT authentication (users/views.py)
- File uploads (profiles/models.py, applications/models.py)
- Custom permissions (*/permissions.py)
- Swagger documentation (@swagger_auto_schema decorators)
- ViewSets vs APIViews (applications/views.py vs users/views.py)

---

This codebase demonstrates a well-structured Django REST API with modern authentication, role-based access control, and comprehensive API documentation.
