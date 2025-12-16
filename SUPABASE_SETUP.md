# 🐘 Supabase PostgreSQL Setup Guide

## Your Supabase Database Connection

I've configured your Django app to use your Supabase PostgreSQL database!

---

## 📋 Connection Details

**Your Supabase Connection String:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
```

**Connection Parameters:**
- **Host**: `db.fepygcargirkapvrpmie.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `[YOUR-PASSWORD]` (you'll add this)

---

## ✅ What I've Done For You

### 1. Updated `.env` File
Added your Supabase connection string:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
```

### 2. Updated `settings.py`
Added support for `DATABASE_URL` format with three fallback options:
1. **DATABASE_URL** (Supabase/Render/production)
2. **Individual PostgreSQL parameters** (custom setup)
3. **SQLite** (local development fallback)

### 3. Installed Required Packages
- `dj-database-url` - Parse database URLs
- `python-decouple` - Environment variable management

---

## 🔐 Step 1: Add Your Password

### Option A: Edit `.env` file directly

Open `.env` and replace `[YOUR-PASSWORD]` with your actual Supabase password:

```bash
nano .env
```

Find this line:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
```

Change it to (example):
```env
DATABASE_URL=postgresql://postgres:YourActualPassword123!@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
```

**Important**: Remove the brackets `[]` around your password!

### Option B: Use command line

```bash
cd /home/enock/recruitment_platform

# Replace YOUR_ACTUAL_PASSWORD with your real password
sed -i 's/\[YOUR-PASSWORD\]/YOUR_ACTUAL_PASSWORD/g' .env
```

---

## 🧪 Step 2: Test the Connection

### Test 1: Check if psycopg2 is installed
```bash
cd /home/enock/recruitment_platform
source venv/bin/activate
pip list | grep psycopg2
```

Should show: `psycopg2-binary`

### Test 2: Test database connection
```bash
source venv/bin/activate
python manage.py check --database default
```

Should show: `System check identified no issues`

### Test 3: Run migrations
```bash
python manage.py migrate
```

This will create all tables in your Supabase database!

---

## 📊 Step 3: Create Tables in Supabase

Once connected, run:

```bash
cd /home/enock/recruitment_platform
source venv/bin/activate

# Run migrations to create all tables
python manage.py migrate

# Create a superuser
python manage.py createsuperuser
```

This will create all your Django tables in Supabase:
- `users_myuser` - Your custom user model
- `profiles_jobseekerprofile` - Job seeker profiles
- `profiles_recruiterprofile` - Recruiter profiles
- `applications_job` - Job listings
- `applications_jobseekerapplication` - Applications
- And all other Django tables (sessions, auth, etc.)

---

## 🌐 Step 4: Verify in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Tables**
4. You should see all Django tables created!

---

## 🚀 Step 5: Run Your Application

```bash
cd /home/enock/recruitment_platform
source venv/bin/activate

# Start the server
python manage.py runserver
```

Your app will now use Supabase PostgreSQL! 🎉

---

## 📝 Environment Variables Priority

Your `settings.py` now checks in this order:

1. **DATABASE_URL** (Highest priority)
   - Used for Supabase, Render, Heroku, etc.
   - Format: `postgresql://user:pass@host:port/dbname`

2. **Individual Parameters**
   - `USE_POSTGRESQL=True`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, etc.

3. **SQLite** (Fallback)
   - Used if no PostgreSQL configured
   - Good for quick local testing

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` file secure (never commit to Git)
- ✅ Use strong passwords
- ✅ Rotate passwords regularly
- ✅ Use environment variables in production
- ✅ Enable SSL for database connections

### ❌ DON'T:
- ❌ Commit `.env` to Git
- ❌ Share your password publicly
- ❌ Use weak passwords
- ❌ Hard-code passwords in code

---

## 🌍 Different Environments

### Local Development
```env
# .env (local)
DATABASE_URL=postgresql://postgres:yourpassword@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
DEBUG=True
```

### Production (Render)
```env
# Render Environment Variables
DATABASE_URL=postgresql://postgres:yourpassword@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
DEBUG=False
SECRET_KEY=super-secret-production-key
```

---

## 🐛 Troubleshooting

### Error: "Could not connect to server"
**Solution**: Check your internet connection and Supabase status

### Error: "password authentication failed"
**Solution**: Double-check your password in `.env`

### Error: "psycopg2 not installed"
**Solution**: 
```bash
pip install psycopg2-binary
```

### Error: "SSL connection required"
**Solution**: Add SSL mode to connection string:
```env
DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
```

### Error: "Too many connections"
**Solution**: Check Supabase connection limits in your plan

---

## 📊 Connection Pooling (Optional)

For better performance, you can add connection pooling:

```python
# settings.py
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,  # Connection lifetime in seconds
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30 seconds
        }
    }
}
```

Already configured in your `settings.py`! ✅

---

## 🔍 Monitoring Your Database

### Check connection status
```bash
python manage.py dbshell
```

Then in PostgreSQL:
```sql
-- Show current database
SELECT current_database();

-- Show all tables
\dt

-- Show table structure
\d users_myuser

-- Count records
SELECT COUNT(*) FROM users_myuser;

-- Exit
\q
```

### Check database size
```sql
SELECT 
    pg_size_pretty(pg_database_size('postgres')) as db_size;
```

---

## 📈 Supabase Features You Can Use

Your Supabase database includes:

1. **Real-time subscriptions** (if needed later)
2. **Row Level Security (RLS)** - Can be configured
3. **Automatic backups** - Handled by Supabase
4. **Connection pooling** - Built-in
5. **Read replicas** - Available on paid plans
6. **Point-in-time recovery** - Available on paid plans

---

## 💰 Supabase Plans

Your database tier determines limits:

**Free Tier**:
- 500MB database space
- 2GB bandwidth
- 50MB file storage
- Good for development

**Pro Plan** ($25/month):
- 8GB database space
- 250GB bandwidth
- 100GB file storage
- Daily backups

**Upgrade when needed!**

---

## 🚀 Deployment Configuration

When deploying on Render with Supabase:

### render.yaml
```yaml
services:
  - type: web
    name: recruitment-platform
    env: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn recruitment_platform.wsgi:application"
    envVars:
      - key: DATABASE_URL
        value: postgresql://postgres:yourpassword@db.fepygcargirkapvrpmie.supabase.co:5432/postgres
      - key: DEBUG
        value: False
      - key: SECRET_KEY
        generateValue: true
```

Or set in Render dashboard:
1. Go to your web service
2. Environment → Add Environment Variable
3. Key: `DATABASE_URL`
4. Value: `postgresql://postgres:yourpassword@...`

---

## ✅ Quick Setup Checklist

- [ ] Replace `[YOUR-PASSWORD]` in `.env` file
- [ ] Test connection: `python manage.py check --database default`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Start server: `python manage.py runserver`
- [ ] Verify in Supabase dashboard
- [ ] Test registration and login

---

## 🎉 You're All Set!

Your Django app is now connected to Supabase PostgreSQL!

**Next steps**:
1. Add your password to `.env`
2. Run migrations
3. Test your application
4. Deploy to Render (using same DATABASE_URL)

---

## 📞 Need Help?

Common commands:
```bash
# Check database connection
python manage.py check --database default

# View migrations status
python manage.py showmigrations

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access database shell
python manage.py dbshell

# Create superuser
python manage.py createsuperuser
```

---

**Last Updated**: 2025-12-16  
**Status**: ✅ Configured and ready to use!
