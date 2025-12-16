# 🚀 Render Deployment Guide - TGA Recruitment Platform

## Complete Step-by-Step Guide to Deploy on Render

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Render account (sign up at https://render.com)
- [ ] Project pushed to GitHub
- [ ] PostgreSQL database ready

---

## 🔧 Part 1: Prepare Your Project for Deployment

### Step 1: Update `requirements.txt`

Ensure all production dependencies are included:

```bash
cd /home/enock/recruitment_platform
pip freeze > requirements.txt
```

Verify it includes:
```txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.9.0
dj-database-url==2.1.0
```

If missing, add them:
```bash
pip install gunicorn dj-database-url
pip freeze > requirements.txt
```

### Step 2: Create `build.sh` Script

Create file `/home/enock/recruitment_platform/build.sh`:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser if needed (optional)
# python manage.py createsuperuser --no-input
```

Make it executable:
```bash
chmod +x build.sh
```

### Step 3: Update `settings.py` for Production

Add to `recruitment_platform/settings.py`:

```python
import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Update ALLOWED_HOSTS
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Add your Render domain
if 'RENDER' in os.environ:
    ALLOWED_HOSTS.append(os.environ.get('RENDER_EXTERNAL_HOSTNAME'))

# Database - PostgreSQL for production
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'mystaticfiles')]

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Update MIDDLEWARE - Add WhiteNoise
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# Email configuration
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@example.com')

# Celery Configuration for Render
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# Cache configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

### Step 4: Create `render.yaml` (Optional but Recommended)

Create `/home/enock/recruitment_platform/render.yaml`:

```yaml
services:
  # Web Service (Django)
  - type: web
    name: recruitment-platform
    env: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn recruitment_platform.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: recruitment-redis
          property: connectionString

  # PostgreSQL Database
  - type: pserv
    name: recruitment-db
    env: postgres
    plan: starter
    databaseName: recruitment_platform
    databaseUser: recruitment_user

  # Redis for Celery
  - type: redis
    name: recruitment-redis
    plan: starter
    maxmemoryPolicy: allkeys-lru

  # Celery Worker
  - type: worker
    name: recruitment-celery-worker
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "celery -A recruitment_platform worker -l info"
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: recruitment-redis
          property: connectionString
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment-db
          property: connectionString

  # Celery Beat (Scheduler)
  - type: worker
    name: recruitment-celery-beat
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "celery -A recruitment_platform beat -l info"
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: recruitment-redis
          property: connectionString
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment-db
          property: connectionString
```

### Step 5: Create `.gitignore`

Create/update `.gitignore`:

```
# Python
*.py[cod]
__pycache__/
*.so
*.egg
*.egg-info
dist/
build/
venv/
env/

# Django
*.log
db.sqlite3
media/
staticfiles/
productionfiles/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### Step 6: Push to GitHub

```bash
cd /home/enock/recruitment_platform
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## 🌐 Part 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. **Sign in to Render**: https://dashboard.render.com

2. **Create New Blueprint**:
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select your repository
   - Render will auto-detect `render.yaml`
   - Click "Apply"

3. **Render will automatically create**:
   - Web service (Django app)
   - PostgreSQL database
   - Redis instance
   - Celery worker
   - Celery beat scheduler

### Option B: Manual Setup

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `recruitment-db`
   - Database: `recruitment_platform`
   - User: `recruitment_user`
   - Region: Choose closest to you
   - Plan: Free or Starter
4. Click "Create Database"
5. **Save the Internal Database URL** (starts with `postgres://`)

#### Step 2: Create Redis Instance

1. Click "New +" → "Redis"
2. Configure:
   - Name: `recruitment-redis`
   - Region: Same as database
   - Plan: Free or Starter
3. Click "Create Redis"
4. **Save the Redis URL**

#### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `recruitment-platform`
   - **Environment**: `Python 3`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn recruitment_platform.wsgi:application`
   - **Plan**: Free or Starter

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"

   ```
   SECRET_KEY = [Generate random 50-char string]
   DEBUG = False
   ALLOWED_HOSTS = .render.com
   DATABASE_URL = [Paste PostgreSQL Internal URL]
   REDIS_URL = [Paste Redis URL]
   
   # Email Settings (optional)
   EMAIL_BACKEND = django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = your-email@gmail.com
   EMAIL_HOST_PASSWORD = your-app-password
   DEFAULT_FROM_EMAIL = noreply@yourapp.com
   
   # CORS (if using separate frontend)
   CORS_ALLOWED_ORIGINS = https://your-frontend.com
   
   # Other
   RENDER = True
   PYTHONUNBUFFERED = true
   ```

5. Click "Create Web Service"

#### Step 4: Create Celery Worker

1. Click "New +" → "Background Worker"
2. Connect same repository
3. Configure:
   - **Name**: `recruitment-celery-worker`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `celery -A recruitment_platform worker -l info`
4. Add same environment variables as web service
5. Click "Create Background Worker"

#### Step 5: Create Celery Beat

1. Click "New +" → "Background Worker"
2. Configure:
   - **Name**: `recruitment-celery-beat`
   - **Start Command**: `celery -A recruitment_platform beat -l info`
3. Add same environment variables
4. Click "Create Background Worker"

---

## 🔑 Part 3: Post-Deployment Setup

### Step 1: Create Superuser

1. Go to your web service dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```

### Step 2: Test Your Application

Visit your Render URL: `https://your-app-name.onrender.com`

Test endpoints:
- `/` - Swagger documentation
- `/admin/` - Admin panel
- `/auth/register/` - Registration
- `/auth/login/` - Login

### Step 3: Monitor Logs

- Click "Logs" tab in Render dashboard
- Monitor for errors
- Check all services are running

---

## 🔒 Security Checklist

- [ ] Set strong SECRET_KEY
- [ ] DEBUG = False in production
- [ ] HTTPS enabled (automatic on Render)
- [ ] ALLOWED_HOSTS configured correctly
- [ ] Database credentials secure
- [ ] CORS configured for your frontend domain
- [ ] Environment variables set
- [ ] Media files storage configured
- [ ] Rate limiting enabled

---

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# View logs
render logs -s your-service-name

# Restart service
render restart -s your-service-name
```

### Database Backups

Render automatically backs up PostgreSQL databases daily (on paid plans).

### Scaling

To handle more traffic:
1. Upgrade to paid plan
2. Enable auto-scaling
3. Increase worker processes

---

## 🐛 Common Issues & Solutions

### Issue 1: Static Files Not Loading

**Solution**:
```bash
# Run collectstatic manually
python manage.py collectstatic --no-input
```

Ensure in settings.py:
```python
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Issue 2: Database Connection Failed

**Solution**:
- Verify DATABASE_URL is correct
- Check PostgreSQL instance is running
- Ensure internal database URL is used

### Issue 3: Celery Not Processing Tasks

**Solution**:
- Verify Redis URL is correct
- Check celery worker logs
- Ensure celery beat is running

### Issue 4: CORS Errors

**Solution**:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-domain.com',
]
CORS_ALLOW_CREDENTIALS = True
```

### Issue 5: Build Failed

**Solution**:
- Check build.sh has execute permissions
- Verify all dependencies in requirements.txt
- Check Python version compatibility

---

## 📱 Connecting Frontend to Deployed Backend

Update frontend `.env`:
```env
REACT_APP_API_URL=https://your-app-name.onrender.com
```

Update CORS in Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.onrender.com',
    'http://localhost:3000',  # for development
]
```

---

## 💰 Cost Estimation

### Free Tier (Good for testing)
- Web Service: Free (sleeps after 15 min inactivity)
- PostgreSQL: Free (1GB limit)
- Redis: Free (25MB limit)
- Total: $0/month

### Starter Tier (Production-ready)
- Web Service: $7/month
- PostgreSQL: $7/month
- Redis: $7/month
- Background Workers (2): $14/month
- Total: ~$35/month

---

## 🎯 Quick Deploy Checklist

- [ ] Update requirements.txt
- [ ] Create build.sh
- [ ] Update settings.py for production
- [ ] Create render.yaml (optional)
- [ ] Push to GitHub
- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Create Redis instance
- [ ] Create web service
- [ ] Create celery workers
- [ ] Set environment variables
- [ ] Deploy and test
- [ ] Create superuser
- [ ] Monitor logs

---

## 🚀 Alternative: Quick Deploy Script

Create `deploy_to_render.sh`:

```bash
#!/bin/bash

echo "🚀 Preparing for Render Deployment..."

# Install production dependencies
pip install gunicorn dj-database-url whitenoise

# Update requirements
pip freeze > requirements.txt

# Make build script executable
chmod +x build.sh

# Git setup
git add .
git commit -m "Prepare for Render deployment"
git push origin main

echo "✅ Ready for Render!"
echo "Next steps:"
echo "1. Go to https://render.com"
echo "2. Create new Web Service"
echo "3. Connect your GitHub repo"
echo "4. Set environment variables"
echo "5. Deploy!"
```

---

## 📞 Support Resources

- Render Documentation: https://render.com/docs
- Django Deployment: https://docs.djangoproject.com/en/5.1/howto/deployment/
- Troubleshooting: Check logs in Render dashboard

---

## ✅ Deployment Complete!

Your recruitment platform is now live on Render! 🎉

Access it at: `https://your-app-name.onrender.com`

---

**Last Updated**: 2025-12-16  
**Version**: 1.0
