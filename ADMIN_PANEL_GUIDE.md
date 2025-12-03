# 👨‍💼 Admin Panel Access & Features Guide

Complete guide to accessing and using the Django Admin Panel for TGA Recruitment Platform.

---

## 🔐 Step 1: Access the Admin Panel

### Admin URL:
```
http://localhost:8000/admin/
```

Or if running on a server:
```
http://YOUR_SERVER_IP:8000/admin/
```

---

## 👤 Step 2: Login with Superuser Account

### Your Current Superuser:
- **Email**: `kgn@gmail.com`
- **Status**: ✅ Superuser (Full access)

### How to Login:
1. Open browser: `http://localhost:8000/admin/`
2. Enter email: `kgn@gmail.com`
3. Enter password (the one you set when creating superuser)
4. Click **"Log in"**

---

## 🆘 If You Forgot Your Password

### Option 1: Reset Password via Command Line
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py changepassword kgn@gmail.com
```

You'll be prompted to enter a new password twice.

### Option 2: Create New Superuser
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py createsuperuser
```

Then follow the prompts:
- Email: `your_new_admin@example.com`
- Password: (enter a strong password)
- Password (again): (confirm)

---

## 🎛️ What You'll See in Admin Panel

After logging in, you'll see the **Django Administration** page with these sections:

### 📦 Available Sections

```
┌─────────────────────────────────────────────────────────┐
│ Django Administration                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 👥 AUTHENTICATION AND AUTHORIZATION                     │
│    ├── Groups                                           │
│    └── Permissions                                      │
│                                                         │
│ 🏢 PROFILES                                             │
│    ├── Job Seeker Profiles                             │
│    └── Recruiter Profiles                              │
│                                                         │
│ 💼 ACCESS                                               │
│    ├── Jobs                                             │
│    └── Applications                                     │
│                                                         │
│ 👤 USERS                                                │
│    ├── My Users                                         │
│    └── OTPs (One-Time Passwords)                       │
│                                                         │
│ 🔧 AUTHTOKEN (Django Rest Framework)                    │
│    └── Tokens                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Admin Features Available

### 1. 👥 User Management

**Path**: Users → My Users

**What You Can Do:**
- ✅ View all registered users
- ✅ Search users by email, name, or role
- ✅ Filter users by:
  - Role (Job Seeker / Recruiter)
  - Email verification status
  - Staff status
  - Active status
  - Date joined
- ✅ Verify user emails manually
- ✅ Lock/Unlock user accounts
- ✅ Edit user details
- ✅ Delete users
- ✅ View user's last login IP
- ✅ View failed login attempts

**Enhanced Features:**
- 🎨 **Color-coded status indicators**:
  - 🟢 Green: Active, verified users
  - 🔴 Red: Locked accounts
  - ⚠️ Orange: Unverified emails
- 🔍 **Advanced search**: By email, first name, last name
- 📊 **Bulk actions**: Select multiple users and:
  - Verify their emails
  - Lock accounts
  - Unlock accounts

#### How to Manage Users:

**View All Users:**
1. Click "Users" → "My Users"
2. See complete list with status

**Search for a User:**
1. Use search box at top right
2. Type email or name
3. Press Enter

**Filter Users:**
1. Use filter sidebar on the right
2. Select criteria (e.g., "Job Seeker", "Email verified")
3. Results update automatically

**Verify a User's Email:**
1. Find the user in the list
2. Check the box next to their name
3. Select "Verify emails" from dropdown
4. Click "Go"
5. ✅ User email is now verified!

**Lock an Account:**
1. Find the user
2. Check the box
3. Select "Lock selected accounts"
4. Click "Go"
5. 🔒 Account is locked for 30 minutes

**Unlock an Account:**
1. Find the locked user (shows red indicator)
2. Check the box
3. Select "Unlock selected accounts"
4. Click "Go"
5. ✅ Account is unlocked immediately

**Edit a User:**
1. Click on the user's email
2. Edit fields as needed
3. Click "Save"

**Delete a User:**
1. Click on user's email
2. Scroll to bottom
3. Click "Delete" button
4. Confirm deletion

---

### 2. 🔐 OTP Management

**Path**: Users → OTPs

**What You Can Do:**
- ✅ View all OTP requests
- ✅ See which OTPs are used/unused
- ✅ Check OTP expiration status
- ✅ Filter by:
  - Purpose (email verification, password reset, 2FA)
  - Used status
  - Creation date
  - Expiration date
- ✅ Delete expired OTPs in bulk
- ✅ View user's IP address when OTP was requested

**Enhanced Features:**
- 🎨 **Color-coded validity**:
  - 🟢 Green: Valid, unused OTP
  - 🔴 Red: Expired or used OTP
- 🔒 **Read-only**: Cannot create/edit OTPs (security)
- 🗑️ **Bulk delete**: Clean up expired OTPs

#### How to Manage OTPs:

**View All OTPs:**
1. Click "Users" → "OTPs"
2. See all OTP requests

**Filter Valid OTPs:**
1. Use filter sidebar
2. Select "Not used" under "Is used"
3. See only active OTPs

**Delete Expired OTPs:**
1. Select expired OTPs (red indicator)
2. Choose "Delete selected OTPs"
3. Click "Go"
4. Confirm deletion

**View User's OTP History:**
1. Click on an OTP entry
2. See:
   - User email
   - Purpose (email verification, password reset)
   - Creation time
   - Expiration time
   - Used status
   - IP address

---

### 3. 🏢 Profile Management

#### Job Seeker Profiles

**Path**: Profiles → Job Seeker Profiles

**What You Can Do:**
- ✅ View all job seeker profiles
- ✅ See profile completeness
- ✅ View resumes and documents
- ✅ Edit profile information
- ✅ Delete profiles
- ✅ Search by name or location
- ✅ View years of experience

**Fields You Can See/Edit:**
- User (linked to user account)
- Phone number
- Location
- Bio/Description
- Years of experience
- Profile picture
- Skills (if added)
- Education (if added)
- Experience (if added)

#### Recruiter Profiles

**Path**: Profiles → Recruiter Profiles

**What You Can Do:**
- ✅ View all recruiter profiles
- ✅ See company information
- ✅ View company logos
- ✅ Edit recruiter details
- ✅ Delete profiles
- ✅ Search by company name

**Fields You Can See/Edit:**
- User (linked to user account)
- Company name
- Company description
- Company website
- Company logo
- Location
- Phone number

---

### 4. 💼 Job Management

**Path**: Access → Jobs

**What You Can Do:**
- ✅ View all job postings
- ✅ Filter by:
  - Job type (Full-time, Part-time, Contract, etc.)
  - Status (Active/Closed)
  - Location
  - Date posted
  - Recruiter
- ✅ Search jobs by title or description
- ✅ Edit job details
- ✅ Delete jobs
- ✅ See application count for each job
- ✅ View job deadlines

**Enhanced Features:**
- 📊 See how many applications each job has
- 🔍 Advanced search and filtering
- 📅 Sort by deadline, creation date
- 👤 See which recruiter posted the job

#### How to Manage Jobs:

**View All Jobs:**
1. Click "Access" → "Jobs"
2. See complete job list

**Filter Jobs:**
1. Use filter sidebar
2. Select criteria (job type, location)
3. View filtered results

**Edit a Job:**
1. Click on job title
2. Edit fields
3. Click "Save"

**Delete a Job:**
1. Click on job title
2. Scroll to bottom
3. Click "Delete"
4. Confirm

**View Applications for a Job:**
1. Click on job title
2. Scroll down
3. See "Applications" section
4. Or go to Access → Applications and filter by job

---

### 5. 📄 Application Management

**Path**: Access → Applications

**What You Can Do:**
- ✅ View all job applications
- ✅ Filter by:
  - Status (Pending, Under Review, Accepted, Rejected)
  - Job
  - Applicant
  - Application date
- ✅ Change application status
- ✅ View submitted resumes
- ✅ View cover letters
- ✅ See application timestamps
- ✅ Delete applications

**Application Statuses:**
- 📝 Pending
- 👀 Under Review
- ✅ Accepted
- ❌ Rejected

#### How to Manage Applications:

**View All Applications:**
1. Click "Access" → "Applications"
2. See complete list

**Filter by Status:**
1. Use filter sidebar
2. Select status (e.g., "Pending")
3. View filtered applications

**Change Application Status:**
1. Click on an application
2. Change "Status" dropdown
3. Click "Save"

**Download Resume:**
1. Click on an application
2. Find "Resume" field
3. Click the link to download

**View Cover Letter:**
1. Click on application
2. Find "Cover Letter" field
3. Click the link to view/download

**Bulk Status Update:**
1. Select multiple applications
2. Choose action from dropdown
3. Click "Go"

---

## 🎨 Admin Interface Features

### Color-Coded Indicators

#### User Status:
- 🟢 **Green badge**: Active, verified user
- 🔴 **Red badge**: Locked account
- ⚠️ **Orange badge**: Unverified email
- ⚪ **Gray badge**: Inactive account

#### OTP Status:
- 🟢 **Green**: Valid, can be used
- 🔴 **Red**: Expired or already used

### Search Capabilities

**Available in:**
- Users: Search by email, first name, last name
- Jobs: Search by title, description
- Profiles: Search by name, company
- Applications: Search by applicant or job

### Filter Sidebars

**Each section has filters like:**
- Date ranges (creation date, deadline)
- Status (active, locked, verified)
- Role/Type (job seeker, recruiter, job type)
- Boolean flags (is staff, is active)

### Bulk Actions

**Available actions:**
- Verify emails (users)
- Lock/Unlock accounts (users)
- Delete expired OTPs
- Change application status (multiple)
- Delete multiple records

---

## 🔒 Admin Permissions

### What Superusers Can Do:
- ✅ **Everything** - Full access to all features
- ✅ Create, read, update, delete all data
- ✅ Manage other admin users
- ✅ Change any setting
- ✅ Access Django shell
- ✅ Run management commands

### What Staff Users Can Do:
- ✅ Access admin panel
- ✅ View data they have permission for
- ❌ Cannot manage other admins
- ❌ Limited by assigned permissions

---

## 🎯 Common Admin Tasks

### Task 1: Verify a New User's Email
```
1. Go to Users → My Users
2. Find user by email
3. Check the box next to their name
4. Select "Verify emails" action
5. Click "Go"
✅ Done!
```

### Task 2: Unlock a Locked Account
```
1. Go to Users → My Users
2. Filter by account status (show locked)
3. Check the box next to user
4. Select "Unlock selected accounts"
5. Click "Go"
✅ Account unlocked!
```

### Task 3: Review Pending Applications
```
1. Go to Access → Applications
2. Filter by status: "Pending"
3. Click on application to review
4. Download and review resume
5. Change status to appropriate state
6. Click "Save"
✅ Application reviewed!
```

### Task 4: Delete Expired OTPs
```
1. Go to Users → OTPs
2. Filter by validity (show expired)
3. Select all expired OTPs
4. Choose "Delete selected OTPs"
5. Click "Go"
6. Confirm deletion
✅ Cleanup complete!
```

### Task 5: View User Activity
```
1. Go to Users → My Users
2. Click on user's email
3. View:
   - Last login date
   - Last login IP
   - Failed login attempts
   - Account lock status
✅ Activity reviewed!
```

---

## 📊 Admin Dashboard Tips

### Best Practices:

1. **Regular Monitoring:**
   - Check failed login attempts daily
   - Review locked accounts weekly
   - Clean up expired OTPs monthly

2. **User Management:**
   - Verify legitimate users promptly
   - Investigate suspicious activity
   - Keep account locks reasonable

3. **Application Processing:**
   - Review pending applications regularly
   - Keep applicants informed via status updates
   - Archive old applications

4. **Security:**
   - Monitor OTP usage patterns
   - Check for unusual IP addresses
   - Lock suspicious accounts immediately

5. **Performance:**
   - Delete expired OTPs regularly
   - Archive old applications
   - Keep data clean

---

## 🚀 Quick Admin Commands

### Create Additional Superuser:
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py createsuperuser
```

### Change Password:
```bash
python manage.py changepassword email@example.com
```

### List All Superusers:
```bash
python manage.py shell
>>> from users.models import MyUser
>>> MyUser.objects.filter(is_superuser=True).values('email', 'is_staff')
>>> exit()
```

### Make Existing User a Superuser:
```bash
python manage.py shell
>>> from users.models import MyUser
>>> user = MyUser.objects.get(email='user@example.com')
>>> user.is_superuser = True
>>> user.is_staff = True
>>> user.save()
>>> exit()
```

### Remove Superuser Status:
```bash
python manage.py shell
>>> from users.models import MyUser
>>> user = MyUser.objects.get(email='user@example.com')
>>> user.is_superuser = False
>>> user.is_staff = False
>>> user.save()
>>> exit()
```

---

## 🔧 Troubleshooting Admin Access

### Issue 1: "You don't have permission to access admin"

**Solution:**
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py shell

from users.models import MyUser
user = MyUser.objects.get(email='your_email@example.com')
user.is_staff = True
user.is_superuser = True
user.save()
print(f"User {user.email} is now: Staff={user.is_staff}, Superuser={user.is_superuser}")
exit()
```

### Issue 2: "Forgot admin password"

**Solution:**
```bash
cd /home/enock/recruitment_platform
source env/bin/activate
python manage.py changepassword kgn@gmail.com
# Enter new password twice
```

### Issue 3: "Admin page shows 404 error"

**Check:**
1. Server is running: `python manage.py runserver`
2. Correct URL: `http://localhost:8000/admin/` (with trailing slash)
3. Admin URLs are enabled in `recruitment_platform/urls.py`

### Issue 4: "Cannot see user management section"

**Solution:**
Make sure user is both staff AND superuser:
```bash
python manage.py shell
>>> from users.models import MyUser
>>> user = MyUser.objects.get(email='your_email')
>>> user.is_staff = True
>>> user.is_superuser = True
>>> user.save()
```

---

## 📱 Admin Panel Screenshots Guide

### What to Expect:

**Login Page:**
- Simple form with email and password fields
- "Log in" button
- Django branding at top

**Dashboard:**
- Clean, organized sections
- Links to all models
- "View site" link at top right
- Your username at top right with logout option

**User List:**
- Table view with columns
- Search box at top
- Filter sidebar on right
- Action dropdown above table
- Pagination at bottom

**Detail Pages:**
- Form fields for editing
- "Save" buttons (Save, Save and continue, Save and add another)
- "Delete" button at bottom
- History of changes at bottom

---

## ✅ Admin Checklist

Before using admin panel, make sure:

- [ ] Server is running (`python manage.py runserver`)
- [ ] You have superuser credentials
- [ ] Database migrations are applied
- [ ] You can access `http://localhost:8000/admin/`
- [ ] You're logged in with superuser account

After logging in, you should be able to:

- [ ] See all management sections
- [ ] View users list
- [ ] View OTPs
- [ ] View profiles
- [ ] View jobs
- [ ] View applications
- [ ] Perform bulk actions
- [ ] Use search and filters

---

## 🎓 Learn More

### Django Admin Documentation:
- Official docs: https://docs.djangoproject.com/en/4.2/ref/contrib/admin/
- Admin actions: https://docs.djangoproject.com/en/4.2/ref/contrib/admin/actions/

### Your Project Documentation:
- `IMPROVEMENTS_SUMMARY.md` - Overview of admin features
- `HOW_TO_RUN.md` - How to start the server
- `SETUP_GUIDE.md` - Production setup

---

## 📞 Need Help?

If you encounter issues:

1. **Check server logs:**
   ```bash
   tail -f logs/recruitment.log
   ```

2. **Verify superuser status:**
   ```bash
   python manage.py shell
   >>> from users.models import MyUser
   >>> MyUser.objects.filter(is_superuser=True)
   ```

3. **Reset admin password:**
   ```bash
   python manage.py changepassword kgn@gmail.com
   ```

4. **Check Django version:**
   ```bash
   python manage.py --version
   ```

---

**🎉 You're Ready to Use the Admin Panel!**

**Access it now:**
```
http://localhost:8000/admin/
```

**Login with:**
- Email: `kgn@gmail.com`
- Password: (your superuser password)

---

**Last Updated**: 2025-11-12  
**Django Version**: 4.2.26  
**Admin Panel**: Enhanced with custom features
