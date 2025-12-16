# 🎯 Complete Frontend-Backend Integration Guide

## ✅ Status: READY TO USE

Your integration is **already configured correctly**! Both frontend and backend are set up and ready to work together.

---

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend (Terminal 1)
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate
python manage.py runserver
```
✅ Backend runs on: **http://localhost:8000**

### Step 2: Start Frontend (Terminal 2)
```bash
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev
```
✅ Frontend runs on: **http://localhost:5173**

### Step 3: Test It!
- Open browser: **http://localhost:5173**
- Try registering a new user or logging in
- All API calls will automatically connect to the backend

---

## 🔗 What's Already Configured

### ✅ Backend (Django REST API)
- Running on port **8000**
- CORS enabled for port **5173** (Vite)
- JWT authentication configured
- All API endpoints ready

### ✅ Frontend (React + TypeScript)
- Environment variable: `VITE_API_BASE_URL=http://localhost:8000` ✅
- Axios configured with correct base URL ✅
- Token authentication interceptor ✅
- Auto token refresh on 401 errors ✅
- All dependencies installed ✅

---

## 📡 API Integration - How It Works

### 1. User Registration
**Frontend → Backend**
```typescript
// Application-analyzer/src/pages/Signup.tsx
const response = await axios.post('/auth/register/', {
  email: "user@example.com",
  password: "Password123!",
  first_name: "John",
  last_name: "Doe",
  role: "job_seeker" // or "recruiter"
});
```

**Backend Endpoint**: `POST http://localhost:8000/auth/register/`

### 2. User Login
**Frontend → Backend**
```typescript
// Application-analyzer/src/pages/Login.tsx
const response = await axios.post('/auth/login/', {
  email: "user@example.com",
  password: "Password123!"
});

// Backend returns tokens
const { access, refresh, role } = response.data;

// Tokens stored automatically
localStorage.setItem('accessToken', access);
localStorage.setItem('refreshToken', refresh);
```

**Backend Endpoint**: `POST http://localhost:8000/auth/login/`

### 3. Authenticated Requests
**All protected requests automatically include JWT token**:

```typescript
// Application-analyzer/src/api/axios.ts handles this automatically
// No need to manually add Authorization header!

// Example: Get user profile
const response = await axios.get('/profile/job-seeker/');
// Axios automatically adds: Authorization: Bearer <token>
```

### 4. Token Refresh (Automatic)
When access token expires (401 error):
1. Axios interceptor catches the error
2. Sends refresh token to `/auth/token/refresh/`
3. Gets new access token
4. Retries the original request
5. All happens automatically, no user action needed

---

## 🎨 Frontend Pages → Backend Endpoints

| Frontend Page | Backend API | What It Does |
|--------------|-------------|--------------|
| `/signup` | `POST /auth/register/` | Register new user |
| `/login` | `POST /auth/login/` | Login and get tokens |
| `/jobs` | `GET /access/jobs/` | List all jobs |
| `/jobs/:id` | `GET /access/jobs/:id/` | Get job details |
| `/jobs/:id/apply` | `POST /access/jobs/:id/apply/` | Apply to job |
| `/profile` | `GET /profile/job-seeker/` | Get user profile |
| `/profile` | `PATCH /profile/job-seeker/` | Update profile |
| `/applications` | `GET /access/my-applications/` | Get my applications |

---

## 📝 Example Usage in Frontend

### Fetch Jobs
```typescript
// In any React component
import axios from '../api/axios';

const fetchJobs = async () => {
  try {
    const response = await axios.get('/access/jobs/');
    setJobs(response.data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
};
```

### Apply to Job
```typescript
import axios from '../api/axios';

const applyToJob = async (jobId: number, resumeFile: File) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  
  try {
    const response = await axios.post(
      `/access/jobs/${jobId}/apply/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    console.log('Application submitted:', response.data);
  } catch (error) {
    console.error('Error applying:', error);
  }
};
```

### Update Profile
```typescript
import axios from '../api/axios';

const updateProfile = async (data: any) => {
  try {
    const response = await axios.patch('/profile/job-seeker/', data);
    console.log('Profile updated:', response.data);
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

---

## 🧪 Testing the Integration

### Test 1: Backend Health
```bash
curl http://localhost:8000/
# Should return HTML (Swagger UI)
```

### Test 2: Register User (via API)
```bash
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "job_seeker"
  }'
```

### Test 3: Login (via API)
```bash
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Test 4: Frontend Login
1. Open: http://localhost:5173
2. Go to Login page
3. Enter credentials
4. Check browser console for successful login
5. Check localStorage for tokens

---

## 🔍 Debugging Guide

### Backend Not Responding?
```bash
# Check if running
curl http://localhost:8000/

# Check Django process
ps aux | grep manage.py

# Restart backend
cd /home/enock/recruitment_platform
source venv/bin/activate
python manage.py runserver
```

### Frontend Not Connecting?
1. Check browser console for errors
2. Verify .env file: `cat Application-analyzer/.env`
3. Should show: `VITE_API_BASE_URL=http://localhost:8000`
4. Restart frontend: `npm run dev`

### CORS Errors?
Backend CORS is already configured for port 5173. If you see CORS errors:
```bash
# Check backend settings
cd /home/enock/recruitment_platform
grep CORS_ALLOWED_ORIGINS recruitment_platform/settings.py
```

### 401 Unauthorized?
- Token might be expired
- Try logging in again
- Check if token exists: `localStorage.getItem('accessToken')`

### File Upload Issues?
Make sure to use FormData:
```typescript
const formData = new FormData();
formData.append('resume', file);
axios.post('/url/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🎯 Development Workflow

### Daily Development:
```bash
# Terminal 1: Backend (keep running)
cd /home/enock/recruitment_platform
source venv/bin/activate
python manage.py runserver

# Terminal 2: Frontend (keep running)
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev

# Work on your code in Terminal 3
```

### View Logs:
```bash
# Backend logs (Terminal 1 shows live logs)
# Or check: tail -f logs/recruitment.log

# Frontend logs (Browser console or Terminal 2)
```

---

## 📦 Project Structure

```
recruitment_platform/
├── 🔙 BACKEND (Django)
│   ├── users/              # Authentication
│   ├── profiles/           # User profiles
│   ├── applications/       # Jobs & Applications
│   ├── manage.py
│   └── db.sqlite3
│
└── 🎨 FRONTEND (React)
    └── Application-analyzer/
        ├── src/
        │   ├── api/
        │   │   ├── axios.ts      ✅ Already configured
        │   │   └── utils.ts
        │   ├── pages/
        │   │   ├── Login.tsx     ✅ Uses /auth/login/
        │   │   ├── Signup.tsx    ✅ Uses /auth/register/
        │   │   └── Jobs.tsx      → Should use /access/jobs/
        │   └── components/
        ├── .env                  ✅ Already configured
        └── package.json
```

---

## 🛠️ Useful Commands

### Backend:
```bash
# Start server
python manage.py runserver

# Create superuser (admin)
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Check API docs
# Open: http://localhost:8000/
```

### Frontend:
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Both:
```bash
# Test integration
./test_frontend_backend.sh
```

---

## 🌐 API Documentation

**Swagger UI**: http://localhost:8000/
- Interactive API documentation
- Test all endpoints
- View request/response formats

**Postman Collection**: `TGA_Recruitment_Platform_Postman_Collection.json`
- Import into Postman for testing

---

## 🎉 You're All Set!

Everything is configured and ready to use. Just start both servers and begin building your features!

### Quick Reference:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/
- **Test Script**: `./test_frontend_backend.sh`

### Next Steps:
1. Start both servers (see Quick Start above)
2. Open frontend in browser
3. Test login/registration
4. Start building your features!

---

**Need Help?**
- Check Swagger UI for API details
- View browser console for frontend errors
- Check Terminal 1 for backend errors
- Run `./test_frontend_backend.sh` to diagnose issues

**Last Updated**: December 2025
**Status**: ✅ Ready for Development
