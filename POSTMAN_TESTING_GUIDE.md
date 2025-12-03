# 📮 Postman Testing Guide - TGA Recruitment Platform

Complete guide for testing the TGA Recruitment Platform API using Postman.

---

## 📥 Quick Start - Import Collection

### Step 1: Import the Collection File

1. Open **Postman**
2. Click **Import** button (top left)
3. Select **TGA_Recruitment_Platform_Postman_Collection.json**
4. Click **Import**

✅ You now have 40+ pre-configured API requests!

---

## 🎯 Collection Structure

The collection is organized into **7 folders**:

```
📁 TGA Recruitment Platform
├── 1️⃣ Authentication (6 requests)
│   ├── Register Job Seeker
│   ├── Register Recruiter
│   ├── Login Job Seeker
│   ├── Login Recruiter
│   ├── Refresh Token
│   └── Logout
│
├── 2️⃣ OTP & Email Verification (4 requests)
│   ├── Request OTP (Email Verification)
│   ├── Verify OTP
│   ├── Request Password Reset OTP
│   └── Reset Password with OTP
│
├── 3️⃣ Job Seeker Profile (3 requests)
│   ├── Get My Profile
│   ├── Update Profile (JSON)
│   └── Upload Profile Picture
│
├── 4️⃣ Recruiter Profile (3 requests)
│   ├── Get My Profile
│   ├── Update Profile
│   └── Upload Company Logo
│
├── 5️⃣ Jobs (5 requests)
│   ├── List All Jobs
│   ├── Get Single Job
│   ├── Create Job (Recruiter)
│   ├── Update Job (Recruiter)
│   └── Delete Job (Recruiter)
│
├── 6️⃣ Applications (4 requests)
│   ├── Apply to Job (Job Seeker)
│   ├── My Applications (Job Seeker)
│   ├── View Job Applications (Recruiter)
│   └── Update Application Status (Recruiter)
│
└── 7️⃣ Testing & Debug (2 requests)
    ├── Test Rate Limiting
    └── Health Check
```

---

## 🚀 How to Test (Step-by-Step)

### Step 1: Start the Server

```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Step 2: Check Health

In Postman:
1. Open **7. Testing & Debug → Health Check**
2. Click **Send**
3. Should return Swagger UI HTML (200 OK)

✅ Server is running!

### Step 3: Register Users

#### Register Job Seeker:
1. Open **1. Authentication → Register Job Seeker**
2. Click **Send**
3. Should get **201 Created**
4. Email is auto-saved to environment variable

#### Register Recruiter:
1. Open **1. Authentication → Register Recruiter**
2. Click **Send**
3. Should get **201 Created**

### Step 4: Login and Get Tokens

#### Login as Job Seeker:
1. Open **1. Authentication → Login Job Seeker**
2. Click **Send**
3. **Access token is automatically saved** to environment
4. Check response for `access` and `refresh` tokens

#### Login as Recruiter:
1. Open **1. Authentication → Login Recruiter**
2. Click **Send**
3. **Recruiter token is automatically saved**

✅ You're now authenticated!

### Step 5: Test OTP Features

#### Request OTP:
1. Open **2. OTP & Email Verification → Request OTP**
2. Note: `debug: true` returns OTP in response
3. Click **Send**
4. **OTP code is automatically saved** to environment
5. Copy the OTP code from response

#### Verify OTP:
1. Open **2. OTP & Email Verification → Verify OTP**
2. The OTP code is auto-filled from previous request
3. Click **Send**
4. Should return success message

### Step 6: Manage Profiles

#### Update Job Seeker Profile:
1. Login as Job Seeker first
2. Open **3. Job Seeker Profile → Update Profile**
3. Modify the JSON body as needed
4. Click **Send**

#### Upload Profile Picture:
1. Open **3. Job Seeker Profile → Upload Profile Picture**
2. In Body → form-data → picture → Select File
3. Choose an image file
4. Click **Send**

### Step 7: Create and Manage Jobs (Recruiter)

#### Create a Job:
1. Make sure you're logged in as Recruiter
2. Open **5. Jobs → Create Job**
3. The request uses `{{recruiter_token}}`
4. Click **Send**
5. **Job ID is automatically saved**

#### View All Jobs:
1. Open **5. Jobs → List All Jobs**
2. Try query parameters:
   - Enable `search` and set value: "python"
   - Enable `job_type` and set: "full_time"
3. Click **Send**

### Step 8: Apply to Jobs (Job Seeker)

#### Apply to Job:
1. Login as Job Seeker
2. Open **6. Applications → Apply to Job**
3. In Body → form-data → resume → Select File
4. Choose a PDF/DOC file
5. Click **Send**

#### View My Applications:
1. Open **6. Applications → My Applications**
2. Click **Send**
3. See all your applications

### Step 9: Manage Applications (Recruiter)

#### View Applications for Job:
1. Login as Recruiter
2. Open **6. Applications → View Job Applications**
3. Set `:job_id` in URL to your job ID
4. Click **Send**

#### Update Application Status:
1. Open **6. Applications → Update Application Status**
2. Change status in body to "under_review"
3. Click **Send**

---

## 🔧 Using Environment Variables

The collection uses variables that are **automatically saved**:

| Variable | Description | Auto-Saved? |
|----------|-------------|-------------|
| `base_url` | API base URL | ✅ Pre-configured |
| `access_token` | Current access token | ✅ After login |
| `refresh_token` | Refresh token | ✅ After login |
| `job_seeker_token` | Job seeker token | ✅ After JS login |
| `recruiter_token` | Recruiter token | ✅ After R login |
| `otp_code` | OTP code (debug) | ✅ After OTP request |
| `job_id` | Created job ID | ✅ After job creation |

### View/Edit Variables:

1. Click **Environments** (left sidebar)
2. Select your environment
3. View and edit variables

---

## 🎨 Testing Scenarios

### Scenario 1: Complete Job Seeker Flow

1. ✅ Register Job Seeker
2. ✅ Login Job Seeker (saves token)
3. ✅ Request OTP for email verification
4. ✅ Verify OTP
5. ✅ Update Profile
6. ✅ Upload Profile Picture
7. ✅ View All Jobs
8. ✅ Apply to Job
9. ✅ View My Applications

### Scenario 2: Complete Recruiter Flow

1. ✅ Register Recruiter
2. ✅ Login Recruiter (saves token)
3. ✅ Update Recruiter Profile
4. ✅ Upload Company Logo
5. ✅ Create Job (saves job ID)
6. ✅ View Job Applications
7. ✅ Update Application Status
8. ✅ Update Job Details
9. ✅ Delete Job

### Scenario 3: Password Reset Flow

1. ✅ Request Password Reset OTP
2. ✅ Copy OTP from response
3. ✅ Reset Password with OTP
4. ✅ Login with new password

### Scenario 4: Test Security Features

1. ✅ Try login with wrong password 5 times
2. ✅ Account gets locked (423 Locked)
3. ✅ Wait 30 minutes or unlock via admin
4. ✅ Try accessing protected endpoints without token (401)
5. ✅ Try applying to same job twice (400 error)

---

## 📝 Request Examples

### Authentication Header

All protected requests automatically use:
```
Authorization: Bearer {{access_token}}
```

You don't need to add this manually!

### JSON Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### File Upload (Form Data)

- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `resume`: File (required)
  - `cover_letter`: File (optional)

### Query Parameters

Enable in Postman params tab:
```
?search=python&job_type=full_time&location=Remote
```

---

## ✅ Expected Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | User registered, Job created |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid data, validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission (wrong role) |
| 404 | Not Found | Resource doesn't exist |
| 423 | Locked | Account locked (too many attempts) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"

**Solution:**
1. Make sure you logged in
2. Check if token is saved: View environment variables
3. Token expires in 30 minutes - re-login if expired

### Issue: "403 Forbidden"

**Solution:**
- You're trying to access an endpoint with wrong role
- Example: Job Seeker trying to create a job
- Login with correct role

### Issue: "423 Locked"

**Solution:**
- Account is locked due to failed login attempts
- Wait 30 minutes or unlock via admin panel
- Don't keep trying wrong passwords!

### Issue: "File upload not working"

**Solution:**
1. Make sure Content-Type is `multipart/form-data`
2. Don't use JSON body for file uploads
3. Use form-data tab in Postman
4. Select file using file picker

### Issue: "Token not auto-saved"

**Solution:**
1. Check if environment is selected (top right)
2. Look at Tests tab in request - it has save script
3. Response must be successful (200/201)

---

## 🎯 Quick Test Commands (Alternative)

If you prefer command line testing:

### Using curl:

```bash
# Register
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","password_confirm":"Test123!","role":"job_seeker","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Use token (replace YOUR_TOKEN)
curl -X GET http://localhost:8000/profile/job-seeker/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Testing Checklist

Use this checklist to test all features:

### Authentication & Security
- [ ] Register Job Seeker
- [ ] Register Recruiter  
- [ ] Login Job Seeker
- [ ] Login Recruiter
- [ ] Refresh Token
- [ ] Logout
- [ ] Test rate limiting (5 failed logins)
- [ ] Test account locking

### OTP Features
- [ ] Request OTP (email verification)
- [ ] Verify OTP
- [ ] Request Password Reset OTP
- [ ] Reset Password with OTP

### Profile Management
- [ ] Get Job Seeker Profile
- [ ] Update Job Seeker Profile
- [ ] Upload Profile Picture
- [ ] Get Recruiter Profile
- [ ] Update Recruiter Profile
- [ ] Upload Company Logo

### Jobs
- [ ] List All Jobs
- [ ] Search Jobs
- [ ] Filter Jobs by type
- [ ] Get Single Job
- [ ] Create Job (Recruiter)
- [ ] Update Job (Recruiter)
- [ ] Delete Job (Recruiter)

### Applications
- [ ] Apply to Job (with resume)
- [ ] View My Applications (Job Seeker)
- [ ] View Job Applications (Recruiter)
- [ ] Update Application Status (Recruiter)
- [ ] Test duplicate application (should fail)

---

## 💡 Tips & Best Practices

1. **Test in Order**: Follow the collection structure from top to bottom

2. **Use Environments**: Save tokens and IDs automatically

3. **Check Tests Tab**: See auto-save scripts for each request

4. **Read Descriptions**: Each request has detailed description

5. **Enable Query Params**: Manually enable params you want to test

6. **Save Responses**: Right-click response → Save as example

7. **Use Collection Runner**: Test multiple requests sequentially

8. **Monitor Rate Limits**: Be aware of throttling limits

9. **Check Logs**: View application logs for errors
   ```bash
   tail -f logs/recruitment.log
   ```

10. **Use Swagger Too**: http://localhost:8000/ for interactive docs

---

## 🔄 Collection Runner

Test multiple requests automatically:

1. Click on **Collection** name
2. Click **Run** button
3. Select requests to run
4. Set **Iterations** (how many times)
5. Click **Run TGA Recruitment Platform**
6. View results

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/
- **ReDoc**: http://localhost:8000/redoc/
- **Admin Panel**: http://localhost:8000/admin/
- **HOW_TO_RUN.md**: Setup and running guide
- **IMPROVEMENTS_SUMMARY.md**: All features explained
- **API_ENDPOINTS.md**: Complete endpoint reference

---

## ✨ Summary

**You now have:**
- ✅ 40+ pre-configured API requests
- ✅ Automatic token management
- ✅ Complete testing scenarios
- ✅ File upload examples
- ✅ OTP testing with debug mode
- ✅ Environment variables
- ✅ Auto-save scripts

**Just:**
1. Import collection
2. Start server
3. Start testing!

---

**Happy Testing! 🚀**

---

**Last Updated:** 2025-11-12  
**Version:** 2.0.0  
**Collection:** TGA_Recruitment_Platform_Postman_Collection.json
