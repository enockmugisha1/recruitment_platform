# 🔷 Swagger API Testing Guide - For Beginners

**Your First Time Testing APIs with Swagger? This guide is for you!**

Swagger makes testing APIs super easy - no Postman needed! Everything runs in your browser.

---

## 🌐 Step 1: Open Swagger UI

### Start Your Server First:
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Then Open Swagger:
```
http://localhost:8000/
```

**You'll see a beautiful page with all your API endpoints!** 🎉

---

## 👀 What You'll See on Swagger

### The Swagger UI has sections (colored boxes):

```
🟦 auth            → User authentication (register, login)
🟦 profile         → User profiles management
🟦 access          → Jobs and applications
```

Each section can be **expanded** by clicking on it.

---

## 🚀 Let's Test! (Follow These Steps)

### 📝 **Test 1: Register a New User** (No login needed)

#### Step 1: Find the Register Endpoint
1. Look for the **🟦 auth** section
2. Click to expand it
3. Find **POST /auth/register/** (green button)
4. Click on it to open

#### Step 2: Click "Try it out"
- You'll see a button that says **"Try it out"**
- Click it!
- The example JSON becomes editable

#### Step 3: Edit the Request Body
You'll see this JSON:
```json
{
  "email": "user@example.com",
  "password": "string",
  "password_confirm": "string",
  "role": "job_seeker",
  "first_name": "string",
  "last_name": "string"
}
```

**Change it to:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "role": "job_seeker",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Step 4: Click "Execute"
- Big blue **Execute** button at the bottom
- Click it!
- Wait a moment...

#### Step 5: See the Response
Scroll down to see:
- **✅ Response Code: 201** (Success! User created)
- **Response Body**: Your new user details

**Congratulations! You just created a user!** 🎉

---

### 🔑 **Test 2: Login to Get Your Token** (Important!)

#### Step 1: Find Login Endpoint
1. Still in **🟦 auth** section
2. Find **POST /auth/login/** (green button)
3. Click to expand

#### Step 2: Try it out
- Click **"Try it out"**

#### Step 3: Enter Login Details
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Step 4: Execute
- Click **Execute**

#### Step 5: Copy Your Token
You'll get a response like:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**📌 IMPORTANT: Copy the "access" token!**
- Select all the text in "access" (without quotes)
- Copy it (Ctrl+C or Cmd+C)
- Keep it somewhere - you'll need it!

---

### 🔐 **Test 3: Authorize (Use Your Token)**

Now you need to tell Swagger you're logged in!

#### Step 1: Find Authorize Button
- At the **TOP RIGHT** of Swagger page
- Look for a button: **🔓 Authorize**
- Click it!

#### Step 2: Enter Your Token
A popup opens:
1. Find the box that says **"Value"**
2. Type: `Bearer ` (yes, with a space after Bearer)
3. Paste your token after "Bearer "
4. Example: `Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`

#### Step 3: Click Authorize
- Click the **Authorize** button in the popup
- Then click **Close**

**🎉 You're now authenticated!** The lock icon changes to 🔒

---

### 👤 **Test 4: Get Your Profile** (Uses your token)

#### Step 1: Find Profile Endpoint
1. Go to **🟦 profile** section
2. Expand it
3. Find **GET /profile/job-seeker/** (blue button)
4. Click to expand

#### Step 2: Try it out
- Click **"Try it out"**
- No need to enter anything (it uses your token automatically!)

#### Step 3: Execute
- Click **Execute**

#### Step 4: See Your Profile
- **✅ Response Code: 200** (Success!)
- See your profile data in response

**Amazing! You just accessed a protected endpoint!** 🔒

---

### ✏️ **Test 5: Update Your Profile**

#### Step 1: Find Update Endpoint
1. Still in **🟦 profile** section
2. Find **PATCH /profile/job-seeker/** (orange button)
3. Click to expand

#### Step 2: Try it out
- Click **"Try it out"**

#### Step 3: Enter New Data
```json
{
  "location": "New York, USA",
  "bio": "I am a passionate software developer!",
  "phone": "+1234567890",
  "years_of_experience": 3
}
```

#### Step 4: Execute
- Click **Execute**
- **✅ Response Code: 200** (Profile updated!)

---

### 💼 **Test 6: View All Jobs** (Anyone can do this)

#### Step 1: Find Jobs Endpoint
1. Go to **🟦 access** section
2. Find **GET /access/jobs/** (blue button)
3. Click to expand

#### Step 2: Try it out
- Click **"Try it out"**

#### Step 3: (Optional) Add Search
In the parameters section, you can:
- **search**: Type "python" to search for Python jobs
- **job_type**: Select "full_time"
- **location**: Type "Remote"

#### Step 4: Execute
- Click **Execute**
- See all available jobs!

---

### 📧 **Test 7: Test OTP (Email Verification)**

#### Step 1: Request OTP
1. In **🟦 auth** section
2. Find **POST /auth/otp/request/** (green button)
3. Click "Try it out"

#### Step 2: Enter Email and Enable Debug
```json
{
  "email": "john@example.com",
  "purpose": "email_verification",
  "debug": true
}
```

**Note:** `debug: true` returns the OTP code in response (for testing)

#### Step 3: Execute
- Click **Execute**
- Copy the OTP code from response

#### Step 4: Verify OTP
1. Find **POST /auth/otp/verify/** (green button)
2. Click "Try it out"
3. Enter:
```json
{
  "email": "john@example.com",
  "otp_code": "YOUR_OTP_CODE_HERE",
  "purpose": "email_verification"
}
```
4. Click **Execute**
5. ✅ Email verified!

---

### 🆕 **Test 8: Register as Recruiter**

Let's create a recruiter account to test job creation!

#### Step 1: Logout First (Optional)
- Click **🔓 Authorize** button
- Click **Logout**
- Click **Close**

#### Step 2: Register Recruiter
1. Find **POST /auth/register/**
2. Click "Try it out"
3. Enter:
```json
{
  "email": "recruiter@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "role": "recruiter",
  "first_name": "Jane",
  "last_name": "Smith"
}
```
4. Click **Execute**
5. ✅ Recruiter created!

#### Step 3: Login as Recruiter
1. Find **POST /auth/login/**
2. Click "Try it out"
3. Enter recruiter email and password
4. Click **Execute**
5. **Copy the access token**

#### Step 4: Authorize as Recruiter
1. Click **🔓 Authorize**
2. Enter: `Bearer YOUR_RECRUITER_TOKEN`
3. Click **Authorize** then **Close**

---

### 💼 **Test 9: Create a Job** (Recruiter only)

#### Step 1: Find Create Job Endpoint
1. Go to **🟦 access** section
2. Find **POST /access/jobs/** (green button)
3. Click to expand

#### Step 2: Try it out
- Click **"Try it out"**

#### Step 3: Enter Job Details
```json
{
  "title": "Senior Python Developer",
  "description": "We are looking for an experienced Python developer",
  "requirements": "5+ years Python, Django experience",
  "location": "Remote",
  "job_type": "full_time",
  "salary_range": "$80,000 - $120,000",
  "deadline": "2025-12-31"
}
```

#### Step 4: Execute
- Click **Execute**
- ✅ Job created!
- Note the job ID in the response

---

### 📄 **Test 10: Apply to a Job** (Job Seeker only)

#### Step 1: Login as Job Seeker Again
1. Click **🔓 Authorize** → **Logout**
2. Login again with job seeker credentials
3. Copy token and authorize

#### Step 2: Find Apply Endpoint
1. In **🟦 access** section
2. Find **POST /access/my-applications/** (green button)
3. Click to expand

#### Step 3: Try it out
- Click **"Try it out"**

#### Step 4: Upload Resume
1. Scroll to **resume** field
2. Click **"Choose File"**
3. Select a PDF or DOC file from your computer
4. (Optional) Also upload cover_letter

#### Step 5: Add Job ID
In the request body, make sure to include the job ID:
```json
{
  "job": 1
}
```

#### Step 6: Execute
- Click **Execute**
- ✅ Application submitted!

---

## 📊 Understanding Response Codes

### ✅ Success Codes (Green):
- **200 OK** - Request successful
- **201 Created** - Resource created (like new user)
- **204 No Content** - Successful deletion

### ⚠️ Client Error Codes (Yellow/Orange):
- **400 Bad Request** - Invalid data (check your JSON)
- **401 Unauthorized** - Need to login/authorize
- **403 Forbidden** - You don't have permission
- **404 Not Found** - Resource doesn't exist

### ❌ Server Error (Red):
- **500 Internal Server Error** - Something wrong on server

---

## 💡 Swagger Pro Tips

### 1. **Always Authorize First**
- For protected endpoints (profile, create job, etc.)
- Use the 🔓 Authorize button
- Format: `Bearer YOUR_TOKEN`

### 2. **Read the Descriptions**
- Each endpoint has a description
- Shows what it does
- Shows what data is required

### 3. **Check the Models**
- Scroll to bottom of page
- See **"Models"** section
- Shows all data structures

### 4. **Use Try it Out**
- Makes the example editable
- Pre-fills with example data
- You just need to modify it

### 5. **Copy-Paste is Your Friend**
- Copy tokens easily
- Copy example JSON
- Modify and test

### 6. **Test in Order**
Follow this order:
1. Register → Login → Authorize
2. Then test other endpoints
3. This ensures you have permission

### 7. **Response Shows Everything**
- Request URL (what was sent)
- Response body (what came back)
- Response headers
- Response code

### 8. **File Uploads**
- Some endpoints need files (resume, pictures)
- Click "Choose File" button
- Select file from your computer
- Max file size: 5MB

---

## 🎯 Complete Testing Flow

### **Scenario 1: Job Seeker Journey**

```
1. Register Job Seeker
   POST /auth/register/
   
2. Login Job Seeker
   POST /auth/login/
   → Copy access token
   
3. Authorize
   🔓 Authorize → Enter token
   
4. Request OTP
   POST /auth/otp/request/
   → Copy OTP code (debug mode)
   
5. Verify OTP
   POST /auth/otp/verify/
   
6. View Profile
   GET /profile/job-seeker/
   
7. Update Profile
   PATCH /profile/job-seeker/
   
8. View All Jobs
   GET /access/jobs/
   
9. Apply to Job
   POST /access/my-applications/
   → Upload resume
   
10. View My Applications
    GET /access/my-applications/
```

### **Scenario 2: Recruiter Journey**

```
1. Register Recruiter
   POST /auth/register/
   
2. Login Recruiter
   POST /auth/login/
   → Copy token
   
3. Authorize
   🔓 Authorize → Enter token
   
4. Update Recruiter Profile
   PATCH /profile/recruiter/
   
5. Create Job
   POST /access/jobs/
   
6. View My Jobs
   GET /access/jobs/
   
7. View Applications for Job
   GET /access/jobs/{id}/applications/
   
8. Update Application Status
   PATCH /access/my-applications/{id}/
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized"
**Problem:** Not logged in or token expired

**Solution:**
1. Login again: POST /auth/login/
2. Copy new access token
3. Click 🔓 Authorize
4. Enter: `Bearer YOUR_NEW_TOKEN`

### Issue 2: "403 Forbidden"
**Problem:** Wrong role for this action

**Solution:**
- Job Seekers can't create jobs
- Recruiters can't apply to jobs
- Login with correct role

### Issue 3: Can't Upload File
**Problem:** Wrong field type

**Solution:**
1. Click "Try it out"
2. Find file field (resume, picture, etc.)
3. Click "Choose File" button
4. Don't type filename - select file!

### Issue 4: "400 Bad Request - Validation Error"
**Problem:** Invalid data format

**Solution:**
- Check password meets requirements (8+ chars, uppercase, digit)
- Email must be valid format
- Required fields must not be empty
- Check JSON format (commas, quotes)

### Issue 5: Token Not Working
**Problem:** Wrong token format

**Solution:**
- Must include "Bearer " before token
- Correct: `Bearer eyJ0eXAi...`
- Wrong: `eyJ0eXAi...` (missing Bearer)
- Wrong: `Bearer: eyJ0eXAi...` (colon)

---

## 📱 Swagger UI Features

### Search Bar
- Top of page
- Type endpoint name to find it quickly
- Example: Search "login" to find login endpoint

### Filter by Tag
- Click on section names (auth, profile, access)
- Shows only that section

### Models Section
- Bottom of page
- Shows data structure
- Example: User, Job, Application models

### Try All Methods
- **GET** (Blue) - Retrieve data
- **POST** (Green) - Create new data
- **PATCH** (Orange) - Update data
- **DELETE** (Red) - Delete data

---

## ✅ Testing Checklist

Use this to track your testing:

### Authentication
- [ ] Register Job Seeker
- [ ] Register Recruiter
- [ ] Login Job Seeker (copy token)
- [ ] Login Recruiter (copy token)
- [ ] Authorize with token
- [ ] Refresh token
- [ ] Logout

### OTP Features
- [ ] Request OTP (debug mode)
- [ ] Verify OTP
- [ ] Request password reset OTP
- [ ] Reset password with OTP

### Profiles
- [ ] Get Job Seeker profile
- [ ] Update Job Seeker profile
- [ ] Get Recruiter profile
- [ ] Update Recruiter profile

### Jobs
- [ ] List all jobs
- [ ] Search jobs
- [ ] Create job (as Recruiter)
- [ ] Update job (as Recruiter)

### Applications
- [ ] Apply to job (as Job Seeker)
- [ ] View my applications
- [ ] View job applications (as Recruiter)
- [ ] Update application status

---

## 🎓 Practice Exercise

Try this complete flow:

1. **Register two users:**
   - One Job Seeker
   - One Recruiter

2. **As Job Seeker:**
   - Login and authorize
   - Request and verify OTP
   - Update profile
   - View available jobs

3. **As Recruiter:**
   - Login and authorize (new token!)
   - Create a job posting
   - View the job

4. **As Job Seeker again:**
   - Login and authorize
   - Apply to the job created by recruiter
   - View your applications

5. **As Recruiter:**
   - View applications for your job
   - Update application status

**If you complete this, you've mastered Swagger testing!** 🏆

---

## 📞 Need Help?

- **Swagger UI stuck?** Refresh the page (F5)
- **Can't find endpoint?** Use search bar
- **Token not working?** Logout and login again
- **Response unclear?** Check response code and message
- **Still stuck?** Check logs: `tail -f logs/recruitment.log`

---

## 🎉 Congratulations!

You now know how to:
- ✅ Use Swagger UI
- ✅ Register and login users
- ✅ Authorize with JWT tokens
- ✅ Test all API endpoints
- ✅ Upload files
- ✅ Handle errors

**Keep practicing and you'll become a pro!** 🚀

---

**Swagger URL:** http://localhost:8000/

**Last Updated:** 2025-11-12  
**Version:** 2.0.0
