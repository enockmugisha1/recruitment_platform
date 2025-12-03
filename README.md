# 🚀 TGA Recruitment Platform - Enterprise Edition

A robust, production-ready recruitment/job portal backend built with Django and Django REST Framework (DRF). This platform allows job seekers and recruiters to interact — from creating profiles and posting jobs to applying and managing applications. The project features role-based authentication using JWT, enterprise-grade security, and background task processing.

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication (Login, Logout, Register)
- **OTP-based email verification** with SHA-256 hashed storage
- **Secure password reset** with OTP
- **Rate limiting** and account locking (5 failed attempts = 30-min lock)
- **Input validation & sanitization** (XSS prevention)
- **Comprehensive security logging**

### 👤 User Profiles
- **Job Seekers**: Name, bio, education, experience, resume upload
- **Recruiters**: Company info, logo, website
- Role-based user accounts (Job Seeker, Recruiter, Admin)

### 💼 Job Management (Recruiters)
- Create, edit, and delete job listings
- Fields: title, description, requirements, location, type, salary, deadline
- View applicants and their statuses
- Track applications

### 🔍 Job Browsing & Applications (Job Seekers)
- Search and filter jobs by location, type, salary, keywords
- Apply to jobs with resume and cover letter
- Track application status
- Prevent duplicate applications

### 📬 Background Tasks (Celery)
- **Async email sending** (OTP, welcome emails)
- **Automatic cleanup** of expired OTPs (hourly)
- **Account unlocking** (every 5 minutes)
- **Scheduled maintenance** tasks

### 🛠️ Admin Panel
- Enhanced user management with filters and bulk actions
- OTP code monitoring (read-only for security)
- Color-coded status indicators
- Full job and application management

---

## 🧱 Tech Stack

| Layer | Tools |
|-------|-------|
| Backend | Django 5.2.1, Django REST Framework 3.16.0 |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Cache | Redis (optional, for production) |
| Background Tasks | Celery + Redis + django-celery-beat |
| API Docs | drf-yasg (Swagger/OpenAPI) |
| Security | Custom throttling, rate limiting, input validation |
| Logging | Structured logging with separate security logs |

---

## 🚀 Quick Start

### Option 1: One-Command Start (Easiest)
```bash
./quick_start.sh
```

This automatically:
- Sets up virtual environment
- Installs dependencies
- Runs migrations
- Creates logs directory
- Starts the server

### Option 2: Manual Setup
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Setup environment
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver 0.0.0.0:8000
```

---

## 📖 Access Points

After starting the server:

- 🌐 **Swagger API Docs**: http://localhost:8000/
- 📚 **ReDoc**: http://localhost:8000/redoc/
- 👨‍💼 **Admin Panel**: http://localhost:8000/admin/

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[HOW_TO_RUN.md](HOW_TO_RUN.md)** | 🎯 **START HERE** - Quick guide to run the application |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Comprehensive setup with PostgreSQL, Redis, Celery |
| **[IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)** | All security & performance improvements |
| **[API_ENDPOINTS.md](API_ENDPOINTS.md)** | Complete API endpoint documentation |
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | Architecture and project structure |

---

## 🆕 What's New in Version 2.0?

### Security Enhancements 🔐
- ✅ OTP system with hashed storage
- ✅ Rate limiting on authentication endpoints
- ✅ Account locking after failed login attempts
- ✅ Input validation and XSS prevention
- ✅ Comprehensive security logging

### Performance Optimizations ⚡
- ✅ Database indexing
- ✅ Redis caching support
- ✅ Celery background tasks
- ✅ API pagination

### Features 🚀
- ✅ Email verification with OTP
- ✅ Password reset with OTP
- ✅ Automated cleanup tasks
- ✅ Enhanced admin interface
- ✅ PostgreSQL support

---

## 🧪 Quick API Test

### Register a User
```bash
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "role": "job_seeker",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Request OTP (Email Verification)
```bash
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "email_verification",
    "debug": true
  }'
```

---

## 🔧 Available Scripts

| Script | Purpose |
|--------|---------|
| `./quick_start.sh` | Complete setup and start server |
| `./start_server.sh` | Start Django server only |
| `./start_celery.sh` | Start Celery worker & beat |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :8000
kill -9 <PID>
```

### Redis Connection Failed
```bash
sudo systemctl start redis-server
redis-cli ping  # Should return: PONG
```

### View Logs
```bash
tail -f logs/recruitment.log
tail -f logs/security.log
```

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
                            └─── One-Many ──→ Job
                                                   │
                                                   └─── One-to-Many ──→ JobSeekerApplication
```

---

## 📊 Project Structure

```
recruitment_platform/
├── users/              # User authentication & management
├── profiles/           # Job Seeker & Recruiter profiles
├── applications/       # Jobs & Applications management
├── recruitment_platform/  # Main project settings
├── logs/              # Application & security logs
├── media/             # Uploaded files
├── templates/         # HTML templates
├── *.sh               # Startup scripts
└── *.md               # Documentation files
```

---

## 🌐 Production Deployment

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for:
- PostgreSQL setup
- Redis configuration
- Celery worker setup
- Email configuration
- Security settings
- Environment variables

---

## 📝 Version History

- **v2.0.0** (2025-11-12) - Enterprise security & performance improvements
- **v1.0.0** (2024) - Initial release

---

## 👨‍💻 Development

```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Run Celery (separate terminal)
celery -A recruitment_platform worker -l info
```

---

## 📞 Support

- 📖 Check documentation files (*.md)
- 📊 View logs: `logs/recruitment.log` and `logs/security.log`
- 🐛 Enable DEBUG mode in .env for detailed errors

---

## ⚡ Quick Commands

```bash
# Start everything (development)
./quick_start.sh

# Start with background tasks (production)
./quick_start.sh          # Terminal 1
./start_celery.sh         # Terminal 2 (choose option 3)

# View logs in real-time
tail -f logs/*.log
```

---

**🎯 Ready to start? Run: `./quick_start.sh`**

---

**Last Updated:** 2025-11-12  
**Version:** 2.0.0  
**License:** MIT