# 🔐 How to See OTP Codes Without Email - Testing Guide

## ✅ OTP is Now Visible in 3 Places!

When you request an OTP for password reset, you can see it in:

1. **Backend Terminal/Console** (Primary)
2. **Backend Logs File**
3. **API Response** (when DEBUG=True)
4. **Frontend Browser Console**

---

## 📍 Method 1: Backend Terminal (BEST FOR TESTING)

### Where to Look:
Look at the **terminal where the Django server is running** (where you ran `./quick_start.sh`)

### What You'll See:
```
============================================================
🔐 OTP CODE FOR: user@example.com
📧 PURPOSE: password_reset
🔢 CODE: 123456
⏰ EXPIRES: 15 minutes from now
============================================================
```

### Example:
```bash
# Terminal 1: Backend running
cd /home/enock/recruitment_platform
./quick_start.sh

# You'll see OTP here when requested!
```

---

## 📍 Method 2: Backend Logs

### Where to Look:
```bash
tail -f logs/recruitment.log
```

### What You'll See:
```
INFO 2025-12-09 14:21:30,123 views 🔐 OTP CODE for user@example.com (password_reset): 123456
```

### Real-time Monitoring:
```bash
# Open a new terminal
cd /home/enock/recruitment_platform
tail -f logs/recruitment.log | grep "OTP CODE"
```

---

## 📍 Method 3: API Response (When DEBUG=True)

### What You Get:
```json
{
  "message": "OTP sent successfully. Please check your email.",
  "otp_code": "123456"
}
```

### When This Works:
- ✅ When `DEBUG = True` in settings.py (your current setup)
- ✅ Automatically included in response
- ✅ No need to add `debug` parameter

---

## 📍 Method 4: Frontend Browser Console

### Where to Look:
1. Open browser (http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### What You'll See:
```javascript
🔐 OTP Code: 123456
```

### Also Shows as Toast Notification:
Blue info toast appears with: "OTP Code (testing): 123456"

---

## 🧪 Complete Testing Flow

### Step 1: Prepare to See OTP
```bash
# Terminal 1: Start backend and watch for OTP
cd /home/enock/recruitment_platform
./quick_start.sh

# Terminal 2: Watch logs in real-time
cd /home/enock/recruitment_platform
tail -f logs/recruitment.log | grep "OTP"
```

### Step 2: Request Password Reset
1. Visit: http://localhost:5173/forgot-password
2. Enter email: `john@gmail.com`
3. Click "Send Verification Code"

### Step 3: See OTP in Multiple Places

**Backend Terminal** (Terminal 1):
```
============================================================
🔐 OTP CODE FOR: john@gmail.com
📧 PURPOSE: password_reset
🔢 CODE: 123456
⏰ EXPIRES: 15 minutes from now
============================================================
```

**Logs** (Terminal 2):
```
INFO ... 🔐 OTP CODE for john@gmail.com (password_reset): 123456
```

**Browser Console** (F12):
```
🔐 OTP Code: 123456
```

**Toast Notification**:
Blue info message: "OTP Code (testing): 123456"

### Step 4: Use the OTP
1. Copy the OTP code from any of the above places
2. Enter it in the password reset form
3. Enter new password
4. Submit!

---

## 🔧 Backend Changes Made

### File: `users/views.py`

**OTP Request View** (Line ~347):
```python
# Log OTP to console for development/testing
from django.conf import settings
if settings.DEBUG:
    logger.info(f"🔐 OTP CODE for {email} ({purpose}): {otp_code}")
    print(f"\n{'='*60}")
    print(f"🔐 OTP CODE FOR: {email}")
    print(f"📧 PURPOSE: {purpose}")
    print(f"🔢 CODE: {otp_code}")
    print(f"⏰ EXPIRES: 15 minutes from now")
    print(f"{'='*60}\n")

# Always include OTP in response when DEBUG=True
"otp_code": otp_code if (request.data.get('debug') or settings.DEBUG) else None
```

**Registration View** (Line ~67):
```python
# Same logging added for registration OTP
if settings.DEBUG:
    logger.info(f"🔐 REGISTRATION OTP for {user.email}: {otp_code}")
    print(f"\n{'='*60}")
    print(f"🔐 REGISTRATION OTP FOR: {user.email}")
    print(f"🔢 CODE: {otp_code}")
    print(f"⏰ EXPIRES: 15 minutes from now")
    print(f"{'='*60}\n")
```

---

## 🚀 Quick Test Commands

### Test OTP Request via API:
```bash
curl -X POST http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@gmail.com",
    "purpose": "password_reset"
  }'

# Response includes OTP code:
# {"message": "OTP sent successfully...", "otp_code": "123456"}
```

### Check Backend Terminal:
The OTP will appear in a nice formatted box in your server terminal!

---

## 📊 OTP Visibility Matrix

| Location | Available When | Best For |
|----------|----------------|----------|
| **Backend Terminal** | Server running | ⭐ Primary testing method |
| **Backend Logs** | Always | Reviewing history |
| **API Response** | DEBUG=True | API testing |
| **Browser Console** | Frontend running | End-to-end testing |
| **Toast Notification** | Frontend running | Visual confirmation |

---

## 🎯 Production vs Development

### Development (Current Setup):
```python
# settings.py
DEBUG = True

# Result:
- ✅ OTP shown in terminal
- ✅ OTP logged to file
- ✅ OTP in API response
- ✅ OTP in browser console
```

### Production (Future):
```python
# settings.py
DEBUG = False

# Result:
- ❌ OTP NOT in terminal
- ❌ OTP NOT in logs
- ❌ OTP NOT in API response
- ✅ OTP sent via email only
```

### To Switch to Production Mode:
```python
# settings.py
DEBUG = False

# Configure email:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'

# Uncomment in views.py:
send_otp_email(email, otp_code, purpose)
```

---

## 🐛 Troubleshooting

### Issue: Not Seeing OTP in Terminal

**Check 1**: Is DEBUG=True?
```bash
cd /home/enock/recruitment_platform
grep "DEBUG = " recruitment_platform/settings.py
# Should show: DEBUG = True
```

**Check 2**: Is server running?
```bash
ps aux | grep runserver
# Should show python manage.py runserver
```

**Check 3**: Restart server
```bash
# Stop server (Ctrl+C)
# Start again
./quick_start.sh
```

### Issue: Not Seeing OTP in Logs

**Solution**: Check log file exists
```bash
ls -lh logs/recruitment.log
# If doesn't exist:
mkdir -p logs
touch logs/recruitment.log
```

### Issue: Not Seeing OTP in API Response

**Check**: Verify DEBUG mode
```bash
curl -s http://localhost:8000/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@gmail.com","purpose":"password_reset"}' \
  | python -m json.tool

# Should include "otp_code": "123456"
```

---

## 📝 Summary

### ✅ What Was Added:

1. **Console Printing**: Beautiful formatted OTP display in terminal
2. **Logger Output**: OTP logged to recruitment.log
3. **Always On in Debug**: OTP automatically included when DEBUG=True
4. **Multiple Visibility Points**: See OTP in 4 different places

### 🎯 Best Practice for Testing:

**Always watch the backend terminal!** It shows OTP in the most visible way:

```bash
# Terminal 1: Backend
cd /home/enock/recruitment_platform
./quick_start.sh

# When you request OTP, you'll see:
============================================================
🔐 OTP CODE FOR: user@example.com
📧 PURPOSE: password_reset  
🔢 CODE: 123456
⏰ EXPIRES: 15 minutes from now
============================================================
```

---

## 🎉 Ready to Test!

1. ✅ Start backend: `./quick_start.sh`
2. ✅ Start frontend: `cd Application-analyzer && npm run dev`
3. ✅ Visit: http://localhost:5173/forgot-password
4. ✅ Request OTP
5. ✅ **Look at backend terminal** - OTP is there! 🎯
6. ✅ Enter OTP and reset password

**No email needed for testing!** 🎉

---

**Updated**: December 9, 2025  
**Status**: ✅ OTP visible in 4 places during testing  
**Production Ready**: Just set DEBUG=False and configure email
