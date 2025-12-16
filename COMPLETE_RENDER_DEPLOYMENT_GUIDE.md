# 🚀 Complete Render Deployment Guide
## Deploy Django Backend + React Frontend on Render

This guide will walk you through deploying both your Django backend and React frontend to Render.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Part 1: Backend Deployment (Django)](#part-1-backend-deployment-django)
3. [Part 2: Frontend Deployment (React)](#part-2-frontend-deployment-react)
4. [Part 3: Connect Frontend to Backend](#part-3-connect-frontend-to-backend)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
- ✅ GitHub account
- ✅ Render account (free tier works) - [Sign up here](https://render.com)
- ✅ Your code pushed to GitHub repository
- ✅ PostgreSQL database already created on Render (you have this!)

### Database Connection String:
```
postgresql://recruitment_user:LdXRAFUjF1CcvxaXVBOtpBmQZXX3s0YN@dpg-d50t3uu3jp1c73egkasg-a.oregon-postgres.render.com/recruitment_db_1863
```

---

## Part 1: Backend Deployment (Django)

### Step 1: Prepare Your Django Project

#### 1.1 Update `requirements.txt`
Make sure your `requirements.txt` includes these packages:

```bash
cd /home/enock/recruitment_platform
pip freeze > requirements.txt
```

Ensure it has:
```
Django>=5.0
djangorestframework
django-cors-headers
psycopg2-binary
dj-database-url
gunicorn
whitenoise
python-dotenv
celery
redis
django-celery-beat
```

#### 1.2 Create `build.sh` Script
Create a build script for Render:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
```

Make it executable:
```bash
chmod +x build.sh
```

#### 1.3 Update `settings.py` for Production

Add to your `settings.py`:

```python
# At the top, add:
import dj_database_url
import os
from pathlib import Path

# Update ALLOWED_HOSTS
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Add your Render domain when deployed:
# ALLOWED_HOSTS = ['your-app.onrender.com', 'localhost', '127.0.0.1']

# CORS Settings (update with your frontend URL)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-frontend-app.onrender.com',  # Update this after frontend deployment
]

CORS_ALLOW_CREDENTIALS = True

# Static files configuration
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'productionfiles'
STATICFILES_DIRS = [BASE_DIR / 'mystaticfiles']

# Whitenoise for serving static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database configuration (already done)
database_url = os.environ.get('DATABASE_URL', '').strip()
if database_url and '[YOUR-PASSWORD]' not in database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

#### 1.4 Create `render.yaml` (Optional but Recommended)

```yaml
databases:
  - name: recruitment_db_1863
    databaseName: recruitment_db_1863
    user: recruitment_user
    region: oregon

services:
  - type: web
    name: recruitment-backend
    env: python
    region: oregon
    buildCommand: "./build.sh"
    startCommand: "gunicorn recruitment_platform.wsgi:application"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment_db_1863
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: ALLOWED_HOSTS
        value: .onrender.com
```

### Step 2: Push Code to GitHub

```bash
cd /home/enock/recruitment_platform
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 3: Deploy Backend on Render

1. **Login to Render**: Go to [https://dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `recruitment_platform` repository

3. **Configure Web Service**:
   ```
   Name: recruitment-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: (leave blank)
   Runtime: Python 3
   Build Command: ./build.sh
   Start Command: gunicorn recruitment_platform.wsgi:application
   Instance Type: Free
   ```

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   ```
   DATABASE_URL = postgresql://recruitment_user:LdXRAFUjF1CcvxaXVBOtpBmQZXX3s0YN@dpg-d50t3uu3jp1c73egkasg-a.oregon-postgres.render.com/recruitment_db_1863
   
   SECRET_KEY = your-super-secret-key-here-change-this
   
   DEBUG = False
   
   ALLOWED_HOSTS = .onrender.com,localhost
   
   PYTHON_VERSION = 3.12
   
   EMAIL_BACKEND = django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = your-email@gmail.com
   EMAIL_HOST_PASSWORD = your-app-password
   
   CORS_ALLOWED_ORIGINS = http://localhost:5173,https://your-frontend.onrender.com
   ```

5. **Create Service**: Click "Create Web Service"

6. **Wait for Deployment**: 
   - Render will build and deploy your app
   - Watch the logs for any errors
   - Should take 5-10 minutes

7. **Note Your Backend URL**: 
   - Will be something like: `https://recruitment-backend.onrender.com`

### Step 4: Test Backend

```bash
# Test API
curl https://recruitment-backend.onrender.com/access/jobs/

# Expected response: JSON with jobs list
```

---

## Part 2: Frontend Deployment (React)

### Step 1: Prepare React Frontend

#### 1.1 Update Frontend API Configuration

Navigate to frontend:
```bash
cd /home/enock/recruitment_platform/Application-analyzer
```

#### 1.2 Update API Base URL

Find your API configuration file (usually in `src/config/` or `src/utils/`):

**Create/Update `src/config/api.ts`:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     'https://recruitment-backend.onrender.com';

export default API_BASE_URL;
```

**Or in `src/utils/api.js`:**
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
                            'https://recruitment-backend.onrender.com';
```

#### 1.3 Create `.env` for Frontend

```bash
# Create .env file in frontend directory
cat > .env << 'EOF'
VITE_API_URL=https://recruitment-backend.onrender.com
EOF
```

#### 1.4 Update `package.json`

Make sure your build script is correct:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 1.5 Verify Build Works Locally

```bash
npm install
npm run build

# Check if dist folder is created
ls -la dist/
```

### Step 2: Push Frontend to GitHub

If frontend is in same repo:
```bash
cd /home/enock/recruitment_platform
git add Application-analyzer/
git commit -m "Prepare frontend for deployment"
git push origin main
```

If frontend is in separate repo:
```bash
cd /home/enock/recruitment_platform/Application-analyzer
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/recruitment-frontend.git
git push -u origin main
```

### Step 3: Deploy Frontend on Render

1. **Create New Static Site**:
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Static Site**:
   ```
   Name: recruitment-frontend
   Branch: main
   Root Directory: Application-analyzer
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables**:
   ```
   VITE_API_URL = https://recruitment-backend.onrender.com
   ```

4. **Create Static Site**: Click "Create Static Site"

5. **Wait for Deployment**: Takes 3-5 minutes

6. **Note Your Frontend URL**: 
   - Will be something like: `https://recruitment-frontend.onrender.com`

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Backend CORS Settings

1. **Go to Backend Service on Render**
2. **Navigate to Environment Variables**
3. **Update CORS_ALLOWED_ORIGINS**:
   ```
   CORS_ALLOWED_ORIGINS = https://recruitment-frontend.onrender.com,http://localhost:5173
   ```
4. **Update ALLOWED_HOSTS**:
   ```
   ALLOWED_HOSTS = recruitment-backend.onrender.com,localhost,127.0.0.1
   ```
5. **Save Changes** (this will trigger a redeploy)

### Step 2: Update Frontend API URL

1. **Go to Frontend Static Site on Render**
2. **Navigate to Environment Variables**
3. **Verify VITE_API_URL**:
   ```
   VITE_API_URL = https://recruitment-backend.onrender.com
   ```
4. **Trigger Manual Deploy** if needed

### Step 3: Test Full Application

1. **Open Frontend URL**: `https://recruitment-frontend.onrender.com`
2. **Test Features**:
   - ✅ User Registration
   - ✅ Login
   - ✅ View Jobs
   - ✅ Apply to Jobs
   - ✅ Profile Management

---

## 🎯 Quick Deployment Checklist

### Backend ✅
- [ ] `requirements.txt` is up to date
- [ ] `build.sh` created and executable
- [ ] `settings.py` configured for production
- [ ] Code pushed to GitHub
- [ ] Web Service created on Render
- [ ] Environment variables set
- [ ] DATABASE_URL configured
- [ ] Deployment successful
- [ ] API endpoints working

### Frontend ✅
- [ ] API base URL updated
- [ ] `.env` file created with VITE_API_URL
- [ ] `npm run build` works locally
- [ ] Code pushed to GitHub
- [ ] Static Site created on Render
- [ ] Build command configured
- [ ] Publish directory set to `dist`
- [ ] Deployment successful
- [ ] App loads correctly

### Integration ✅
- [ ] Backend CORS configured for frontend domain
- [ ] Frontend API URL points to backend
- [ ] ALLOWED_HOSTS includes Render domain
- [ ] API calls working from frontend
- [ ] Authentication working
- [ ] All features functional

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "Application failed to start"
**Solution**: Check logs in Render dashboard
```bash
# Common fixes:
1. Verify build.sh is executable
2. Check requirements.txt has all dependencies
3. Verify gunicorn is installed
```

#### Error: "Database connection failed"
**Solution**: 
```bash
1. Verify DATABASE_URL is correct
2. Check database is running in same region
3. Ensure connection string has no typos
```

#### Error: "Static files not loading"
**Solution**:
```python
# In settings.py
STATIC_ROOT = BASE_DIR / 'productionfiles'
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
```

### Frontend Issues

#### Error: "API calls failing with CORS error"
**Solution**:
```python
# In backend settings.py
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.onrender.com',
]
CORS_ALLOW_CREDENTIALS = True
```

#### Error: "Environment variables not working"
**Solution**:
```bash
# For Vite apps, use VITE_ prefix
VITE_API_URL=https://backend.onrender.com

# In code:
const apiUrl = import.meta.env.VITE_API_URL;
```

#### Error: "Build fails with memory error"
**Solution**: Upgrade to paid plan or optimize build
```json
// Add to package.json
"build": "vite build --mode production --logLevel silent"
```

### Database Issues

#### Error: "Too many connections"
**Solution**:
```python
# In settings.py
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['OPTIONS'] = {
    'connect_timeout': 10,
}
```

---

## 🔐 Security Best Practices

1. **Never Commit Secrets**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   *.log
   ```

2. **Use Environment Variables**:
   - Set in Render Dashboard
   - Never hardcode credentials

3. **Enable HTTPS Only**:
   ```python
   # In production settings
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   ```

4. **Restrict CORS**:
   ```python
   # Only allow your frontend
   CORS_ALLOWED_ORIGINS = [
       'https://your-frontend.onrender.com',
   ]
   ```

---

## 📊 Monitoring & Maintenance

### Check Application Health

**Backend**:
```bash
curl https://recruitment-backend.onrender.com/admin/
```

**Frontend**:
```bash
curl https://recruitment-frontend.onrender.com
```

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor real-time logs

### Update Application

**Backend**:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render will auto-deploy
```

**Frontend**:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Render will auto-deploy
```

---

## 🎉 Success! Your App is Live

**Backend URL**: `https://recruitment-backend.onrender.com`
**Frontend URL**: `https://recruitment-frontend.onrender.com`

### Share Your App
- Copy frontend URL
- Share with users
- Monitor usage in Render Dashboard

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [React Deployment Guide](https://react.dev/learn/start-a-new-react-project#deploying-to-production)

---

## ⚡ Quick Commands Reference

### Backend
```bash
# Test locally
python manage.py runserver

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Backend sleeps after 15 min of inactivity
   - First request may take 30-60 seconds
   - Consider paid plan for production

2. **Custom Domains**:
   - Available on paid plans
   - Configure in Render Dashboard
   - Update ALLOWED_HOSTS and CORS settings

3. **Database Backups**:
   - Automatic on paid plans
   - Manual: `pg_dump` from Render shell

4. **Environment-Specific Settings**:
   ```python
   # Use different settings for dev/prod
   if os.environ.get('ENVIRONMENT') == 'production':
       DEBUG = False
   else:
       DEBUG = True
   ```

---

**Last Updated**: December 16, 2024
**Author**: AI Assistant
**Version**: 1.0

🎊 Happy Deploying! 🎊
