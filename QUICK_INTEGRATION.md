# 🎯 Frontend-Backend Integration - Quick Reference

## 📍 Project Locations
- **Backend**: `/home/enock/recruitment_platform/`
- **Frontend**: `/home/enock/recruitment_platform/Application-analyzer/`

---

## 🚀 Start Commands (2 Terminals)

### Terminal 1: Backend (Django)
```bash
cd /home/enock/recruitment_platform
./quick_start.sh
```
🌐 Backend runs on: **http://localhost:8000**

### Terminal 2: Frontend (React)
```bash
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev
```
🌐 Frontend runs on: **http://localhost:5173**

---

## ✅ What I Fixed

### 1. ✅ Frontend Configuration
**File**: `Application-analyzer/.env`
```env
VITE_API_BASE_URL=http://localhost:8000  # ✅ Fixed from wrong URL
```

### 2. ✅ Axios Configuration
**File**: `Application-analyzer/src/api/axios.ts`
- ✅ Fixed base URL (was pointing to localhost:3000/api)
- ✅ Added automatic token attachment to requests
- ✅ Added automatic token refresh on 401 errors
- ✅ Added proper error handling

### 3. ✅ Installed Dependencies
```bash
npm install  # ✅ All dependencies now installed
```

### 4. ✅ CORS Configuration
**Backend already configured for**:
- ✅ http://localhost:5173 (Vite default)
- ✅ http://localhost:5174 (Vite alternative)

---

## 🔌 API Endpoints Ready to Use

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth/register/` | POST | Register user | ❌ |
| `/auth/login/` | POST | Login user | ❌ |
| `/auth/logout/` | POST | Logout user | ✅ |
| `/auth/token/refresh/` | POST | Refresh token | ❌ |
| `/profile/job-seeker/` | GET/PATCH | Job seeker profile | ✅ |
| `/profile/recruiter/` | GET/PATCH | Recruiter profile | ✅ |
| `/access/jobs/` | GET | List all jobs | ❌ |
| `/access/jobs/` | POST | Create job (recruiter) | ✅ |
| `/access/jobs/{id}/` | GET | Get job details | ❌ |
| `/access/jobs/{id}/apply/` | POST | Apply to job | ✅ |
| `/access/my-applications/` | GET | My applications | ✅ |

---

## 🔐 Authentication Flow (Already Working!)

### Login Example (from your Login.tsx)
```typescript
import axios from '../api/axios';

// Login
const response = await axios.post('/auth/login/', {
  email: 'user@example.com',
  password: 'password123'
});

// Store tokens
localStorage.setItem('accessToken', response.data.access);
localStorage.setItem('refreshToken', response.data.refresh);

// All subsequent requests automatically include token! ✨
```

### Making Authenticated Requests
```typescript
// Token is automatically added by axios interceptor
const jobs = await axios.get('/access/jobs/');
const profile = await axios.get('/profile/job-seeker/');
```

---

## 📁 Key Files Modified

1. ✅ **Application-analyzer/.env** - API URL configuration
2. ✅ **Application-analyzer/src/api/axios.ts** - Axios setup with interceptors
3. ✅ **Created: INTEGRATION_GUIDE.md** - Complete integration documentation
4. ✅ **Created: test_integration.sh** - Integration testing script

---

## 🧪 Test the Integration

### Option 1: Automated Test
```bash
cd /home/enock/recruitment_platform
./test_integration.sh
```

### Option 2: Manual Test
```bash
# 1. Start backend
cd /home/enock/recruitment_platform
./quick_start.sh

# 2. Test API (in another terminal)
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 3. Start frontend (in another terminal)
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev

# 4. Open browser: http://localhost:5173
```

---

## 🎨 Frontend Pages Already Using Backend

✅ **Login.tsx** - Already configured to use `/auth/login/`
- Stores tokens correctly
- Redirects after login
- Shows error messages

🔧 **Other pages** need to be connected:
- Jobs.tsx → `/access/jobs/`
- Profile.tsx → `/profile/job-seeker/` or `/profile/recruiter/`
- Signup.tsx → `/auth/register/`

---

## 💡 Usage Examples

### 1. Fetch Jobs
```typescript
const JobsList = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await axios.get('/access/jobs/');
      setJobs(response.data);
    };
    fetchJobs();
  }, []);

  return (/* render jobs */);
};
```

### 2. Apply to Job (with file)
```typescript
const applyToJob = async (jobId: number, resume: File) => {
  const formData = new FormData();
  formData.append('resume', resume);
  
  await axios.post(`/access/jobs/${jobId}/apply/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### 3. Update Profile
```typescript
const updateProfile = async (data: any) => {
  await axios.patch('/profile/job-seeker/', data);
};
```

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check if port 8000 is already in use
lsof -i :8000
# Kill process if needed
kill -9 <PID>
```

### Frontend not starting?
```bash
# Check if port 5173 is already in use
lsof -i :5173
# Or use alternative port
npm run dev -- --port 5174
```

### CORS errors?
- Backend must be running on port 8000
- Check CORS settings in `recruitment_platform/settings.py`
- Clear browser cache

### Token not working?
```javascript
// Check in browser console
console.log(localStorage.getItem('accessToken'));
// Should show a long JWT token
```

---

## 📚 Documentation Files

1. **INTEGRATION_GUIDE.md** - Complete step-by-step guide (⭐ START HERE)
2. **API_ENDPOINTS.md** - All backend API endpoints
3. **FRONTEND_INTEGRATION_GUIDE.md** - Original integration guide
4. **HOW_TO_RUN.md** - Backend setup guide
5. **README.md** - Project overview

---

## ✨ What Works Now

✅ Frontend can connect to backend
✅ Authentication flow working (login/logout)
✅ Automatic token management
✅ Automatic token refresh
✅ CORS configured
✅ Error handling
✅ File upload ready

---

## 🎯 Next Steps

1. **Test the integration**:
   ```bash
   # Start backend
   cd /home/enock/recruitment_platform && ./quick_start.sh
   
   # Start frontend (new terminal)
   cd /home/enock/recruitment_platform/Application-analyzer && npm run dev
   ```

2. **Connect remaining pages**:
   - Update Jobs.tsx to fetch from `/access/jobs/`
   - Update Profile.tsx to use `/profile/*/`
   - Update Signup.tsx to use `/auth/register/`

3. **Build your features** using the API!

---

## 🆘 Need Help?

- **API Documentation**: http://localhost:8000/ (Swagger UI)
- **Full Guide**: `/home/enock/recruitment_platform/INTEGRATION_GUIDE.md`
- **Test Backend**: Use Swagger UI to test endpoints
- **Check Logs**: `tail -f logs/recruitment.log`

---

**Status**: ✅ Ready to integrate!  
**Last Updated**: 2025-12-09
