# Local Development Guide

Complete guide for running the Recruitment Platform locally with PostgreSQL.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## Prerequisites

### Required Software
- **Python 3.8+** - Backend framework
- **Node.js 16+** - Frontend build tool
- **PostgreSQL 12+** - Database
- **Redis** - Cache and message broker
- **Git** - Version control

### Check Installations
```bash
python --version
node --version
psql --version
redis-cli --version
```

---

## Quick Start

For a quick setup, follow these steps:

### 1. Set Up Database
```bash
./setup_local_db.sh
```

This script will:
- Create PostgreSQL database and user
- Configure permissions
- Run Django migrations
- Test database connectivity

### 2. Create Superuser
```bash
# Activate virtual environment
source venv/bin/activate  # or: source env/bin/activate

# Create admin user
python manage.py createsuperuser
```

### 3. Start All Services
```bash
./start_dev.sh
```

This will start:
- PostgreSQL (if not running)
- Redis (if not running)
- Django development server (port 8000)
- Celery worker
- Celery beat scheduler

### 4. Start Frontend (in a new terminal)
```bash
cd Application-analyzer
npm install  # First time only
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Detailed Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd /home/enock/recruitment_platform

# Create and activate virtual environment (if not exists)
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd Application-analyzer
npm install
cd ..
```

### Step 2: Environment Configuration

The `.env` file is already configured for local development:

```env
# Database
USE_POSTGRESQL=True
DB_NAME=recruitment_db
DB_USER=recruitment_user
DB_PASSWORD=kingofkings
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0

# Email (Console backend for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Step 3: Database Setup

#### Option A: Automated Setup (Recommended)
```bash
./setup_local_db.sh
```

#### Option B: Manual Setup
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE USER recruitment_user WITH PASSWORD 'kingofkings';
CREATE DATABASE recruitment_db OWNER recruitment_user;
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;
\q

# Run migrations
python manage.py migrate
```

### Step 4: Create Admin User
```bash
python manage.py createsuperuser
```

You'll be prompted for:
- Email (use as username)
- Password
- First name (optional)
- Last name (optional)

---

## Running the Application

### Option 1: Automated Startup (Recommended)
```bash
./start_dev.sh
```

### Option 2: Manual Startup

#### Terminal 1: Django Backend
```bash
source venv/bin/activate
python manage.py runserver
```

#### Terminal 2: Celery Worker
```bash
source venv/bin/activate
celery -A recruitment_platform worker -l info
```

#### Terminal 3: Celery Beat
```bash
source venv/bin/activate
celery -A recruitment_platform beat -l info
```

#### Terminal 4: Frontend
```bash
cd Application-analyzer
npm run dev
```

---

## Development Workflow

### Making Changes

#### Backend Changes
1. Edit Python files in relevant apps (`users/`, `profiles/`, `applications/`)
2. If models changed, create and run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. Django auto-reloads on file changes

#### Frontend Changes
1. Edit React components in `Application-analyzer/src/`
2. Vite auto-reloads on file changes

### Database Management

We provide a comprehensive database management tool:

```bash
# Check database status
./db_management.sh status

# Create backup
./db_management.sh backup

# Restore from backup
./db_management.sh restore /path/to/backup.sql.gz

# Reset database (delete all data)
./db_management.sh reset

# Run migrations
./db_management.sh migrate

# Open PostgreSQL shell
./db_management.sh shell
```

### Testing API Endpoints

#### Swagger UI
Access interactive API documentation:
```
http://localhost:8000/swagger/
```

#### Django Admin
Access admin panel:
```
http://localhost:8000/admin/
```

#### Manual Testing with curl
```bash
# Health check
curl http://localhost:8000/api/health/

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

---

## Troubleshooting

### Database Connection Issues

**Error: "connection refused"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

**Error: "password authentication failed"**
```bash
# Check .env file has correct credentials
cat .env | grep DB_

# Test connection manually
PGPASSWORD=kingofkings psql -h localhost -U recruitment_user -d recruitment_db
```

### Redis Connection Issues

**Error: "Error connecting to Redis"**
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Migration Issues

**Error: "No migrations to apply"**
```bash
# Create migrations
python manage.py makemigrations

# Show migration status
python manage.py showmigrations
```

**Error: "Conflicting migrations"**
```bash
# Reset migrations (CAUTION: Development only)
python manage.py migrate --fake
python manage.py migrate
```

### Port Already in Use

**Error: "Address already in use"**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
python manage.py runserver 8001
```

### Frontend Build Issues

**Error: "Module not found"**
```bash
cd Application-analyzer
rm -rf node_modules package-lock.json
npm install
```

### Email/OTP Not Working

In development, emails are printed to console:
```bash
# Check Django console output
tail -f logs/django.log
```

---

## Useful Commands

### Django Commands
```bash
# Create superuser
python manage.py createsuperuser

# Interactive Python shell
python manage.py shell

# Show all URLs
python manage.py show_urls

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check

# Run tests
python manage.py test
```

### Database Commands
```bash
# View database size
./db_management.sh status

# Backup database
./db_management.sh backup

# Open database shell
./db_management.sh shell
```

### Service Management
```bash
# PostgreSQL
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql

# Redis
sudo systemctl start redis-server
sudo systemctl stop redis-server
sudo systemctl restart redis-server
sudo systemctl status redis-server
```

### Logs
```bash
# Django logs
tail -f logs/django.log

# Celery logs
tail -f logs/celery.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## Architecture Overview

### Backend Structure
```
recruitment_platform/
├── users/              # User authentication
├── profiles/           # User profiles
├── applications/       # Job applications
├── recruitment_platform/  # Project settings
└── manage.py
```

### Frontend Structure
```
Application-analyzer/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── layouts/       # Layout components
│   └── services/      # API services
└── package.json
```

### Database Schema
- **users_myuser**: Custom user model
- **profiles_profile**: User profiles
- **applications_jobposting**: Job postings
- **applications_application**: Job applications
- **applications_interview**: Interview schedules

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `True` |
| `SECRET_KEY` | Django secret key | Generated |
| `USE_POSTGRESQL` | Use PostgreSQL instead of SQLite | `True` |
| `DB_NAME` | Database name | `recruitment_db` |
| `DB_USER` | Database user | `recruitment_user` |
| `DB_PASSWORD` | Database password | `kingofkings` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/1` |
| `EMAIL_BACKEND` | Email backend | `console.EmailBackend` |

### Frontend (Application-analyzer/.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_ENV` | Environment | `development` |

---

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/swagger/
2. **Create Test Data**: Use admin panel to create job postings
3. **Test Frontend**: Register users and apply for jobs
4. **Set Up Email**: Configure SMTP for production
5. **Deploy**: Use `.env.production` for deployment

---

## Getting Help

- Check logs in `logs/` directory
- Review Django documentation: https://docs.djangoproject.com/
- Check existing documentation files in project root
- Contact development team

---

**Happy Coding! 🚀**
