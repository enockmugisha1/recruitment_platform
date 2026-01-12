# 🚀 Quick Start - Local Development

## One-Command Start

### Terminal 1 - Backend
```bash
cd /home/enock/recruitment_platform && ./start_dev.sh
```

### Terminal 2 - Frontend
```bash
cd /home/enock/recruitment_platform/Application-analyzer && npm run dev
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Your user account |
| **Backend API** | http://localhost:8000 | N/A |
| **Admin Panel** | http://localhost:8000/admin/ | Superuser account |
| **API Docs** | http://localhost:8000/swagger/ | N/A |

---

## ⚙️ Configuration Summary

### ✅ Backend (Django) - Local PostgreSQL
```bash
Location: /home/enock/recruitment_platform/.env

USE_POSTGRESQL=True
DB_NAME=recruitment_db
DB_USER=recruitment_user
DB_PASSWORD=kingofkings
DB_HOST=localhost
DB_PORT=5432
```

### ✅ Frontend (React + Vite) - Points to Local Backend
```bash
Location: /home/enock/recruitment_platform/Application-analyzer/.env

VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

---

## 🗄️ Database Management

```bash
cd /home/enock/recruitment_platform

# Quick commands
./db_management.sh status    # Check database health
./db_management.sh backup    # Create backup
./db_management.sh migrate   # Run migrations
./db_management.sh shell     # Open PostgreSQL shell
./db_management.sh reset     # Fresh database setup
```

---

## 🔧 First-Time Setup

### 1. Setup Database
```bash
cd /home/enock/recruitment_platform
./setup_local_db.sh
```

### 2. Create Admin Account
```bash
source env/bin/activate
python manage.py createsuperuser
```

### 3. Install Frontend Dependencies
```bash
cd Application-analyzer
npm install
```

### 4. Start Everything
```bash
# Terminal 1 - Backend
cd /home/enock/recruitment_platform
./start_dev.sh

# Terminal 2 - Frontend
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev
```

---

## ✅ Verify Local Setup

### Backend Check
```bash
# Should show PostgreSQL with localhost
cd /home/enock/recruitment_platform
source env/bin/activate
python -c "from django.conf import settings; print(settings.DATABASES['default'])"
```

### Frontend Check
```bash
# Should show http://localhost:8000
cd /home/enock/recruitment_platform/Application-analyzer
grep VITE_API_BASE_URL .env
```

### Browser DevTools Check
1. Open http://localhost:5173
2. Press F12 (DevTools)
3. Go to Network tab
4. Try logging in
5. Verify requests go to `localhost:8000` (NOT render.com)

---

## 🐛 Quick Troubleshooting

### PostgreSQL Not Running
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Redis Not Running
```bash
sudo systemctl start redis-server
# or
sudo systemctl start redis
```

### Frontend Shows Old Data
```bash
# Hard refresh browser
Ctrl + Shift + R
```

### Database Connection Error
```bash
cd /home/enock/recruitment_platform
./db_management.sh status
# If fails:
./setup_local_db.sh
```

---

## 📊 Architecture

```
┌──────────────────────┐
│  Browser (Frontend)  │
│   localhost:5173     │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│   Django API         │
│   localhost:8000     │
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│   PostgreSQL         │
│   localhost:5432     │
│   recruitment_db     │
└──────────────────────┘
```

---

## 🔄 Daily Workflow

### Morning Startup
```bash
# Terminal 1
cd /home/enock/recruitment_platform
./start_dev.sh

# Terminal 2
cd /home/enock/recruitment_platform/Application-analyzer
npm run dev
```

### Evening Shutdown
```bash
# In each terminal: Ctrl + C
```

---

## 📝 Important Notes

> **Database:** You are using LOCAL PostgreSQL, NOT Render
> 
> **Frontend:** Points to LOCAL backend at localhost:8000
> 
> **To Deploy:** Use different .env files (see full guide)

---

## 📚 Full Documentation

For detailed information, see:
- [`implementation_plan.md`](file:///home/enock/.gemini/antigravity/brain/4a952d26-f42c-46b8-98c5-3ffc8bcc2a9e/implementation_plan.md) - Complete setup guide
- [`LOCAL_DEVELOPMENT_GUIDE.md`](file:///home/enock/recruitment_platform/LOCAL_DEVELOPMENT_GUIDE.md) - Local development guide (if exists)
