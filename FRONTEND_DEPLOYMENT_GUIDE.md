# Frontend Deployment Guide (Render.com)

## Complete Guide: Deploy React Frontend & Connect to Backend

This guide covers deploying your React/Vite frontend on Render and connecting it to your Django backend.

---

## 📋 Prerequisites

- GitHub account with your frontend code pushed
- Render.com account (free tier works!)
- Backend already deployed on Render at: `https://recruitment-backend-5wpy.onrender.com`

---

## 🚀 Part 1: Deploy Frontend on Render

### Step 1: Prepare Your Frontend for Deployment

1. **Update the `.env` file** in `Application-analyzer/` directory:

```env
# Production Backend URL
VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com
```

2. **Commit and push to GitHub**:

```bash
cd /home/enock/recruitment_platform
git add Application-analyzer/.env
git commit -m "Update frontend to use production backend URL"
git push origin main
```

### Step 2: Create Static Site on Render

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Static Site"**

3. **Connect Your Repository**:
   - Connect your GitHub account if not already done
   - Select your repository: `recruitment_platform`

4. **Configure Build Settings**:
   ```
   Name: recruitment-frontend
   Branch: main
   Root Directory: Application-analyzer
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

5. **Add Environment Variable**:
   - Click "Advanced" → "Add Environment Variable"
   ```
   Key: VITE_API_BASE_URL
   Value: https://recruitment-backend-5wpy.onrender.com
   ```

6. **Click "Create Static Site"**

### Step 3: Wait for Deployment

Render will:
- Install dependencies (`npm install`)
- Build your app (`npm run build`)
- Deploy to a URL like: `https://recruitment-frontend.onrender.com`

This takes **3-5 minutes** ⏱️

---

## 🔗 Part 2: Connect Frontend to Backend

### Update Backend CORS Settings

Your backend needs to allow requests from the frontend domain.

1. **Update Django settings** (already in your code):

```python
# recruitment_platform/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://mohamdah-aa-frontend.netlify.app",
    "https://recruitment-frontend.onrender.com",  # Add your Render frontend URL
]
```

2. **Commit and push**:

```bash
git add recruitment_platform/settings.py
git commit -m "Add frontend URL to CORS allowed origins"
git push origin main
```

3. **Render will auto-deploy** your backend with the new settings ✅

---

## 🔧 Part 3: Alternative - Deploy on Netlify (Recommended for Static Sites)

Netlify is faster and has better free tier for static React apps!

### Deploy to Netlify

1. **Go to**: https://app.netlify.com

2. **Click "Add new site" → "Import an existing project"**

3. **Connect to GitHub**:
   - Authorize Netlify
   - Select your repository

4. **Configure Build Settings**:
   ```
   Base directory: Application-analyzer
   Build command: npm run build
   Publish directory: Application-analyzer/dist
   ```

5. **Add Environment Variables**:
   - Go to "Site settings" → "Environment variables"
   - Add:
     ```
     VITE_API_BASE_URL = https://recruitment-backend-5wpy.onrender.com
     ```

6. **Deploy site** - Get URL like: `https://your-app-name.netlify.app`

### Update Backend CORS (Netlify)

Add your Netlify URL to Django settings:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-app-name.netlify.app",  # Your Netlify URL
]
```

---

## 🧪 Part 4: Testing the Connection

### Test Locally First

1. **Update local `.env`** to test production backend:

```env
VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com
```

2. **Run frontend**:

```bash
cd Application-analyzer
npm run dev
```

3. **Test Features**:
   - ✅ User registration
   - ✅ Login/Logout
   - ✅ Job listings
   - ✅ Profile updates

### Test Production Deployment

1. **Visit your deployed frontend URL**
2. **Open browser console** (F12)
3. **Check for errors**:
   - CORS errors? → Update backend CORS settings
   - 404 errors? → Check API endpoint URLs
   - 500 errors? → Check backend logs on Render

---

## 🛠️ Common Issues & Solutions

### Issue 1: CORS Error

**Error**: `Access to fetch at 'https://...' has been blocked by CORS policy`

**Solution**:
```python
# backend settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-url.onrender.com",
]
CORS_ALLOW_CREDENTIALS = True
```

### Issue 2: API Calls Failing

**Error**: `Network Error` or `Failed to fetch`

**Solution**:
- Check frontend `.env` has correct `VITE_API_BASE_URL`
- Verify backend is running: Visit `https://recruitment-backend-5wpy.onrender.com/swagger/`
- Check backend environment variables on Render

### Issue 3: Authentication Not Working

**Error**: `401 Unauthorized`

**Solution**:
- Verify JWT tokens are being sent in headers
- Check `withCredentials: true` in axios config
- Ensure cookies/tokens are allowed in browser

### Issue 4: Build Fails on Render

**Error**: `npm ERR! code ELIFECYCLE`

**Solution**:
```bash
# Locally test build
cd Application-analyzer
npm run build

# If it works locally, check Render build logs
# Usually it's a dependency issue or Node version mismatch
```

---

## 📝 Environment Variables Summary

### Frontend (Render/Netlify)

```env
VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com
```

### Backend (Render)

```env
# Already set
ALLOWED_HOSTS=localhost,127.0.0.1,recruitment-backend-5wpy.onrender.com
USE_REDIS_CACHE=False
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=your-postgres-url
```

### Backend CORS Origins

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",                      # Local dev
    "http://localhost:5174",                      # Local dev alt
    "https://your-frontend.onrender.com",         # Render frontend
    # OR
    "https://your-app.netlify.app",              # Netlify frontend
]
```

---

## 🎯 Quick Deployment Checklist

- [ ] Frontend code pushed to GitHub
- [ ] `.env` updated with production backend URL
- [ ] Frontend deployed on Render/Netlify
- [ ] Frontend URL added to backend CORS settings
- [ ] Backend redeployed with new CORS settings
- [ ] Environment variables set on both platforms
- [ ] Test registration/login works
- [ ] Test all API endpoints
- [ ] Check browser console for errors

---

## 🚀 Deploy Now!

### Option A: Render (Both Frontend & Backend on same platform)

```bash
# 1. Update frontend .env
echo "VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com" > Application-analyzer/.env

# 2. Push to GitHub
git add .
git commit -m "Deploy frontend to Render"
git push origin main

# 3. Create Static Site on Render Dashboard
# Follow steps in Part 1 above
```

### Option B: Netlify (Recommended for Frontend)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build and deploy
cd Application-analyzer
netlify deploy --prod

# Follow prompts to link site and deploy
```

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs/static-sites
- **Netlify Docs**: https://docs.netlify.com/
- **Vite Build Docs**: https://vitejs.dev/guide/build.html
- **Django CORS**: https://pypi.org/project/django-cors-headers/

---

## 🎉 Success!

After following this guide:
- ✅ Frontend deployed and accessible
- ✅ Backend API connected
- ✅ Authentication working
- ✅ All features functional

**Your app is now live!** 🚀

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render/Netlify build logs
2. Check browser console (F12)
3. Check backend logs on Render
4. Verify environment variables are set correctly
5. Test API endpoints directly with Postman/Swagger

**Common mistake**: Forgetting to add frontend URL to backend CORS settings!
