# 🚀 Render Frontend Configuration - COMPLETE GUIDE

## ✅ Problem Solved

**Issue**: Render was running `npm run dev` which only binds to localhost and isn't publicly accessible.

**Solution**: Added proper production start command that binds to `0.0.0.0` and uses Render's PORT variable.

---

## 📋 Render Dashboard Settings

### Go to your Frontend Service on Render Dashboard

**Service Name**: `recruitment-platform-faa8`

### Update These Settings:

#### 1️⃣ Root Directory
```
Application-analyzer
```

#### 2️⃣ Build Command
```bash
npm install --include=dev && npm run build
```

#### 3️⃣ Start Command (IMPORTANT - CHANGE THIS!)
```bash
npm run start
```
⚠️ **DO NOT USE**: `npm run dev` or `npm run preview` alone

#### 4️⃣ Environment Variables
Click "Environment" tab and add/update:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://recruitment-backend-5wpy.onrender.com` |
| `NODE_VERSION` | `18` (optional) |

---

## 🔧 What Changed in Code

### 1. Updated `vite.config.ts`
- Preview server now binds to `0.0.0.0` (publicly accessible)
- Uses Render's PORT environment variable (defaults to 10000)
- Added `strictPort` for production reliability

### 2. Updated `package.json`
Added new `start` script:
```json
"start": "vite preview --host 0.0.0.0 --port $PORT"
```

### 3. Created `render.yaml` (Optional)
Configuration file for automated Render deployments

---

## 🎯 How It Works

1. **Build Phase**: 
   - `npm install --include=dev` → Installs all dependencies
   - `npm run build` → Creates production build in `dist/` folder

2. **Start Phase**:
   - `npm run start` → Runs `vite preview` on `0.0.0.0:$PORT`
   - Render sets `PORT` environment variable (usually 10000)
   - Server is publicly accessible on your Render URL

---

## 🔄 Deploy Steps

### Option 1: Manual Update (Recommended)
1. Go to Render Dashboard → Your Frontend Service
2. Click **Settings**
3. Change "Start Command" to: `npm run start`
4. Click **Save Changes**
5. Click **Manual Deploy** → Deploy latest commit

### Option 2: Using render.yaml (Automatic)
1. Push changes to Git (render.yaml is included)
2. Render will auto-detect and use these settings
3. Auto-deploy on every push to main branch

---

## ✅ Verification Steps

After deployment completes:

1. **Check Deployment Logs**
   - Should see: `➜  Network: http://0.0.0.0:10000/`
   - NOT: `➜  Local: http://localhost:5173/`

2. **Visit Your URL**
   - Open: https://recruitment-platform-faa8.onrender.com
   - Should load your React app

3. **Test API Connection**
   - Open browser DevTools (F12) → Network tab
   - Try to login/register
   - Check API calls go to: `https://recruitment-backend-5wpy.onrender.com`

---

## 🐛 Troubleshooting

### If site doesn't load:
1. Check Render logs for errors
2. Verify Start Command is: `npm run start`
3. Check PORT is being set by Render (should see in logs)

### If build fails:
1. Ensure Build Command includes: `--include=dev`
2. Check all files are committed to Git
3. Review build logs for specific errors

### If API calls fail:
1. Check `VITE_API_BASE_URL` environment variable
2. Verify backend CORS includes your frontend URL
3. Check browser console for CORS errors

---

## 📝 Commands Reference

### Local Development
```bash
cd Application-analyzer
npm install
npm run dev          # Development server (localhost:5173)
```

### Production Build & Test
```bash
npm install --include=dev
npm run build        # Build for production
npm run start        # Test production build locally
```

### Using with production backend locally
```bash
# .env is already set to production backend
npm run dev
# Will connect to: https://recruitment-backend-5wpy.onrender.com
```

---

## 🔐 Security Notes

- Frontend is set to use production backend
- CORS is configured on backend
- API calls use HTTPS
- Environment variables managed by Render

---

## 📊 Expected Output (Render Logs)

✅ **Correct Output:**
```
==> Running 'npm run start'
> aa-frontend@0.0.0 start
> vite preview --host 0.0.0.0 --port $PORT

  ➜  Network: http://0.0.0.0:10000/
```

❌ **Wrong Output (if using npm run dev):**
```
==> Running 'npm run dev'
> aa-frontend@0.0.0 dev
> vite

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.22.4.40:5173/
```

---

## 🎉 Success Checklist

- [x] Build completes successfully
- [x] Start command uses production server
- [x] Server binds to 0.0.0.0 (public)
- [x] Environment variables set
- [ ] Frontend loads at your Render URL
- [ ] API calls reach backend successfully
- [ ] Login/Register functionality works

---

**Status**: Ready for deployment! 🚀
**Last Updated**: 2025-12-17
