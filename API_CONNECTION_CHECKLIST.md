# 🔌 API Connection Checklist & Testing Guide

## Complete guide to ensure all APIs are properly connected and working

---

## 📋 API Endpoints Overview

### Base URL (Development)
```
http://localhost:8000
```

### Base URL (Production - Render)
```
https://your-app-name.onrender.com
```

---

## 🔐 Authentication Endpoints

### 1. User Registration
```bash
POST /auth/register/

# Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "role": "job_seeker",  # or "recruiter"
  "first_name": "John",
  "last_name": "Doe"
}

# Test:
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "role": "job_seeker",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response**: 201 Created
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "job_seeker"
  }
}
```

### 2. User Login
```bash
POST /auth/login/

# Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Test:
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response**: 200 OK
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "job_seeker",
    "first_name": "Test",
    "last_name": "User"
  }
}
```

### 3. Token Refresh
```bash
POST /auth/token/refresh/

# Request Body:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Test:
curl -X POST http://localhost:8000/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Logout
```bash
POST /auth/logout/

# Request Body:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Test:
curl -X POST http://localhost:8000/auth/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Request OTP (Email Verification)
```bash
POST /auth/otp/request/

# Request Body:
{
  "email": "user@example.com",
  "purpose": "email_verification",  # or "password_reset"
  "debug": true  # Only for development
}

# Test:
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "email_verification",
    "debug": true
  }'
```

### 6. Verify OTP
```bash
POST /auth/otp/verify/

# Request Body:
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "email_verification"
}

# Test:
curl -X POST http://localhost:8000/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "email_verification"
  }'
```

### 7. Password Reset Request
```bash
POST /auth/password-reset/request/

# Request Body:
{
  "email": "user@example.com"
}
```

### 8. Password Reset Confirm
```bash
POST /auth/password-reset/confirm/

# Request Body:
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!"
}
```

---

## 👤 Profile Endpoints

### Job Seeker Profile

#### Get Profile
```bash
GET /profile/job-seeker/

# Test:
curl -X GET http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Profile
```bash
PUT /profile/job-seeker/

# Request Body (multipart/form-data):
{
  "bio": "Experienced developer",
  "phone": "+1234567890",
  "location": "New York, USA",
  "education": "BS Computer Science",
  "experience": "5 years in web development",
  "skills": "Python, Django, React",
  "resume": [file]
}

# Test:
curl -X PUT http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "bio=Experienced developer" \
  -F "phone=+1234567890" \
  -F "location=New York" \
  -F "skills=Python, Django" \
  -F "resume=@/path/to/resume.pdf"
```

### Recruiter Profile

#### Get Profile
```bash
GET /profile/recruiter/

# Test:
curl -X GET http://localhost:8000/profile/recruiter/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Profile
```bash
PUT /profile/recruiter/

# Request Body (multipart/form-data):
{
  "company_name": "Tech Corp",
  "company_description": "Leading tech company",
  "company_website": "https://techcorp.com",
  "phone": "+1234567890",
  "location": "San Francisco",
  "company_logo": [file]
}

# Test:
curl -X PUT http://localhost:8000/profile/recruiter/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "company_name=Tech Corp" \
  -F "company_description=Leading tech company" \
  -F "phone=+1234567890" \
  -F "company_logo=@/path/to/logo.png"
```

---

## 💼 Job Endpoints

### 1. List All Jobs
```bash
GET /access/jobs/

# Query Parameters:
- search: Search term
- location: Filter by location
- job_type: Filter by type (full_time, part_time, contract, internship)
- min_salary: Minimum salary
- max_salary: Maximum salary
- page: Page number
- page_size: Results per page

# Test:
curl -X GET "http://localhost:8000/access/jobs/?search=developer&location=New%20York" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response**: 200 OK
```json
{
  "count": 10,
  "next": "http://localhost:8000/access/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Senior Python Developer",
      "company": "Tech Corp",
      "location": "New York",
      "job_type": "full_time",
      "salary_min": 80000,
      "salary_max": 120000,
      "description": "...",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### 2. Create Job (Recruiter Only)
```bash
POST /access/jobs/

# Request Body:
{
  "title": "Senior Python Developer",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "location": "New York, USA",
  "job_type": "full_time",
  "salary_min": 80000,
  "salary_max": 120000,
  "application_deadline": "2025-12-31"
}

# Test:
curl -X POST http://localhost:8000/access/jobs/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Python Developer",
    "description": "Looking for experienced developer",
    "requirements": "3+ years Python experience",
    "location": "Remote",
    "job_type": "full_time",
    "salary_min": 60000,
    "salary_max": 90000
  }'
```

### 3. Get Job Detail
```bash
GET /access/jobs/{job_id}/

# Test:
curl -X GET http://localhost:8000/access/jobs/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Job (Recruiter Only)
```bash
PUT /access/jobs/{job_id}/

# Request Body: Same as create

# Test:
curl -X PUT http://localhost:8000/access/jobs/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Updated Job Title",
    "description": "Updated description"
  }'
```

### 5. Delete Job (Recruiter Only)
```bash
DELETE /access/jobs/{job_id}/

# Test:
curl -X DELETE http://localhost:8000/access/jobs/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Apply to Job (Job Seeker Only)
```bash
POST /access/jobs/{job_id}/apply/

# Request Body (multipart/form-data):
{
  "cover_letter": "I am interested in...",
  "resume": [file]  # Optional if already uploaded in profile
}

# Test:
curl -X POST http://localhost:8000/access/jobs/1/apply/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "cover_letter=I am very interested in this position" \
  -F "resume=@/path/to/resume.pdf"
```

---

## 📝 Application Endpoints

### 1. List Applications
```bash
GET /access/applications/

# For Job Seekers: Returns their applications
# For Recruiters: Returns applications for their jobs

# Test:
curl -X GET http://localhost:8000/access/applications/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response**: 200 OK
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "job": {
        "id": 1,
        "title": "Python Developer",
        "company": "Tech Corp"
      },
      "applicant": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "cover_letter": "...",
      "applied_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### 2. Get Application Detail
```bash
GET /access/applications/{application_id}/

# Test:
curl -X GET http://localhost:8000/access/applications/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Update Application Status (Recruiter Only)
```bash
PATCH /access/applications/{application_id}/

# Request Body:
{
  "status": "reviewed"  # pending, reviewed, shortlisted, rejected, accepted
}

# Test:
curl -X PATCH http://localhost:8000/access/applications/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "reviewed"
  }'
```

---

## 🧪 Automated Testing Script

Create `test_all_apis.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestPass123!"

echo "🧪 Testing All API Endpoints"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Test Registration
echo -e "\n1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password_confirm\": \"$PASSWORD\",
    \"role\": \"job_seeker\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\"
  }")

if [[ $REGISTER_RESPONSE == *"successful"* ]]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo $REGISTER_RESPONSE
fi

# 2. Test Login
echo -e "\n2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [[ -n "$ACCESS_TOKEN" ]]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

# 3. Test Get Profile
echo -e "\n3. Testing Get Job Seeker Profile..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/profile/job-seeker/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $PROFILE_RESPONSE == *"email"* ]]; then
  echo -e "${GREEN}✓ Profile retrieved${NC}"
else
  echo -e "${RED}✗ Profile retrieval failed${NC}"
  echo $PROFILE_RESPONSE
fi

# 4. Test List Jobs
echo -e "\n4. Testing List Jobs..."
JOBS_RESPONSE=$(curl -s -X GET $BASE_URL/access/jobs/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $JOBS_RESPONSE == *"results"* ]]; then
  echo -e "${GREEN}✓ Jobs list retrieved${NC}"
else
  echo -e "${RED}✗ Jobs list failed${NC}"
  echo $JOBS_RESPONSE
fi

# 5. Test List Applications
echo -e "\n5. Testing List Applications..."
APPS_RESPONSE=$(curl -s -X GET $BASE_URL/access/applications/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $APPS_RESPONSE == *"results"* ]]; then
  echo -e "${GREEN}✓ Applications list retrieved${NC}"
else
  echo -e "${RED}✗ Applications list failed${NC}"
  echo $APPS_RESPONSE
fi

echo -e "\n================================"
echo "🎉 API Testing Complete!"
```

Make it executable:
```bash
chmod +x test_all_apis.sh
./test_all_apis.sh
```

---

## ✅ API Connection Checklist

### Backend Setup
- [ ] Django server running on port 8000
- [ ] All apps registered in INSTALLED_APPS
- [ ] URLs configured correctly
- [ ] CORS headers enabled
- [ ] JWT authentication working
- [ ] Database migrations applied

### Authentication
- [ ] Registration endpoint working
- [ ] Login returns JWT tokens
- [ ] Token refresh working
- [ ] Logout blacklists tokens
- [ ] OTP system functional
- [ ] Password reset working

### Profiles
- [ ] Job seeker profile CRUD
- [ ] Recruiter profile CRUD
- [ ] File uploads working (resume, logo)
- [ ] Profile permissions correct

### Jobs
- [ ] List jobs with filters
- [ ] Create job (recruiter only)
- [ ] Update job (recruiter only)
- [ ] Delete job (recruiter only)
- [ ] Job detail view
- [ ] Apply to job (job seeker only)

### Applications
- [ ] List applications by role
- [ ] Application detail view
- [ ] Update application status (recruiter)
- [ ] Prevent duplicate applications

### Frontend Integration
- [ ] API service configured
- [ ] Axios interceptors for auth
- [ ] Token refresh automatic
- [ ] Error handling
- [ ] Loading states
- [ ] File upload handling

---

## 🐛 Common API Issues & Fixes

### Issue 1: CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix**: Add to settings.py
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### Issue 2: 401 Unauthorized
```
{"detail": "Authentication credentials were not provided."}
```

**Fix**: Ensure token is sent in header
```javascript
Authorization: Bearer <your_access_token>
```

### Issue 3: 403 Forbidden
```
{"detail": "You do not have permission to perform this action."}
```

**Fix**: Check user role and permissions

### Issue 4: File Upload Failed
```
{"resume": ["The submitted data was not a file."]}
```

**Fix**: Use FormData and correct headers
```javascript
const formData = new FormData();
formData.append('resume', file);

axios.post(url, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 📊 API Status Dashboard

Create simple HTML dashboard to test APIs:

```html
<!DOCTYPE html>
<html>
<head>
    <title>API Status Dashboard</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .endpoint { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>API Status Dashboard</h1>
    <div id="endpoints"></div>
    
    <script>
        const endpoints = [
            { name: 'Health Check', url: '/auth/login/', method: 'OPTIONS' },
            { name: 'Jobs List', url: '/access/jobs/', method: 'GET' },
        ];
        
        endpoints.forEach(async (endpoint) => {
            const div = document.createElement('div');
            div.className = 'endpoint';
            div.innerHTML = `<strong>${endpoint.name}</strong>: Testing...`;
            document.getElementById('endpoints').appendChild(div);
            
            try {
                const response = await fetch(`http://localhost:8000${endpoint.url}`, {
                    method: endpoint.method
                });
                div.className = 'endpoint success';
                div.innerHTML = `<strong>${endpoint.name}</strong>: ✓ Working (${response.status})`;
            } catch (error) {
                div.className = 'endpoint error';
                div.innerHTML = `<strong>${endpoint.name}</strong>: ✗ Failed (${error.message})`;
            }
        });
    </script>
</body>
</html>
```

---

## 🎯 Next Steps

1. **Run the test script** to verify all endpoints
2. **Fix any failing endpoints**
3. **Document any custom endpoints**
4. **Create Postman collection**
5. **Set up frontend integration**
6. **Deploy to Render**

---

**Last Updated**: 2025-12-16  
**Status**: Ready for testing
