# 🎯 HOW TO RUN - TGA Recruitment Platform

This document provides clear instructions on how to run the TGA Recruitment Platform with all improvements implemented.

---

## 🚀 Three Ways to Run the Application

### Method 1: Quick Start (Recommended for Beginners)

This is the **easiest way** to get started. Just run one command:

```bash
./quick_start.sh
```

This script will:
- ✅ Create/activate virtual environment
- ✅ Install all dependencies
- ✅ Setup database and run migrations
- ✅ Create logs directory
- ✅ Setup .env file
- ✅ Collect static files
- ✅ Start the development server

**After running, access:**
- 🌐 http://localhost:8000/ - Swagger API Documentation
- 📖 http://localhost:8000/redoc/ - ReDoc Documentation
- 👨‍💼 http://localhost:8000/admin/ - Admin Panel

---

### Method 2: Manual Step-by-Step

If you prefer to understand each step:

#### Step 1: Setup Virtual Environment
```bash
# Create virtual environment (if not exists)
python3 -m venv venv

# Activate it
source venv/bin/activate
```

#### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 3: Create Logs Directory
```bash
mkdir -p logs
touch logs/recruitment.log logs/security.log
```

#### Step 4: Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit with your settings (optional for development)
nano .env
```

#### Step 5: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Step 6: Create Superuser
```bash
python manage.py createsuperuser
# Enter email, password when prompted
```

#### Step 7: Collect Static Files
```bash
python manage.py collectstatic --noinput
```

#### Step 8: Start Server
```bash
python manage.py runserver 0.0.0.0:8000
```

---

### Method 3: Production Mode (With Background Tasks)

For the **full experience** with all features (OTP emails, scheduled cleanups, etc.):

#### Prerequisites
```bash
# Install PostgreSQL (optional but recommended)
sudo apt install postgresql postgresql-contrib

# Install Redis (required for Celery)
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
```

#### Setup Database (PostgreSQL)
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE recruitment_db;
CREATE USER recruitment_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;
\q
```

#### Update .env File
```env
USE_POSTGRESQL=True
DB_NAME=recruitment_db
DB_USER=recruitment_user
DB_PASSWORD=your_password

USE_REDIS_CACHE=True
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0
```

#### Run Application (3 Terminals)

**Terminal 1 - Django Server:**
```bash
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Celery Worker:**
```bash
source venv/bin/activate
celery -A recruitment_platform worker -l info
```

**Terminal 3 - Celery Beat:**
```bash
source venv/bin/activate
celery -A recruitment_platform beat -l info
```

**OR use the helper script:**
```bash
./start_celery.sh
# Choose option 3 to run both worker and beat
```

---

## 🧪 Testing the Improvements

### 1. Test User Registration
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

### 2. Test Login
```bash
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Test OTP System (Email Verification)
```bash
# Request OTP (debug mode returns OTP in response)
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "email_verification",
    "debug": true
  }'

# Verify OTP (use the code from response)
curl -X POST http://localhost:8000/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "YOUR_OTP_CODE",
    "purpose": "email_verification"
  }'
```

### 4. Test Password Reset
```bash
# Request password reset OTP
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "password_reset",
    "debug": true
  }'

# Reset password with OTP
curl -X POST http://localhost:8000/auth/password/reset/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "YOUR_OTP_CODE",
    "new_password": "NewSecurePass123!",
    "password_confirm": "NewSecurePass123!"
  }'
```

### 5. Test Rate Limiting
Try logging in with wrong password 5 times - account gets locked!

### 6. Test Protected Endpoints
```bash
# Replace YOUR_ACCESS_TOKEN with token from login
curl -X GET http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 View Logs

The application logs all important events:

```bash
# View application logs
tail -f logs/recruitment.log

# View security logs (login attempts, OTP requests, etc.)
tail -f logs/security.log

# View both
tail -f logs/*.log
```

---

## 🔍 What's Running in the Background?

When you run Celery, these tasks are active:

### Scheduled Tasks:
1. **cleanup_expired_otps** - Runs every hour
   - Deletes expired OTP codes

2. **cleanup_old_used_otps** - Runs daily at 2 AM
   - Deletes used OTP codes older than 7 days

3. **unlock_locked_accounts** - Runs every 5 minutes
   - Unlocks accounts after 30-minute lock period

### Async Tasks:
1. **send_otp_email** - Sends OTP codes via email
2. **send_welcome_email** - Sends welcome email to new users

---

## 🎨 Admin Panel Features

Access the admin panel at: http://localhost:8000/admin/

Login with your superuser account.

### Enhanced User Management:
- ✅ Filter by role, verification status, account lock status
- ✅ Bulk actions: Verify emails, Lock/Unlock accounts
- ✅ Color-coded status indicators
- ✅ View failed login attempts

### OTP Management:
- ✅ View all OTP codes (hashed, can't see actual codes)
- ✅ Filter by purpose, status, dates
- ✅ Delete expired OTPs
- ✅ Read-only mode (security feature)

---

## 🛑 Stopping the Application

### Stop Django Server:
```
Press Ctrl+C in the terminal
```

### Stop Celery:
```
Press Ctrl+C in both Celery terminals
```

### Stop All Services:
```bash
# Stop any running Django server
pkill -f "python manage.py runserver"

# Stop Celery workers
pkill -f "celery worker"

# Stop Celery beat
pkill -f "celery beat"
```

---

## 🐛 Common Issues

### Issue: "Port 8000 already in use"
```bash
# Find and kill the process
lsof -i :8000
kill -9 <PID>

# Or use a different port
python manage.py runserver 0.0.0.0:8080
```

### Issue: "Redis connection failed"
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Issue: "Permission denied on logs"
```bash
# Fix permissions
chmod 755 logs
chmod 644 logs/*.log
```

### Issue: "Module not found"
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt
```

---

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Comprehensive setup instructions
- **IMPROVEMENTS_SUMMARY.md** - All improvements implemented
- **API_ENDPOINTS.md** - Complete API documentation
- **PROJECT_OVERVIEW.md** - Project structure and architecture
- **HOW_TO_RUN.md** - This file!

---

## ✅ Quick Checklist

Before starting, make sure:

- [ ] Python 3.8+ is installed
- [ ] Virtual environment is created
- [ ] Dependencies are installed (`pip install -r requirements.txt`)
- [ ] Logs directory exists (`mkdir -p logs`)
- [ ] .env file is configured
- [ ] Migrations are applied (`python manage.py migrate`)
- [ ] Redis is running (for Celery features)

---

## 🎓 Next Steps

After getting the application running:

1. **Explore the API** - Use Swagger UI at http://localhost:8000/
2. **Create test users** - Register job seekers and recruiters
3. **Post jobs** - As a recruiter
4. **Apply to jobs** - As a job seeker
5. **Test OTP features** - Email verification and password reset
6. **Check the logs** - See security events
7. **Try the admin panel** - User and OTP management

---

## 💡 Tips

- **Development**: Use SQLite (default) - no setup needed
- **Testing**: Use `debug: true` in OTP requests to get codes in response
- **Production**: Use PostgreSQL and Redis for better performance
- **Monitoring**: Check logs regularly in `logs/` directory
- **Security**: Change SECRET_KEY before deploying to production

---

## 🆘 Need Help?

1. Check the logs: `tail -f logs/recruitment.log`
2. Enable DEBUG mode: Set `DEBUG=True` in .env
3. Read the documentation: See all .md files in project root
4. Check Django errors: Look at the terminal output

---

**Quick Start Command:**
```bash
./quick_start.sh
```

**That's it! You're ready to go! 🚀**

---

**Last Updated:** 2025-11-12
**Version:** 2.0.0
