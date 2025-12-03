# 🔌 API Endpoints Quick Reference

## Base URL
```
http://localhost:8000
```

---

## 🔐 Authentication Endpoints (`/auth/`)

### 1. Register User
**POST** `/auth/register/`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "job_seeker"  // or "recruiter"
}
```

### 2. Login
**POST** `/auth/login/`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response**:
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

### 3. Refresh Token
**POST** `/auth/token/refresh/`
```json
{
  "refresh": "<refresh_token>"
}
```

### 4. Logout
**POST** `/auth/logout/`
**Header**: `Authorization: Bearer <access_token>`
```json
{
  "refresh": "<refresh_token>"
}
```

---

## 👤 Profile Endpoints (`/profile/`)

### Job Seeker Profile

#### Get/Update Job Seeker Profile
**GET/PUT/PATCH** `/profile/job-seeker/`
**Header**: `Authorization: Bearer <access_token>`

**PUT/PATCH Body**:
```json
{
  "location": "New York, USA",
  "nationality": "American",
  "bio": "Experienced software developer...",
  "education": "Bachelor's in Computer Science",
  "institution_or_company": "MIT / Google",
  "years_of_experience": 5,
  "phone": "+1234567890",
  "gender": "M",  // or "F"
  "website": "https://johndoe.com",
  "picture": "<file_upload>"
}
```

### Recruiter Profile

#### Get/Update Recruiter Profile
**GET/PUT/PATCH** `/profile/recruiter/`
**Header**: `Authorization: Bearer <access_token>`

**PUT/PATCH Body**:
```json
{
  "company_name": "Tech Corp",
  "company_website": "https://techcorp.com",
  "company_description": "Leading tech company...",
  "company_logo": "<file_upload>"
}
```

---

## 💼 Job & Application Endpoints (`/access/`)

### Jobs

#### List All Jobs
**GET** `/access/jobs/`
**Query Params** (optional):
- `?search=keyword` - Search in title, description, location
- `?job_type=full_time` - Filter by job type
- `?location=New York` - Filter by location
- `?ordering=-created_at` - Sort results

#### Get Single Job
**GET** `/access/jobs/{id}/`

#### Create Job (Recruiter only)
**POST** `/access/jobs/`
**Header**: `Authorization: Bearer <access_token>` (Recruiter)
```json
{
  "title": "Senior Python Developer",
  "description": "We are looking for...",
  "requirements": "5+ years Python, Django...",
  "location": "Remote",
  "job_type": "full_time",  // full_time, part_time, contract, internship
  "salary_range": "$80,000 - $120,000",
  "deadline": "2025-12-31"
}
```

#### Update Job (Recruiter only)
**PUT/PATCH** `/access/jobs/{id}/`
**Header**: `Authorization: Bearer <access_token>` (Recruiter, Owner)

#### Delete Job (Recruiter only)
**DELETE** `/access/jobs/{id}/`
**Header**: `Authorization: Bearer <access_token>` (Recruiter, Owner)

---

### Applications

#### List My Applications (Job Seeker)
**GET** `/access/my-applications/`
**Header**: `Authorization: Bearer <access_token>` (Job Seeker)

#### Apply to Job (Job Seeker only)
**POST** `/access/jobs/{job_id}/apply/`
**Header**: `Authorization: Bearer <access_token>` (Job Seeker)
**Body** (multipart/form-data):
```
resume: <file>
cover_letter: <file> (optional)
```

#### View Applications for My Jobs (Recruiter)
**GET** `/access/jobs/{job_id}/applications/`
**Header**: `Authorization: Bearer <access_token>` (Recruiter, Owner)

#### Update Application Status (Recruiter)
**PATCH** `/access/applications/{id}/status/`
**Header**: `Authorization: Bearer <access_token>` (Recruiter, Owner)
```json
{
  "status": "under_review"  // submitted, under_review, shortlisted, rejected, accepted
}
```

---

## 📊 Admin Panel

**URL**: http://localhost:8000/admin/

**Access**: Requires superuser account

**Create Superuser**:
```bash
python3 manage.py createsuperuser
```

---

## 📖 API Documentation

### Swagger UI (Interactive)
**URL**: http://localhost:8000/

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication testing
- Real-time API testing

### ReDoc (Documentation)
**URL**: http://localhost:8000/redoc/

Features:
- Clean documentation layout
- Detailed endpoint descriptions
- Schema definitions

---

## 🔑 Authentication Headers

All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_access_token>
```

---

## 📁 File Upload Endpoints

When uploading files (images, resumes), use `multipart/form-data`:

```bash
curl -X POST http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer <token>" \
  -F "picture=@/path/to/image.jpg" \
  -F "location=New York" \
  -F "bio=My bio"
```

---

## 🎯 Role-Based Access

| Endpoint | Job Seeker | Recruiter | Admin |
|----------|-----------|-----------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| Job Seeker Profile | ✅ (own) | ❌ | ✅ |
| Recruiter Profile | ❌ | ✅ (own) | ✅ |
| List Jobs | ✅ | ✅ | ✅ |
| Create/Edit Job | ❌ | ✅ (own) | ✅ |
| Apply to Job | ✅ | ❌ | ✅ |
| View Applications | ❌ | ✅ (own jobs) | ✅ |
| Update Status | ❌ | ✅ (own jobs) | ✅ |

---

## ⚠️ Common Response Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Successful deletion
- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: No permission
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

---

## 💡 Tips

1. **Always test authentication first**: Register → Login → Get token
2. **Use Swagger UI** for easy testing with built-in authorization
3. **Check token expiry**: Access tokens expire in 30 minutes
4. **File uploads**: Use multipart/form-data, not JSON
5. **Unique constraints**: Can't apply to same job twice
6. **Role matters**: Job seekers can't create jobs, recruiters can't apply

---

## 🧪 Sample Testing Flow

```bash
# 1. Register as Job Seeker
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"seeker@test.com","password":"Test123!","role":"job_seeker","first_name":"Jane","last_name":"Doe"}'

# 2. Register as Recruiter
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@test.com","password":"Test123!","role":"recruiter","first_name":"John","last_name":"Smith"}'

# 3. Login as Recruiter
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@test.com","password":"Test123!"}'

# Save the access token from response

# 4. Create Job (as Recruiter)
curl -X POST http://localhost:8000/access/jobs/ \
  -H "Authorization: Bearer <recruiter_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Python Developer","description":"Build APIs","requirements":"Python, Django","location":"Remote","job_type":"full_time","deadline":"2025-12-31"}'

# 5. Login as Job Seeker
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"seeker@test.com","password":"Test123!"}'

# 6. View Jobs (as Job Seeker)
curl -X GET http://localhost:8000/access/jobs/ \
  -H "Authorization: Bearer <seeker_access_token>"

# 7. Apply to Job (as Job Seeker)
curl -X POST http://localhost:8000/access/jobs/1/apply/ \
  -H "Authorization: Bearer <seeker_access_token>" \
  -F "resume=@resume.pdf"
```
