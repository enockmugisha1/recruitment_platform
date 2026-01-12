# Documentation Summary - Quick Start

## 📚 Documentation Index

This recruitment platform has three comprehensive documentation files:

### 1. **SYSTEM_ARCHITECTURE.md** - System Overview
**For**: Developers, Technical Leads, DevOps

**Contents**:
- Complete technology stack explanation
- Backend architecture (Django REST Framework)
- Frontend architecture (React + TypeScript)
- Database schema and relationships
- API documentation and endpoints
- Authentication flow (JWT)
- File structure breakdown
- Development workflow
- Environment configuration

**Read this if you need to**:
- Understand how the system works
- Set up development environment
- Understand database relationships
- Learn about API endpoints
- Implement new features

---

### 2. **ML_INTEGRATION_GUIDE.md** - AI/ML Integration
**For**: Machine Learning Engineers, Data Scientists

**Contents**:
- Required AI capabilities (4 main features)
- Integration architecture options:
  - REST API Microservice (recommended)
  - Django App Integration
  - Celery Background Tasks
- Complete API specifications with examples
- Implementation guide with code
- Deployment strategies
- Best practices (caching, async, monitoring)
- Testing procedures
- Integration checklist

**Read this if you need to**:
- Integrate ML models with the platform
- Deploy AI services
- Understand required endpoints
- Choose integration architecture
- Implement resume analysis or candidate matching

---

### 3. **AI_ANALYZER_INTEGRATION.md** - Frontend AI Component
**For**: Frontend Developers, Full-Stack Developers

**Contents**:
- Frontend AI component usage
- API service layer implementation
- UI integration examples
- Component customization
- Testing procedures
- Security considerations

---

## 🚀 Quick Start Guides

### For Full-Stack Developers

**Start Here**:
1. Read `/home/enock/recruitment_platform/SYSTEM_ARCHITECTURE.md`
2. Set up backend: Follow "Backend Development" section
3. Set up frontend: Follow "Frontend Development" section
4. Test integration: Use Swagger docs at `http://localhost:8000/swagger/`

**Key Files to Know**:
- Backend: `applications/models.py`, `applications/views.py`
- Frontend: `src/api/services.ts`, `src/App.tsx`
- Routes: `recruitment_platform/urls.py`, `App.tsx`

---

### For ML Engineers

**Start Here**:
1. Read `ML_INTEGRATION_GUIDE.md`
2. Choose integration option (Section: "Integration Options")
3. Implement 4 required endpoints (Section: "Required API Endpoints")
4. Test your implementation (Section: "Testing Your Integration")
5. Deploy (Section: "Deployment Options")

**What You Need to Build**:
1. `POST /api/v1/ai/analyze-resume/` - Extract skills from resume
2. `POST /api/v1/ai/match-candidate/<id>/` - Score candidate-job match
3. `GET /api/v1/ai/job-recommendations/<id>/` - Rank candidates for job
4. `POST /api/v1/ai/bulk-analyze/<id>/` - Analyze multiple applications

**Frontend is Ready**: The React frontend already has the UI components. You just need to implement the backend AI endpoints!

---

### For Backend Developers

**Start Here**:
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up database
python manage.py migrate

# 4. Create admin user
python manage.py createsuperuser

# 5. Run server
python manage.py runserver

# 6. View API docs
# Open: http://localhost:8000/swagger/
```

**Key Endpoints**:
- Auth: `/auth/login/`, `/auth/register/`
- Jobs: `/access/jobs/`
- Applications: `/access/applications/`
- Calendar: `/access/calendar/`
- Profiles: `/profile/job-seeker/`, `/profile/recruiter/`

---

### For Frontend Developers

**Start Here**:
```bash
# 1. Navigate to frontend
cd Application-analyzer

# 2. Install dependencies
npm install

# 3. Configure API endpoint (if needed)
# Edit: .env
# Set: VITE_API_BASE_URL=http://localhost:8000

# 4. Run dev server
npm run dev

# 5. Open browser
# Visit: http://localhost:5173
```

**Key Files**:
- API Services: `src/api/services.ts`
- Auth Context: `src/contexts/AuthContext.tsx`
- Routing: `src/App.tsx`
- Layouts: `src/layouts/AdminLayout.tsx`, `src/layouts/JobSeekerLayout.tsx`

---

## 🏗️ System Architecture At a Glance

```
┌─────────────────┐
│  React Frontend │
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Django Backend │
│  (Port 8000)    │
├─────────────────┤
│ • Users         │
│ • Profiles      │
│ • Applications  │
│ • Jobs          │
│ • Calendar      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐          ┌──────────────┐
│   PostgreSQL    │          │  ML Service  │
│   (Database)    │          │  (Optional)  │
└─────────────────┘          └──────────────┘
```

---

## 🔐 Authentication Flow

```
1. User registers → Email sent with OTP
2. User verifies OTP → Account activated
3. User logs in → Receives JWT tokens
4. Frontend stores tokens → Includes in all requests
5. Backend validates token → Returns data
```

**Token Lifetime**:
- Access Token: 30 minutes
- Refresh Token: 7 days

---

## 📊 Database Models

**Core Entities**:
- `MyUser` - User accounts (job seeker or recruiter)
- `JobSeekerProfile` - Extended profile for job seekers
- `RecruiterProfile` - Extended profile for recruiters
- `Job` - Job postings
- `JobSeekerApplication` - Job applications (links job + job seeker)
- `CalendarEvent` - Interview scheduling

**Relationships**:
- One User → One Profile (RecruiterProfile OR JobSeekerProfile)
- One Recruiter → Many Jobs
- One Job → Many Applications
- One Job Seeker → Many Applications

---

## 🔌 API Endpoints Summary

### Authentication
```
POST /auth/register/        - Create account
POST /auth/login/           - Get JWT tokens
POST /auth/request-otp/     - Request verification code
POST /auth/verify-otp/      - Verify email
POST /auth/reset-password/  - Reset password
```

### Jobs
```
GET    /access/jobs/           - List all jobs
POST   /access/jobs/           - Create job (recruiter)
GET    /access/jobs/{id}/      - Get job details
PUT    /access/jobs/{id}/      - Update job
DELETE /access/jobs/{id}/      - Delete job
GET    /access/jobs/statistics/ - Get stats
```

### Applications
```
GET    /access/applications/       - List applications
POST   /access/applications/       - Submit application
GET    /access/applications/{id}/  - Get application
PUT    /access/applications/{id}/  - Update status
DELETE /access/applications/{id}/  - Delete application
```

### Calendar
```
GET    /access/calendar/           - List events
POST   /access/calendar/           - Create event
GET    /access/calendar/upcoming/  - Get upcoming
```

### Profiles
```
GET    /profile/job-seeker/     - Get job seeker profile
POST   /profile/job-seeker/     - Create profile
PUT    /profile/job-seeker/{id}/ - Update profile

GET    /profile/recruiter/      - Get recruiter profile
POST   /profile/recruiter/      - Create profile  
PUT    /profile/recruiter/{id}/  - Update profile
```

---

## 🧪 Testing

### Backend Testing
```bash
# API documentation
http://localhost:8000/swagger/

# Test with curl
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Testing
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Dependencies

### Backend (Python)
```
Django>=5.0
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
drf-yasg>=1.21  # Swagger docs
celery>=5.3     # Background tasks
redis>=5.0      # Caching
psycopg2-binary>=2.9  # PostgreSQL
```

### Frontend (Node.js)
```
react@^18.2.0
react-router-dom@^6.20.0
axios@^1.6.2
typescript@^5.3.3
vite@^5.0.8
tailwindcss@^3.4.0
```

---

## 🌐 Environment Variables

### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📖 Additional Resources

- **Swagger API Docs**: `http://localhost:8000/swagger/`
- **Redoc**: `http://localhost:8000/redoc/`
- **Django Admin**: `http://localhost:8000/admin/`
- **Local Development Guide**: `LOCAL_DEVELOPMENT_GUIDE.md`
- **Deployment Docs**: `COMPLETE_DEPLOYMENT_ROADMAP.md`

---

## 🆘 Common Issues

### Backend won't start
```bash
# Check migrations
python manage.py makemigrations
python manage.py migrate

# Check dependencies
pip install -r requirements.txt
```

### Frontend build errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### CORS errors
- Check `CORS_ALLOWED_ORIGINS` in backend `.env`
- Verify frontend is using correct API URL

### JWT token issues
- Check token expiry (30 min for access token)
- Verify Authorization header format: `Bearer <token>`

---

## 📞 Next Steps

1. **For Development**: Read `SYSTEM_ARCHITECTURE.md` → Set up environment → Start coding
2. **For ML Integration**: Read `ML_INTEGRATION_GUIDE.md` → Choose architecture → Implement endpoints
3. **For Deployment**: Read `COMPLETE_DEPLOYMENT_ROADMAP.md` → Follow deployment steps

---

**Last Updated**: January 2026
**Platform Version**: 1.0
**Status**: Production Ready (Awaiting ML Integration)
