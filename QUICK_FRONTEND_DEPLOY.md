# 🚀 Quick Frontend Deployment Guide

## Super Simple 3-Step Process

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Prepare Frontend (1 minute)

```bash
cd /home/enock/recruitment_platform
./deploy_frontend.sh
```

This script will:
- ✅ Install dependencies
- ✅ Update .env with production backend URL
- ✅ Build your frontend
- ✅ Test that everything works

---

### Step 2: Deploy to Netlify (2 minutes)

**Option A: Using Netlify Dashboard (Easiest)**

1. Go to: https://app.netlify.com/drop

2. Drag and drop the `Application-analyzer/dist` folder

3. **That's it!** You'll get a URL like: `https://random-name-123.netlify.app`

**Option B: Using Netlify CLI (For continuous deployment)**

```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd Application-analyzer
netlify deploy --prod
```

Follow prompts:
- Create new site? **Yes**
- Publish directory? **./dist**

You'll get a URL like: `https://your-site-name.netlify.app`

---

### Step 3: Update Backend CORS (2 minutes)

Add your frontend URL to backend settings:

```bash
cd /home/enock/recruitment_platform
```

Edit `recruitment_platform/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://mohamdah-aa-frontend.netlify.app",
    "https://your-site-name.netlify.app",  # ← ADD YOUR NEW URL HERE
]
```

Push to GitHub (triggers auto-redeploy):

```bash
git add recruitment_platform/settings.py
git commit -m "Add frontend URL to CORS"
git push origin main
```

---

## ✅ Test Your Deployment

1. Visit your frontend URL: `https://your-site-name.netlify.app`
2. Try to sign up a new user
3. Try to login
4. Check if you can see jobs

**If everything works - YOU'RE DONE!** 🎉

---

## 🔧 Alternative: Deploy on Render

If you prefer Render (same platform as backend):

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare frontend for Render deployment"
git push origin main
```

### 2. Create Static Site on Render

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:

```
Name: recruitment-frontend
Branch: main
Root Directory: Application-analyzer
Build Command: npm install && npm run build
Publish Directory: dist
```

5. Add Environment Variable:

```
VITE_API_BASE_URL = https://recruitment-backend-5wpy.onrender.com
```

6. Click **"Create Static Site"**

### 3. Get Your URL

After 3-5 minutes, you'll get: `https://recruitment-frontend.onrender.com`

### 4. Update Backend CORS

Same as Netlify - add the URL to `CORS_ALLOWED_ORIGINS`

---

## 📊 Comparison: Netlify vs Render

| Feature | Netlify | Render |
|---------|---------|--------|
| Speed | ⚡ Super Fast | 🐢 Slower (cold starts) |
| Free Tier | 100GB bandwidth | 100GB bandwidth |
| Build Time | 1-2 min | 3-5 min |
| Custom Domain | ✅ Free | ✅ Free |
| Auto Deploy | ✅ Yes | ✅ Yes |
| Best For | Static sites | Full-stack apps |

**Recommendation**: Use **Netlify** for frontend, **Render** for backend!

---

## 🆘 Troubleshooting

### Build Fails?

```bash
# Test build locally first
cd Application-analyzer
npm run build

# If it works locally, the issue is environment-specific
# Check Node.js version on deployment platform
```

### CORS Error?

```
Error: "Access-Control-Allow-Origin" header is missing
```

**Fix**: Add frontend URL to backend CORS settings (see Step 3)

### API Calls Not Working?

```
Error: Network Error or Failed to fetch
```

**Check**:
1. Backend is running: https://recruitment-backend-5wpy.onrender.com/swagger/
2. Frontend `.env` has correct `VITE_API_BASE_URL`
3. Browser console (F12) for detailed errors

### Environment Variable Not Working?

**Netlify**: 
- Go to: Site Settings → Environment Variables
- Add: `VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com`
- Redeploy: Deploys → Trigger deploy

**Render**:
- Go to: Environment tab
- Add variable
- Auto-redeploys

---

## 🎯 Complete Setup Summary

### Your URLs After Deployment

```
Frontend:  https://your-site-name.netlify.app
Backend:   https://recruitment-backend-5wpy.onrender.com
API Docs:  https://recruitment-backend-5wpy.onrender.com/swagger/
Admin:     https://recruitment-backend-5wpy.onrender.com/admin/
```

### Environment Variables

**Frontend (Netlify/Render)**:
```
VITE_API_BASE_URL=https://recruitment-backend-5wpy.onrender.com
```

**Backend (Render)**:
```
ALLOWED_HOSTS=localhost,127.0.0.1,recruitment-backend-5wpy.onrender.com
USE_REDIS_CACHE=False
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
```

---

## 🎓 Pro Tips

1. **Custom Domain**: Both Netlify and Render support custom domains for free!
2. **Automatic Deploys**: Connect GitHub for auto-deployment on push
3. **Preview Deploys**: Netlify creates preview URLs for pull requests
4. **Environment Management**: Keep different .env files for dev/staging/prod
5. **Build Optimization**: Use `npm run build` to test builds locally first

---

## 📚 Next Steps

After deployment:
- [ ] Test all features (signup, login, jobs, profile)
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Monitor performance and errors
- [ ] Set up CI/CD pipeline (optional)

---

## 🎉 You're Live!

Congratulations! Your full-stack recruitment platform is now deployed:

✅ Frontend: Deployed and accessible  
✅ Backend: Running and connected  
✅ Database: PostgreSQL on Render  
✅ API: Documented and tested  

**Share your app with the world!** 🌍

---

**Need help?** Check:
- Full guide: `FRONTEND_DEPLOYMENT_GUIDE.md`
- Backend setup: `RENDER_REDIS_FIX.md`
- API docs: `https://recruitment-backend-5wpy.onrender.com/swagger/`
