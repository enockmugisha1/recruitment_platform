# How to See OTP Codes - IMPROVED! 🔐

## ✨ NEW: OTP Display Modal

The platform now shows OTP codes directly in the frontend during development!

### When You'll See OTP Codes:

1. **Registration (Sign Up)**:
   - Fill in the signup form
   - Click "Sign Up"
   - A beautiful modal will appear showing your OTP code
   - The code is displayed in large, easy-to-read text
   - You can copy it with one click!

2. **Password Reset**:
   - Enter your email on "Forgot Password" page
   - Click "Request OTP"
   - Modal appears with your OTP code
   - Copy and use it in the next step

### Features of the New OTP Display:

✅ **Large, Prominent Display** - Can't miss it!
✅ **Copy to Clipboard** - One-click copy button
✅ **Countdown Timer** - See how much time you have left (15 minutes)
✅ **Instructions** - Clear steps on how to use the OTP
✅ **Console Logging** - Also logs to browser console
✅ **Development Notice** - Reminds you this is for testing only

### How It Looks:

```
╔════════════════════════════════════╗
║  🔐 OTP CODE (FOR TESTING)         ║
╠════════════════════════════════════╣
║                                    ║
║         CODE: 123456               ║
║         EMAIL: user@example.com    ║
║                                    ║
║   Valid for 15 minutes             ║
║                                    ║
╚════════════════════════════════════╝
```

## Alternative Methods (If Modal Doesn't Show)

### Method 1: Check Browser Console
1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to "Console" tab
3. Look for messages like:
   ```
   🔐 OTP Code: 123456
   ```

### Method 2: Check Backend Terminal
When you run the backend server:
```bash
python manage.py runserver
```

Look for output like:
```
============================================================
🔐 OTP CODE FOR: user@example.com
📧 PURPOSE: password_reset
🔢 CODE: 123456
⏰ EXPIRES: 15 minutes from now
============================================================
```

### Method 3: Toast Notifications
- After requesting OTP, check for green toast notifications
- They show the OTP code for 20 seconds
- Position: Top-center of screen

## Step-by-Step Testing Guide

### Testing Registration:
1. Go to http://localhost:5173/signup
2. Fill in all fields:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test1234!
   - Confirm Password: Test1234!
   - Role: job_seeker or recruiter
3. Click "Sign Up"
4. **🎉 OTP Modal appears!**
5. Copy the code or just remember it
6. You can now login (email verification optional in dev)

### Testing Password Reset:
1. Go to http://localhost:5173/forgot-password
2. Enter your email
3. Click "Request OTP"
4. **🎉 OTP Modal appears!**
5. Copy the code
6. Enter it in the "Enter OTP Code" field
7. Set your new password
8. Click "Reset Password"

## Troubleshooting

### ❌ OTP Modal Doesn't Appear

**Solution 1**: Check Browser Console
- Press F12
- Look for OTP code in console logs
- Look for any error messages

**Solution 2**: Check Backend Terminal
- OTP codes are always logged there
- Look for the colorful box with your code

**Solution 3**: Check Backend is Running
```bash
# Make sure this is running:
python manage.py runserver
```

**Solution 4**: Check DEBUG Mode
```python
# In settings.py, make sure:
DEBUG = True
```

### ❌ "Failed to send OTP" Error

**Causes**:
1. Backend not running
2. Email doesn't exist in database (for password reset)
3. Too many OTP requests (wait 2 minutes)

**Solution**:
```bash
# Check backend is running
curl http://localhost:8000/api/v1/auth/otp/request/

# For password reset, check user exists
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.filter(email='test@example.com').exists()
```

### ❌ OTP Says "Invalid or Expired"

**Causes**:
1. OTP expired (15 minutes passed)
2. Wrong code entered
3. OTP already used

**Solution**:
1. Request a new OTP
2. Make sure to copy the entire code (no spaces)
3. Use the most recent OTP code

## Quick Reference

| Action | Where to Find OTP |
|--------|------------------|
| Sign Up | Frontend Modal + Browser Console + Backend Terminal |
| Password Reset | Frontend Modal + Browser Console + Backend Terminal |
| Backend Logs | Terminal running `python manage.py runserver` |
| Browser Console | Press F12 → Console Tab |

## Example Workflow

```bash
# 1. Start backend
python manage.py runserver

# 2. Start frontend (in another terminal)
cd Application-analyzer
npm run dev

# 3. Open browser
http://localhost:5173/signup

# 4. Register
- Fill form
- Click Sign Up
- Modal shows: 🔐 OTP = 123456

# 5. Use OTP (optional in dev)
- Can login directly
- Or verify email with OTP
```

## Production vs Development

### Development (DEBUG=True):
✅ OTP shown in frontend modal
✅ OTP in API response
✅ OTP logged to console
✅ Easy testing

### Production (DEBUG=False):
❌ OTP NOT shown in frontend
❌ OTP NOT in API response
✅ OTP sent via email only
✅ Secure

---

**Updated**: 2025-12-19
**New Feature**: OTP Display Modal with Copy Button 🎉
**Status**: ✅ Super Easy to Use!
