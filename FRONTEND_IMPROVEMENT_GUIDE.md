# 🎨 Frontend Improvement Guide

## Current State Analysis

Your recruitment platform currently has:
- ✅ Django REST Framework backend with Swagger UI
- ✅ Basic templates folder with 404.html
- ✅ Static files setup
- ❌ **No dedicated frontend application yet**

## 🚀 Option 1: Modern React Frontend (Recommended)

### Step 1: Create React Frontend

```bash
# Navigate to your project root
cd /home/enock/recruitment_platform

# Create React app in a separate folder
npx create-react-app frontend
cd frontend
```

### Step 2: Install Required Dependencies

```bash
npm install axios react-router-dom
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install jwt-decode
npm install react-toastify
```

### Step 3: Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── Jobs/
│   │   │   ├── JobList.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── JobCreate.jsx
│   │   │   └── JobCard.jsx
│   │   ├── Profile/
│   │   │   ├── JobSeekerProfile.jsx
│   │   │   └── RecruiterProfile.jsx
│   │   ├── Applications/
│   │   │   ├── ApplicationList.jsx
│   │   │   └── ApplicationDetail.jsx
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   └── Common/
│   │       ├── Loading.jsx
│   │       └── ErrorBoundary.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── jobService.js
│   │   └── profileService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── index.jsx
```

### Step 4: Core Files Setup

#### src/services/api.js
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

#### src/services/authService.js
```javascript
import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    await api.post('/auth/logout/', { refresh });
    localStorage.clear();
  },

  requestOTP: async (email, purpose) => {
    const response = await api.post('/auth/otp/request/', { email, purpose });
    return response.data;
  },

  verifyOTP: async (email, otp, purpose) => {
    const response = await api.post('/auth/otp/verify/', { email, otp, purpose });
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

#### src/services/jobService.js
```javascript
import api from './api';

export const jobService = {
  getAllJobs: async (params = {}) => {
    const response = await api.get('/access/jobs/', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/access/jobs/${id}/`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/access/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/access/jobs/${id}/`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/access/jobs/${id}/`);
    return response.data;
  },

  applyToJob: async (jobId, applicationData) => {
    const formData = new FormData();
    formData.append('cover_letter', applicationData.cover_letter);
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }
    
    const response = await api.post(`/access/jobs/${jobId}/apply/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/access/applications/');
    return response.data;
  },
};
```

#### src/context/AuthContext.jsx
```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### src/App.jsx (Basic Structure)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your components (create these)
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import JobList from './components/Jobs/JobList';
import JobDetail from './components/Jobs/JobDetail';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Layout/Navbar';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/jobs" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### Step 5: Environment Configuration

Create `.env` in frontend folder:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_NAME=TGA Recruitment Platform
```

### Step 6: Update Backend CORS Settings

Already done! Your backend has `django-cors-headers` installed.

Verify in `recruitment_platform/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Step 7: Run Frontend

```bash
cd frontend
npm start
```

Frontend will run on http://localhost:3000

---

## 🚀 Option 2: Django Templates with Bootstrap (Simpler)

If you prefer server-side rendering with Django templates:

### Step 1: Install Django Template Dependencies

```bash
pip install django-widget-tweaks
```

### Step 2: Create Template Structure

```bash
mkdir -p templates/{auth,jobs,profiles,base}
mkdir -p mystaticfiles/{css,js,images}
```

### Step 3: Create Base Template

Create `templates/base/base.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}TGA Recruitment Platform{% endblock %}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/styles.css' %}">
    {% block extra_css %}{% endblock %}
</head>
<body>
    {% include 'base/navbar.html' %}
    
    <main class="container mt-4">
        {% if messages %}
            {% for message in messages %}
                <div class="alert alert-{{ message.tags }} alert-dismissible fade show" role="alert">
                    {{ message }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            {% endfor %}
        {% endif %}
        
        {% block content %}{% endblock %}
    </main>
    
    {% include 'base/footer.html' %}
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

### Step 4: Add Views for Templates

This requires modifying your Django apps to include template views alongside API views.

---

## 📱 API Integration Checklist

Ensure all these endpoints are working:

### Authentication APIs
- [ ] POST `/auth/register/` - User registration
- [ ] POST `/auth/login/` - User login
- [ ] POST `/auth/logout/` - User logout
- [ ] POST `/auth/token/refresh/` - Refresh JWT token
- [ ] POST `/auth/otp/request/` - Request OTP
- [ ] POST `/auth/otp/verify/` - Verify OTP
- [ ] POST `/auth/password-reset/request/` - Request password reset
- [ ] POST `/auth/password-reset/confirm/` - Confirm password reset

### Profile APIs
- [ ] GET `/profile/job-seeker/` - Get job seeker profile
- [ ] PUT `/profile/job-seeker/` - Update job seeker profile
- [ ] GET `/profile/recruiter/` - Get recruiter profile
- [ ] PUT `/profile/recruiter/` - Update recruiter profile

### Jobs APIs
- [ ] GET `/access/jobs/` - List all jobs
- [ ] POST `/access/jobs/` - Create job (recruiter)
- [ ] GET `/access/jobs/{id}/` - Get job detail
- [ ] PUT `/access/jobs/{id}/` - Update job (recruiter)
- [ ] DELETE `/access/jobs/{id}/` - Delete job (recruiter)
- [ ] POST `/access/jobs/{id}/apply/` - Apply to job

### Applications APIs
- [ ] GET `/access/applications/` - List user applications
- [ ] GET `/access/applications/{id}/` - Get application detail
- [ ] PUT `/access/applications/{id}/` - Update application status

---

## 🧪 Testing Frontend-Backend Integration

Create test file `test_api_integration.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "Testing API Endpoints..."

# Test Register
echo "1. Testing Registration..."
curl -X POST $BASE_URL/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "role": "job_seeker",
    "first_name": "Test",
    "last_name": "User"
  }'

echo -e "\n\n2. Testing Login..."
curl -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'

echo -e "\n\n3. Testing Job List..."
curl -X GET $BASE_URL/access/jobs/

echo -e "\n\nAPI Tests Complete!"
```

---

## 🎨 UI/UX Best Practices

1. **Responsive Design**: Use Bootstrap/Material-UI grid system
2. **Loading States**: Show spinners during API calls
3. **Error Handling**: Display user-friendly error messages
4. **Form Validation**: Client-side validation before API calls
5. **Toast Notifications**: For success/error feedback
6. **Protected Routes**: Redirect unauthorized users
7. **File Upload Preview**: Show resume/logo before upload

---

## 📦 Next Steps

1. Choose your frontend approach (React or Django Templates)
2. Set up the frontend structure
3. Implement authentication first
4. Build out job listing and application features
5. Add profile management
6. Test all integrations
7. Prepare for deployment

---

Would you like me to generate specific component files for either approach?
