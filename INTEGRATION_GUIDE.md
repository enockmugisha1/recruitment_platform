# 🔗 Complete Frontend-Backend Integration Guide

## 📊 Project Overview

**Backend**: Django REST Framework (Port 8000)
- Location: `/home/enock/recruitment_platform/`
- Tech: Django 5.2.1, DRF, JWT Authentication, SQLite

**Frontend**: React + TypeScript + Vite (Port 5173)
- Location: `/home/enock/recruitment_platform/Application-analyzer/`
- Tech: React 18, TypeScript, Axios, React Router, Tailwind CSS

---

## 🚀 Quick Start (Both Applications)

### Terminal 1: Start Backend
```bash
cd /home/enock/recruitment_platform
./quick_start.sh
```
The backend will run on: **http://localhost:8000**

### Terminal 2: Start Frontend
```bash
cd /home/enock/recruitment_platform/Application-analyzer
npm install
npm run dev
```
The frontend will run on: **http://localhost:5173**

---

## 🔧 Current Configuration Issues & Fixes

### ❌ Problem 1: Incorrect API Base URL

**Current Frontend Config** (Application-analyzer/src/api/axios.ts):
```typescript
const url = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";
```

**Issue**: 
- Points to wrong URL (localhost:3000 instead of localhost:8000)
- Has extra `/api` path that doesn't exist in backend

**✅ Solution**: Update the axios.ts configuration (see fixes below)

---

### ❌ Problem 2: Missing Dependencies

**Issue**: Frontend dependencies are not installed
```
UNMET DEPENDENCY axios@^1.10.0
UNMET DEPENDENCY react@^18.3.1
...
```

**✅ Solution**: 
```bash
cd /home/enock/recruitment_platform/Application-analyzer
npm install
```

---

### ❌ Problem 3: Environment Variables

**Current .env** (Application-analyzer/.env):
```env
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_BASE_URL=https://tgafrika.pythonanywhere.com/
```

**Issues**:
- Backend doesn't have `/api` prefix
- Production URL won't work in development

**✅ Solution**: Create proper .env file (see fixes below)

---

## 🛠️ Step-by-Step Integration Fixes

### Step 1: Fix Frontend Environment Variables

**File**: `Application-analyzer/.env`
```env
# Development - Local Backend
VITE_API_BASE_URL=http://localhost:8000

# Production - Uncomment when deploying
# VITE_API_BASE_URL=https://your-production-backend.com
```

### Step 2: Fix Axios Configuration

**File**: `Application-analyzer/src/api/axios.ts`

**Current Code**:
```typescript
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

export default axios.create({
  baseURL: url
})
```

**Fixed Code**:
```typescript
import axios from "axios";

// Get base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies if needed
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken') || 
                           sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new access token
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Store new access token
        localStorage.setItem('accessToken', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Step 3: Update Backend CORS Settings

**File**: `recruitment_platform/settings.py`

Check if your frontend port is allowed:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # ✅ Vite default
    "http://localhost:5174",  # ✅ Vite alternative
    "http://localhost:3000",  # Add if using React default
    "https://mohamdah-aa-frontend.netlify.app",  # Production
]

CORS_ALLOW_CREDENTIALS = True
```

**If you need to add more origins**, edit the settings.py file.

---

## 📡 API Endpoint Mapping

### Backend Endpoints → Frontend Usage

| Backend Endpoint | Frontend Usage | Method |
|-----------------|----------------|---------|
| `/auth/register/` | User registration | POST |
| `/auth/login/` | User login | POST |
| `/auth/logout/` | User logout | POST |
| `/auth/token/refresh/` | Refresh access token | POST |
| `/profile/job-seeker/` | Get/Update job seeker profile | GET/PATCH |
| `/profile/recruiter/` | Get/Update recruiter profile | GET/PATCH |
| `/access/jobs/` | List/Create jobs | GET/POST |
| `/access/jobs/{id}/` | Get/Update/Delete job | GET/PATCH/DELETE |
| `/access/jobs/{id}/apply/` | Apply to job | POST |
| `/access/my-applications/` | Get my applications | GET |
| `/access/jobs/{id}/applications/` | Get job applications | GET |

### Example API Calls in Frontend

**1. Login (Already implemented in Login.tsx)**
```typescript
const response = await axios.post('/auth/login/', {
  email,
  password
});
const { access, refresh } = response.data;
```

**2. Get Jobs**
```typescript
const response = await axios.get('/access/jobs/');
const jobs = response.data;
```

**3. Apply to Job (with file upload)**
```typescript
const formData = new FormData();
formData.append('resume', resumeFile);
formData.append('cover_letter', coverLetterFile); // optional

const response = await axios.post(`/access/jobs/${jobId}/apply/`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});
```

---

## 🔐 Authentication Flow

### Current Implementation (Login.tsx)

✅ **Already Working**:
```typescript
// 1. User submits login form
const response = await axios.post('/auth/login/', { email, password });

// 2. Store tokens
localStorage.setItem('accessToken', access);
if (rememberMe) {
  localStorage.setItem('refreshToken', refresh);
} else {
  sessionStorage.setItem('refreshToken', refresh);
}

// 3. Redirect to dashboard
navigate('/');
```

### Token Usage

**Automatic Token Attachment** (via interceptor in axios.ts):
```typescript
// Every request automatically includes:
headers: {
  'Authorization': 'Bearer <accessToken>'
}
```

**Token Refresh** (automatic on 401 errors):
```typescript
// When access token expires:
// 1. Interceptor catches 401 error
// 2. Sends refresh token to /auth/token/refresh/
// 3. Gets new access token
// 4. Retries original request
// 5. If refresh fails, redirects to login
```

---

## 📁 Project Structure

```
recruitment_platform/
├── 🔙 BACKEND (Django)
│   ├── users/                    # Authentication
│   ├── profiles/                 # User profiles
│   ├── applications/             # Jobs & Applications
│   ├── recruitment_platform/     # Settings
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
│
└── 🎨 FRONTEND (React)
    └── Application-analyzer/
        ├── src/
        │   ├── api/
        │   │   ├── axios.ts      # ⚠️ NEEDS UPDATE
        │   │   └── utils.ts
        │   ├── components/       # UI Components
        │   ├── pages/
        │   │   ├── Login.tsx     # ✅ Uses /auth/login/
        │   │   ├── Signup.tsx
        │   │   ├── Jobs.tsx      # Should use /access/jobs/
        │   │   ├── Profile.tsx   # Should use /profile/*/
        │   │   └── ...
        │   ├── contexts/         # React Context
        │   └── main.tsx
        ├── .env                  # ⚠️ NEEDS UPDATE
        ├── package.json
        └── vite.config.ts
```

---

## 🧪 Testing the Integration

### Test 1: Backend Health Check
```bash
# Terminal 1: Start backend
cd /home/enock/recruitment_platform
./quick_start.sh

# Terminal 2: Test API
curl http://localhost:8000/
# Should return Swagger UI HTML
```

### Test 2: Test Authentication
```bash
# Register a user
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "job_seeker"
  }'

# Login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
# Should return access and refresh tokens
```

### Test 3: Frontend Connection
```bash
# Terminal 3: Start frontend
cd /home/enock/recruitment_platform/Application-analyzer
npm install
npm run dev

# Open browser: http://localhost:5173
# Try logging in with the test user
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: 
1. Check backend is running on port 8000
2. Verify CORS settings in `recruitment_platform/settings.py`
3. Add your frontend URL to `CORS_ALLOWED_ORIGINS`

### Issue 2: 404 Not Found
**Error**: `GET http://localhost:8000/api/auth/login/ 404`

**Solution**: 
- Backend doesn't have `/api` prefix
- Update frontend to use `http://localhost:8000` (not `/api`)

### Issue 3: 401 Unauthorized
**Error**: Protected endpoints return 401

**Solution**:
1. Check token is stored: `localStorage.getItem('accessToken')`
2. Check token format: Should be `Bearer <token>`
3. Token might be expired - try logging in again

### Issue 4: Token Not Sent
**Error**: Token in localStorage but not sent in requests

**Solution**: 
- Update axios.ts with request interceptor (see Step 2 above)

### Issue 5: File Upload Fails
**Error**: Resume/image upload returns error

**Solution**:
```typescript
// Don't use axios.post with JSON
// Use FormData instead
const formData = new FormData();
formData.append('resume', file);

await axios.post('/access/jobs/1/apply/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

---

## 📝 Required Changes Summary

### 1. Update Frontend Files

**File 1**: `Application-analyzer/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

**File 2**: `Application-analyzer/src/api/axios.ts`
- Update base URL to use `VITE_API_BASE_URL`
- Add request interceptor for token
- Add response interceptor for token refresh
- Remove `/api` from path

### 2. Install Frontend Dependencies
```bash
cd /home/enock/recruitment_platform/Application-analyzer
npm install
```

### 3. Verify Backend CORS (Already Configured ✅)
- Port 5173 already allowed in settings.py
- No changes needed

---

## 🎯 Next Steps

1. **Apply the fixes** (see commands below)
2. **Start both servers**
3. **Test the integration**
4. **Build your features** using the API endpoints

---

## 🚀 Quick Fix Commands

```bash
# 1. Update frontend environment
cd /home/enock/recruitment_platform/Application-analyzer
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
EOF

# 2. Install dependencies
npm install

# 3. Start backend (Terminal 1)
cd /home/enock/recruitment_platform
./quick_start.sh

# 4. Start frontend (Terminal 2)
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev
```

---

## 📚 Additional Resources

- **Backend API Documentation**: http://localhost:8000/ (Swagger)
- **API Endpoints Reference**: `/home/enock/recruitment_platform/API_ENDPOINTS.md`
- **Frontend Integration Guide**: `/home/enock/recruitment_platform/FRONTEND_INTEGRATION_GUIDE.md`
- **Backend Setup**: `/home/enock/recruitment_platform/HOW_TO_RUN.md`

---

## 💡 Pro Tips

1. **Use Swagger UI** (http://localhost:8000/) to test backend APIs first
2. **Check browser console** for detailed error messages
3. **Check backend logs**: `tail -f logs/recruitment.log`
4. **Use React DevTools** to debug state and props
5. **Test with Postman** if frontend has issues

---

## 🎉 Ready to Start!

After applying the fixes, you should be able to:
- ✅ Login from frontend to backend
- ✅ Make authenticated API calls
- ✅ Upload files (resumes, images)
- ✅ Auto-refresh expired tokens
- ✅ Handle errors gracefully

**Need help?** Check the logs or use the Swagger UI to test endpoints!

---

**Last Updated**: 2025-12-09
**Status**: Configuration fixes required, then ready to integrate
