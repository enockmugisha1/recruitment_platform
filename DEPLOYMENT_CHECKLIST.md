# 🚀 Backend-Frontend Connection Checklist

## ✅ Changes Made

### Backend Configuration (Django)
- ✓ Added `https://recruitment-platform-faa8.onrender.com` to `CORS_ALLOWED_ORIGINS`
- ✓ Updated `ALLOWED_HOSTS` to include `*.onrender.com`
- ✓ CORS middleware already configured in settings.py

### Frontend Configuration (React/Vite)
- ✓ Updated `VITE_API_BASE_URL` to `https://recruitment-backend-5wpy.onrender.com`
- ✓ Changed from local development to production backend

---

## 📋 Deployment Steps

### Step 1: Deploy Backend on Render
1. Go to your Render dashboard
2. Select your backend service: `recruitment-backend-5wpy`
3. Click on **Environment** tab
4. Ensure these variables are set:
   ```
   SECRET_KEY=<your-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=recruitment-backend-5wpy.onrender.com,*.onrender.com
   DATABASE_URL=<your-postgres-url>
   ```
5. Click **Manual Deploy** or push changes to trigger auto-deploy

### Step 2: Deploy Frontend on Render
1. Go to your Render dashboard
2. Select your frontend service: `recruitment-platform-faa8`
3. Click on **Environment** tab
4. Add/Update this variable:
   ```
   VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com
   ```
5. Update Build Command:
   ```
   npm install && npm run build
   ```
6. Update Start Command (choose one):
   ```
   npm run preview
   ```
   OR
   ```
   npx serve -s dist -l 10000
   ```
7. Click **Manual Deploy** or push changes to trigger auto-deploy

### Step 3: Test the Connection
1. Open your frontend: https://recruitment-platform-faa8.onrender.com
2. Open browser DevTools (F12) > Network tab
3. Try to login or register
4. Check if API calls are going to: `https://recruitment-backend-5wpy.onrender.com`
5. Verify no CORS errors in console

---

## 🔧 Quick Commands

### To test locally with production backend:
```bash
cd Application-analyzer
npm run dev
# Frontend will connect to: https://recruitment-backend-5wpy.onrender.com
```

### To switch back to local backend:
Edit `Application-analyzer/.env`:
```env
# Production - Render Backend
# VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com

# Development - Local Backend
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🐛 Troubleshooting

### If you get CORS errors:
1. Check backend logs on Render
2. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
3. Ensure `corsheaders` middleware is enabled (already done)

### If API calls fail:
1. Check if backend is running: https://recruitment-backend-5wpy.onrender.com/admin
2. Verify environment variable `VITE_API_BASE_URL` on Render frontend
3. Check browser console for exact error messages

### If frontend doesn't load:
1. Check Render frontend logs
2. Verify build succeeded
3. Check if port 10000 is used in start command

---

## 📝 Important URLs

- **Backend API**: https://recruitment-backend-5wpy.onrender.com
- **Frontend App**: https://recruitment-platform-faa8.onrender.com
- **Backend Admin**: https://recruitment-backend-5wpy.onrender.com/admin
- **API Docs**: https://recruitment-backend-5wpy.onrender.com/swagger

---

## 🔐 Security Notes

1. Never commit `.env` files with production secrets
2. Use Render's environment variables for sensitive data
3. Keep `DEBUG=False` in production
4. Use strong `SECRET_KEY` for production

---

## ✨ Next Steps

After deployment:
1. Test user registration
2. Test user login
3. Test job posting (recruiter)
4. Test job applications (job seeker)
5. Verify email notifications (if configured)

---

**Status**: Ready for deployment ✅
**Last Updated**: 2025-12-17
