# 🚀 Complete Setup & Running Guide - TGA Recruitment Platform

This guide will walk you through setting up and running the recruitment platform with all the improvements mentioned in `IMPROVEMENTS_SUMMARY.md`.

---

## 📋 Table of Contents
1. [Quick Start (Development)](#quick-start-development)
2. [Full Setup (Production-Ready)](#full-setup-production-ready)
3. [Running the Application](#running-the-application)
4. [Testing the Features](#testing-the-features)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (Development)

For a quick local development setup without external dependencies:

### Step 1: Clone & Navigate
```bash
cd /home/enock/recruitment_platform
```

### Step 2: Create Virtual Environment
```bash
# If venv doesn't exist
python3 -m venv venv

# Activate it
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create Logs Directory
```bash
mkdir -p logs
touch logs/recruitment.log logs/security.log
chmod 755 logs
```

### Step 5: Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit with basic settings (optional for dev)
nano .env
```

**Minimal .env for Development:**
```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (will use SQLite by default)
USE_POSTGRESQL=False

# Cache (will use local memory by default)
USE_REDIS_CACHE=False
```

### Step 6: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 7: Create Superuser
```bash
python manage.py createsuperuser
# Follow the prompts
```

### Step 8: Run Server
```bash
python manage.py runserver 0.0.0.0:8000
```

**Access Your Application:**
- 🌐 API Docs (Swagger): http://localhost:8000/
- 📖 ReDoc: http://localhost:8000/redoc/
- 👨‍💼 Admin Panel: http://localhost:8000/admin/

---

## 🏢 Full Setup (Production-Ready)

For a complete setup with all features (PostgreSQL, Redis, Celery):

### Prerequisites

Install required system packages:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Python dependencies
sudo apt install python3-dev libpq-dev -y
```

---

### Step 1: Database Setup (PostgreSQL)

#### Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE recruitment_db;
CREATE USER recruitment_user WITH PASSWORD 'your_strong_password';
ALTER ROLE recruitment_user SET client_encoding TO 'utf8';
ALTER ROLE recruitment_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE recruitment_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;
\q
```

#### Test Connection
```bash
psql -h localhost -U recruitment_user -d recruitment_db
# Enter password when prompted
# If successful, type \q to exit
```

---

### Step 2: Redis Setup

#### Start and Enable Redis
```bash
# Start Redis
sudo systemctl start redis-server

# Enable on boot
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

#### Secure Redis (Optional but Recommended)
```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Set a password (find and uncomment/add this line)
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
```

---

### Step 3: Environment Configuration

Edit your `.env` file with production settings:

```bash
cd /home/enock/recruitment_platform
nano .env
```

**Complete .env Configuration:**
```env
# Django Settings
SECRET_KEY=your-very-long-and-random-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database Configuration
USE_POSTGRESQL=True
DB_NAME=recruitment_db
DB_USER=recruitment_user
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
USE_REDIS_CACHE=True
REDIS_URL=redis://:your_redis_password@localhost:6379/1
CELERY_BROKER_URL=redis://:your_redis_password@localhost:6379/0

# Email Configuration (for OTP and notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=noreply@yourcompany.com

# Security Settings
OTP_EXPIRY_MINUTES=15
ACCOUNT_LOCK_DURATION_MINUTES=30
MAX_LOGIN_ATTEMPTS=5
```

**Important Notes:**
- For Gmail: Use App-Specific Password (not your regular password)
- Generate at: https://myaccount.google.com/apppasswords
- For production, consider using SendGrid or AWS SES

---

### Step 4: Install Python Dependencies

```bash
# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

---

### Step 5: Apply Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

### Step 6: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

---

### Step 7: Create Logs Directory

```bash
mkdir -p logs
touch logs/recruitment.log logs/security.log
chmod 755 logs
```

---

## 🎮 Running the Application

### Development Mode (Simple)

Just run the Django development server:

```bash
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

---

### Production Mode (With Celery)

You'll need **3 terminal windows** to run all components:

#### Terminal 1: Django Server
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

#### Terminal 2: Celery Worker
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate
celery -A recruitment_platform worker -l info
```

#### Terminal 3: Celery Beat (Scheduled Tasks)
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate
celery -A recruitment_platform beat -l info
```

---

### Using the Startup Script

Alternatively, use the provided startup script:

```bash
chmod +x start_server.sh
./start_server.sh
```

**Note:** This only starts Django. You'll still need to start Celery separately if you want background tasks.

---

### Production Deployment (Using Gunicorn)

For production, use Gunicorn instead of Django's development server:

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn recruitment_platform.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

---

## 🧪 Testing the Features

### 1. Test Basic API

Open your browser to: http://localhost:8000/

You should see the Swagger API documentation.

### 2. Test Registration

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

### 3. Test Login

```bash
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `access` token from the response.

### 4. Test OTP System

#### Request OTP
```bash
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "email_verification",
    "debug": true
  }'
```

**Note:** With `debug: true`, the OTP code is returned in the response. In production, it's only sent via email.

#### Verify OTP
```bash
curl -X POST http://localhost:8000/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456",
    "purpose": "email_verification"
  }'
```

### 5. Test Password Reset

#### Request Password Reset OTP
```bash
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "password_reset"
  }'
```

#### Reset Password
```bash
curl -X POST http://localhost:8000/auth/password/reset/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456",
    "new_password": "NewSecurePass123!",
    "password_confirm": "NewSecurePass123!"
  }'
```

### 6. Test Rate Limiting

Try logging in with wrong password 5 times:

```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"WrongPassword"}'
  echo "\nAttempt $i"
done
```

The account should be locked after 5 attempts.

### 7. Test Protected Endpoints

```bash
# Get your profile (replace TOKEN with your access token)
curl -X GET http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Check Logs

```bash
# View application logs
tail -f logs/recruitment.log

# View security logs
tail -f logs/security.log
```

---

## 🔍 Verify Background Tasks

### Check Celery is Running

In the Celery worker terminal, you should see:
```
[tasks]
  . users.tasks.cleanup_expired_otps
  . users.tasks.cleanup_old_used_otps
  . users.tasks.send_otp_email
  . users.tasks.send_welcome_email
  . users.tasks.unlock_locked_accounts
```

### Check Scheduled Tasks

In the Celery beat terminal, you should see periodic task executions:
```
Scheduler: Sending due task cleanup_expired_otps
Scheduler: Sending due task unlock_locked_accounts
```

### Monitor Redis

```bash
redis-cli
> KEYS *
> MONITOR
```

---

## 🛠️ Troubleshooting

### Issue: Port 8000 Already in Use

```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use a different port
python manage.py runserver 0.0.0.0:8080
```

### Issue: PostgreSQL Connection Failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection
psql -h localhost -U recruitment_user -d recruitment_db
```

### Issue: Redis Connection Failed

```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Test connection
redis-cli ping
```

### Issue: Celery Not Starting

```bash
# Make sure Redis is running
sudo systemctl status redis-server

# Check for syntax errors
python manage.py check

# Try running with more verbose output
celery -A recruitment_platform worker -l debug
```

### Issue: Migrations Not Applied

```bash
# Check migration status
python manage.py showmigrations

# Reset migrations (WARNING: This will delete data)
python manage.py migrate --fake users zero
python manage.py migrate users

# Or start fresh
rm db.sqlite3
python manage.py migrate
```

### Issue: Static Files Not Loading

```bash
# Collect static files
python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings
python manage.py findstatic <filename>
```

### Issue: Permission Denied on Logs

```bash
# Fix permissions
chmod 755 logs
chmod 644 logs/*.log

# Or run as correct user
sudo chown -R $USER:$USER logs
```

### Issue: Import Errors

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt --upgrade

# Check Python version (should be 3.8+)
python --version
```

---

## 📊 Monitoring & Maintenance

### View Active Users
```bash
python manage.py shell
>>> from users.models import MyUser
>>> MyUser.objects.filter(is_active=True).count()
```

### Clean Up Old OTPs Manually
```bash
python manage.py shell
>>> from users.tasks import cleanup_expired_otps, cleanup_old_used_otps
>>> cleanup_expired_otps()
>>> cleanup_old_used_otps()
```

### Unlock User Account Manually
```bash
python manage.py shell
>>> from users.models import MyUser
>>> user = MyUser.objects.get(email='user@example.com')
>>> user.unlock_account()
>>> user.save()
```

### Check Celery Queue Size
```bash
celery -A recruitment_platform inspect active
celery -A recruitment_platform inspect scheduled
celery -A recruitment_platform inspect reserved
```

---

## 🚀 Performance Tips

1. **Use PostgreSQL in production** - Much faster than SQLite
2. **Enable Redis caching** - Reduces database queries
3. **Use Gunicorn with multiple workers** - Better concurrency
4. **Set up Nginx reverse proxy** - Better static file serving
5. **Enable database connection pooling** - Reuse connections
6. **Monitor logs regularly** - Catch issues early
7. **Set up log rotation** - Prevent logs from growing too large

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a long random string
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use HTTPS (SSL certificate)
- [ ] Use strong database passwords
- [ ] Set Redis password
- [ ] Configure email properly
- [ ] Enable all security settings in `.env`
- [ ] Set up firewall (UFW)
- [ ] Regular security updates
- [ ] Backup database regularly

---

## 📞 Need Help?

- Check logs: `tail -f logs/recruitment.log`
- Check security logs: `tail -f logs/security.log`
- Django debug: Run with `DEBUG=True` temporarily
- Celery debug: Use `-l debug` flag

---

**Last Updated:** 2025-11-12
**Version:** 2.0.0
