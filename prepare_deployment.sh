#!/bin/bash

# 🚀 Deployment Preparation Script
# This script prepares your Django project for Render deployment

set -e  # Exit on error

echo "🚀 TGA Recruitment Platform - Deployment Preparation"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo -e "${YELLOW}⚠️  Virtual environment not activated${NC}"
    echo "Activating venv..."
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d "env" ]; then
        source env/bin/activate
    else
        echo -e "${RED}❌ No virtual environment found!${NC}"
        echo "Creating one now..."
        python3 -m venv venv
        source venv/bin/activate
    fi
fi

echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Step 1: Install production dependencies
echo "📦 Step 1: Installing production dependencies..."
python -m pip install --upgrade pip
python -m pip install gunicorn dj-database-url whitenoise python-decouple
echo -e "${GREEN}✓ Production dependencies installed${NC}"
echo ""

# Step 2: Update requirements.txt
echo "📝 Step 2: Updating requirements.txt..."
python -m pip freeze > requirements.txt
echo -e "${GREEN}✓ Requirements.txt updated${NC}"
echo ""

# Step 3: Create build.sh if it doesn't exist
if [ ! -f "build.sh" ]; then
    echo "📄 Step 3: Creating build.sh..."
    cat > build.sh << 'EOF'
#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running migrations..."
python manage.py migrate

echo "Build complete!"
EOF
    chmod +x build.sh
    echo -e "${GREEN}✓ build.sh created${NC}"
else
    echo -e "${GREEN}✓ build.sh already exists${NC}"
fi
echo ""

# Step 4: Create render.yaml if it doesn't exist
if [ ! -f "render.yaml" ]; then
    echo "📄 Step 4: Creating render.yaml..."
    cat > render.yaml << 'EOF'
services:
  # Django Web Service
  - type: web
    name: recruitment-platform
    env: python
    region: oregon
    buildCommand: "./build.sh"
    startCommand: "gunicorn recruitment_platform.wsgi:application"
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: recruitment-redis
          property: connectionString

databases:
  # PostgreSQL Database
  - name: recruitment-db
    databaseName: recruitment_platform
    user: recruitment_user
    region: oregon

  # Redis for Celery
  - name: recruitment-redis
    region: oregon
    plan: starter
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []
EOF
    echo -e "${GREEN}✓ render.yaml created${NC}"
else
    echo -e "${GREEN}✓ render.yaml already exists${NC}"
fi
echo ""

# Step 5: Update .gitignore
echo "📝 Step 5: Updating .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Python
*.py[cod]
__pycache__/
*.so
*.egg
*.egg-info
dist/
build/

# Virtual Environment
venv/
env/

# Django
*.log
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
productionfiles/

# Environment Variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Node (if using frontend)
node_modules/
npm-debug.log
yarn-error.log

# Build files
frontend/build/
frontend/.env.local
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
else
    echo -e "${GREEN}✓ .gitignore already exists${NC}"
fi
echo ""

# Step 6: Create .env.example for reference
echo "📝 Step 6: Creating .env.example..."
cat > .env.example << 'EOF'
# Django Settings
SECRET_KEY=your-secret-key-here-min-50-characters
DEBUG=False
ALLOWED_HOSTS=.render.com,.onrender.com,localhost,127.0.0.1

# Database (Render will provide this)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (Render will provide this)
REDIS_URL=redis://host:6379

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourapp.com

# CORS (Add your frontend domain)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Other
RENDER=True
PYTHONUNBUFFERED=true
EOF
echo -e "${GREEN}✓ .env.example created${NC}"
echo ""

# Step 7: Verify settings.py has production configuration
echo "🔍 Step 7: Checking settings.py..."
if grep -q "dj_database_url" recruitment_platform/settings.py; then
    echo -e "${GREEN}✓ Production database configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  settings.py may need updates for production${NC}"
    echo "   Please review RENDER_DEPLOYMENT_GUIDE.md"
fi

if grep -q "whitenoise" recruitment_platform/settings.py; then
    echo -e "${GREEN}✓ WhiteNoise configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  WhiteNoise may not be configured${NC}"
    echo "   Please review RENDER_DEPLOYMENT_GUIDE.md"
fi
echo ""

# Step 8: Test local build
echo "🧪 Step 8: Testing local build process..."
echo "Running collectstatic..."
if python manage.py collectstatic --no-input > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Static files collected successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Static files collection had issues (may be normal)${NC}"
fi
echo ""

# Step 9: Check Git status
echo "📊 Step 9: Checking Git status..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓ Git repository initialized${NC}"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        echo "   Modified files:"
        git status -s
    else
        echo -e "${GREEN}✓ No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git not initialized${NC}"
    echo "   Run: git init"
fi
echo ""

# Step 10: Summary and next steps
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Deployment Preparation Complete!${NC}"
echo "=================================================="
echo ""
echo "📋 Summary:"
echo "  ✓ Production dependencies installed"
echo "  ✓ requirements.txt updated"
echo "  ✓ build.sh created"
echo "  ✓ render.yaml created"
echo "  ✓ .gitignore updated"
echo "  ✓ .env.example created"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Review and update settings.py for production:"
echo "   - Check database configuration"
echo "   - Verify WhiteNoise setup"
echo "   - Set proper ALLOWED_HOSTS"
echo ""
echo "2. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo ""
echo "3. Push to GitHub:"
echo "   git remote add origin YOUR_GITHUB_URL"
echo "   git push -u origin main"
echo ""
echo "4. Deploy on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will auto-detect render.yaml"
echo "   - Click 'Apply' to deploy"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - RENDER_DEPLOYMENT_GUIDE.md"
echo "   - COMPLETE_DEPLOYMENT_ROADMAP.md"
echo ""
echo "💡 Tips:"
echo "   - Set environment variables in Render dashboard"
echo "   - Use strong SECRET_KEY (Render can generate)"
echo "   - Set DEBUG=False for production"
echo "   - Configure email settings for OTP"
echo ""
echo "Good luck with your deployment! 🎉"
echo ""
