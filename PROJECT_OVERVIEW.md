# 📋 Recruitment Platform - Complete Project Overview

## 🎯 Project Summary
A Django REST Framework-based recruitment/job portal API that connects job seekers with recruiters. The platform supports JWT authentication, role-based access, job listings, applications, and profile management.

---

## 🏗️ Architecture Overview

### **Technology Stack**
- **Backend**: Django 5.2.1, Django REST Framework 3.16.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development) - can be PostgreSQL (production)
- **API Documentation**: drf-yasg (Swagger/OpenAPI)
- **File Handling**: Pillow for images
- **CORS**: django-cors-headers
- **Static Files**: WhiteNoise

### **Project Structure**
```
recruitment_platform/
├── users/              # User authentication & management
├── profiles/           # Job Seeker & Recruiter profiles
├── applications/       # Jobs & Applications management
├── recruitment_platform/  # Main project settings
├── templates/          # HTML templates
├── media/             # Uploaded files (resumes, logos, pictures)
├── mystaticfiles/     # Static files (CSS, JS, images)
├── productionfiles/   # Collected static files
├── env/               # Virtual environment
├── db.sqlite3         # SQLite database
├── manage.py          # Django management script
└── requirements.txt   # Python dependencies
```

---

## 📦 Django Apps Overview

### 1. **users/** - User Authentication & Management
**Purpose**: Handle user registration, login, logout, and JWT token management

**Models**:
- `MyUser` (Custom User Model)
  - Fields: email (username), password, role (job_seeker/recruiter), first_name, last_name
  - Uses email as USERNAME_FIELD instead of username
  - Role-based user types

**Key Features**:
- Custom user manager (`MyUserManager`)
- Email-based authentication
- Role-based user creation (Job Seeker or Recruiter)
- JWT token authentication (access & refresh tokens)

**Endpoints**: `/auth/`
- Register, Login, Logout
- Token refresh
- Password reset

---

### 2. **profiles/** - User Profiles
**Purpose**: Manage detailed profiles for Job Seekers and Recruiters

**Models**:

**JobSeekerProfile**:
- One-to-One with User
- Fields: location, nationality, bio, education, institution_or_company, years_of_experience, phone, gender, website, picture
- Profile picture upload support

**RecruiterProfile**:
- One-to-One with User
- Fields: company_name, company_website, company_description, company_logo
- Company logo upload support

**Key Features**:
- Automatic profile creation after user registration
- Profile CRUD operations
- Image/file uploads
- Permissions: Users can only edit their own profiles

**Endpoints**: `/profile/`
- View/Edit Job Seeker profile
- View/Edit Recruiter profile

---

### 3. **applications/** - Jobs & Applications
**Purpose**: Handle job postings and job applications

**Models**:

**Job**:
- Foreign Key to RecruiterProfile
- Fields: title, description, requirements, location, job_type (full_time/part_time/contract/internship), salary_range, deadline
- Timestamps: created_at, updated_at

**JobSeekerApplication**:
- Foreign Keys to Job and JobSeekerProfile
- Fields: resume (file upload), cover_letter (optional file upload), status (submitted/under_review/shortlisted/rejected/accepted)
- Unique constraint: One application per job per applicant
- Timestamp: applied_at

**Key Features**:
- Recruiters can create, edit, delete jobs
- Job seekers can browse and apply to jobs
- Application status tracking
- Resume and cover letter uploads
- Prevent duplicate applications
- Search and filter jobs

**Endpoints**: `/access/`
- Job CRUD operations (recruiters)
- Job listing & search (job seekers)
- Application submission (job seekers)
- Application management (recruiters)

---

## 🔐 Authentication Flow

### JWT Authentication:
1. **Register**: POST `/auth/register/` with email, password, role
2. **Login**: POST `/auth/login/` - returns access & refresh tokens
3. **Access Protected Routes**: Include `Authorization: Bearer <access_token>` header
4. **Refresh Token**: POST `/auth/token/refresh/` when access token expires
5. **Logout**: POST `/auth/logout/` - blacklists refresh token

**Token Lifetimes**:
- Access Token: 30 minutes
- Refresh Token: 1 day
- Tokens rotate on refresh and old tokens are blacklisted

---

## 🔗 Data Relationships

```
User (MyUser)
  │
  ├─── One-to-One ──→ JobSeekerProfile
  │                        │
  │                        └─── One-to-Many ──→ JobSeekerApplication
  │
  └─── One-to-One ──→ RecruiterProfile
                            │
                            └─── One-to-Many ──→ Job
                                                   │
                                                   └─── One-to-Many ──→ JobSeekerApplication
```

---

## 🚀 How to Run the Application

### Method 1: Using the startup script
```bash
cd /home/enock/recruitment_platform
chmod +x start_server.sh
./start_server.sh
```

### Method 2: Manual steps
```bash
cd /home/enock/recruitment_platform

# Activate virtual environment
source env/bin/activate

# Apply migrations (if needed)
python3 manage.py migrate

# Create superuser (optional)
python3 manage.py createsuperuser

# Run server
python3 manage.py runserver 0.0.0.0:8000
```

**Access Points**:
- 📖 **Swagger API Docs**: http://localhost:8000/
- 📚 **ReDoc**: http://localhost:8000/redoc/
- 👨‍💼 **Admin Panel**: http://localhost:8000/admin/

---

## 🧪 Testing the API

### Using Swagger UI (Recommended):
1. Open http://localhost:8000/
2. Register a user via `/auth/register/`
3. Login via `/auth/login/` to get tokens
4. Click "Authorize" button (top right)
5. Enter: `Bearer <your_access_token>`
6. Test all endpoints

### Using curl:
```bash
# Register
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test123!", "role":"job_seeker", "first_name":"John", "last_name":"Doe"}'

# Login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test123!"}'

# Access protected endpoint
curl -X GET http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

## 📊 Database Management

### Create Superuser:
```bash
source env/bin/activate
python3 manage.py createsuperuser
```

### Django Shell:
```bash
python3 manage.py shell
# Interactive Python shell with Django models loaded
```

### Migrations:
```bash
# Create migrations
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate

# Show migration status
python3 manage.py showmigrations
```

---

## 🔧 Key Configuration (settings.py)

**Important Settings**:
- `SECRET_KEY`: Django secret key (change in production!)
- `DEBUG = True`: Development mode
- `ALLOWED_HOSTS = ["*"]`: Allow all hosts (restrict in production)
- `AUTH_USER_MODEL = 'users.MyUser'`: Custom user model
- Database: SQLite (db.sqlite3)
- Media files: `/media/` directory
- Static files: `/static/` directory

**CORS Configuration**:
- Allowed origins: localhost:5173, localhost:5174, and Netlify frontend
- Can be modified in `CORS_ALLOWED_ORIGINS`

---

## 📁 File Uploads

**Media Files Storage**:
- Profile pictures: `media/profile_pictures/`
- Company logos: `media/company_logos/`
- Resumes: `media/applications/resumes/`
- Cover letters: `media/applications/letters/`

**Access**: http://localhost:8000/media/<file_path>

---

## 🛡️ Permissions & Security

**Permission Classes**:
- `IsJobSeeker`: Only job seekers can access
- `IsRecruiter`: Only recruiters can access
- `IsOwner`: Users can only edit their own data

**Security Features**:
- JWT token authentication
- Token blacklisting on logout
- Password validation
- CORS protection
- Role-based access control

---

## 🐛 Common Issues & Solutions

### Port already in use:
```bash
# Find process
lsof -i :8000
# Kill process
kill -9 <PID>
```

### Migrations not applied:
```bash
python3 manage.py migrate
```

### Static files not loading:
```bash
python3 manage.py collectstatic --noinput
```

### Virtual environment not activated:
```bash
source env/bin/activate
```

---

## 📝 Development Workflow

1. **Make model changes** → Edit `models.py`
2. **Create migrations** → `python3 manage.py makemigrations`
3. **Apply migrations** → `python3 manage.py migrate`
4. **Test in shell** → `python3 manage.py shell`
5. **Update serializers** → Edit `serializers.py`
6. **Update views** → Edit `views.py`
7. **Update URLs** → Edit `urls.py`
8. **Test API** → Use Swagger UI or curl

---

## 🌐 Deployment Notes

**For Production**:
- Set `DEBUG = False`
- Change `SECRET_KEY`
- Use PostgreSQL instead of SQLite
- Configure `ALLOWED_HOSTS`
- Set up proper static/media file serving
- Use environment variables for sensitive data
- Enable HTTPS
- Configure proper CORS origins

**Current Deployment**: PythonAnywhere (as mentioned in README)

---

## 📚 Additional Resources

- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/
- **JWT Docs**: https://django-rest-framework-simplejwt.readthedocs.io/

---

## ✅ Server Status
✅ Server is currently running at: **http://localhost:8000**
✅ All migrations applied
✅ Dependencies installed
✅ Database ready
