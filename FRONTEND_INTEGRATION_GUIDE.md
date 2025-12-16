# 🎨 Frontend Integration Guide

## 📋 Overview
This guide will help you connect your frontend application (React, Vue, Angular, or vanilla JavaScript) to the TGA Recruitment Platform backend API.

---

## 🔗 Backend Configuration

### Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com
```

### CORS Configuration
The backend is already configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternative)
- `https://mohamdah-aa-frontend.netlify.app`

**To add more origins**, edit `recruitment_platform/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
    "http://localhost:8080",  # Vue default
    "http://localhost:4200",  # Angular default
    "https://your-frontend-domain.com",
]
```

---

## 🔐 Authentication Flow

### 1. User Registration
```javascript
// POST /auth/register/
const register = async (userData) => {
  const response = await fetch('http://localhost:8000/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role // "job_seeker" or "recruiter"
    })
  });
  return await response.json();
};
```

### 2. User Login
```javascript
// POST /auth/login/
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens in localStorage or sessionStorage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_role', data.role);
    return data;
  }
  throw new Error(data.detail || 'Login failed');
};
```

### 3. Making Authenticated Requests
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/profile/job-seeker/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  return await response.json();
};
```

### 4. Token Refresh
```javascript
// POST /auth/token/refresh/
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }
  
  // If refresh fails, logout user
  localStorage.clear();
  window.location.href = '/login';
};
```

### 5. Logout
```javascript
// POST /auth/logout/
const logout = async () => {
  const token = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  
  await fetch('http://localhost:8000/auth/logout/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh })
  });
  
  // Clear local storage
  localStorage.clear();
  window.location.href = '/login';
};
```

---

## 📊 API Integration Examples

### Fetch Jobs
```javascript
const fetchJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = `http://localhost:8000/access/jobs/${params ? '?' + params : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  return await response.json();
};

// Usage
const jobs = await fetchJobs({ 
  search: 'python', 
  job_type: 'full_time',
  location: 'Remote' 
});
```

### Create Job (Recruiter)
```javascript
const createJob = async (jobData) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/access/jobs/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData)
  });
  
  return await response.json();
};

// Usage
const newJob = await createJob({
  title: 'Senior Python Developer',
  description: 'We are looking for...',
  requirements: '5+ years Python experience',
  location: 'Remote',
  job_type: 'full_time',
  salary_range: '$80,000 - $120,000',
  deadline: '2025-12-31'
});
```

### Apply to Job (Job Seeker)
```javascript
const applyToJob = async (jobId, resume, coverLetter = null) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  
  formData.append('resume', resume); // File object
  if (coverLetter) {
    formData.append('cover_letter', coverLetter);
  }
  
  const response = await fetch(`http://localhost:8000/access/jobs/${jobId}/apply/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // DON'T set Content-Type for FormData - browser sets it automatically
    },
    body: formData
  });
  
  return await response.json();
};

// Usage from file input
const fileInput = document.getElementById('resume');
const resume = fileInput.files[0];
await applyToJob(1, resume);
```

### Update Profile
```javascript
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');
  const endpoint = role === 'job_seeker' 
    ? '/profile/job-seeker/' 
    : '/profile/recruiter/';
  
  const response = await fetch(`http://localhost:8000${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
};
```

### Upload Profile Picture
```javascript
const uploadProfilePicture = async (imageFile) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('picture', imageFile);
  
  const response = await fetch('http://localhost:8000/profile/job-seeker/', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
  return await response.json();
};
```

---

## 🛠️ Complete API Service (JavaScript)

See the `frontend-examples/api-service.js` file for a complete, production-ready API service class.

---

## ⚛️ React Integration

### Install Axios
```bash
npm install axios
```

### Create API Client
```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### React Hooks Example
```javascript
// src/hooks/useAuth.js
import { useState } from 'react';
import apiClient from '../api/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.role);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await apiClient.post('/auth/logout/', { refresh });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  return { user, login, logout, loading, error };
};
```

```javascript
// src/hooks/useJobs.js
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.get('/access/jobs/', { params: filters });
        setJobs(response.data.results || response.data);
      } catch (err) {
        setError(err.response?.data || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [JSON.stringify(filters)]);

  return { jobs, loading, error };
};
```

---

## 🎯 Environment Variables

Create a `.env` file in your frontend project:

```env
VITE_API_BASE_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Usage:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## 🚨 Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return { message: 'Invalid request', details: data };
      case 401:
        return { message: 'Unauthorized - please login', details: data };
      case 403:
        return { message: 'Forbidden - insufficient permissions', details: data };
      case 404:
        return { message: 'Resource not found', details: data };
      case 500:
        return { message: 'Server error', details: data };
      default:
        return { message: 'An error occurred', details: data };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'No response from server', details: null };
  } else {
    // Error in request setup
    return { message: error.message, details: null };
  }
};
```

---

## 📱 Example Pages

### Login Page
```javascript
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
```

### Jobs List Page
```javascript
// src/pages/Jobs.jsx
import React from 'react';
import { useJobs } from '../hooks/useJobs';

const Jobs = () => {
  const { jobs, loading, error } = useJobs();

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="jobs-page">
      <h1>Available Jobs</h1>
      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.job_type}</p>
            <p><strong>Salary:</strong> {job.salary_range}</p>
            <button onClick={() => handleApply(job.id)}>Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
```

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd /home/enock/recruitment_platform
./quick_start.sh
```

### 2. Test API (curl)
```bash
# Register
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","first_name":"Test","last_name":"User","role":"job_seeker"}'

# Login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### 3. Start Frontend
```bash
# React/Vite
npm run dev

# Next.js
npm run dev

# Vue
npm run serve
```

---

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:8000/ (Swagger UI)
- **API Endpoints Reference**: See `API_ENDPOINTS.md`
- **Example Frontend Code**: See `frontend-examples/` directory
- **Postman Collection**: See `TGA_Recruitment_Platform_Postman_Collection.json`

---

## ✅ Checklist for Frontend Integration

- [ ] Backend server running on http://localhost:8000
- [ ] CORS configured for your frontend origin
- [ ] API base URL configured in frontend
- [ ] Authentication flow implemented (login/logout/token refresh)
- [ ] JWT tokens stored securely (localStorage/sessionStorage)
- [ ] Authorization header added to protected requests
- [ ] Error handling implemented
- [ ] File upload functionality tested
- [ ] Role-based routing implemented
- [ ] Token refresh on 401 errors

---

## 🎯 Quick Start Commands

```bash
# Backend (Terminal 1)
cd /home/enock/recruitment_platform
./quick_start.sh

# Frontend (Terminal 2)
cd /path/to/your/frontend
npm install
npm run dev
```

---

**Need help?** Check the example code in `frontend-examples/` or test the API using Swagger UI at http://localhost:8000/
