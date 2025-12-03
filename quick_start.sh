#!/bin/bash

# Quick Start Script for TGA Recruitment Platform
# This script sets up and runs the application with minimal dependencies

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 TGA Recruitment Platform - Quick Start Setup 🚀      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d "env" ]; then
    print_step "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment found"
fi

# Activate virtual environment
print_step "Activating virtual environment..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    source env/bin/activate
fi
print_success "Virtual environment activated"

# Check if requirements are installed
print_step "Checking dependencies..."
if ! python -c "import django" 2>/dev/null; then
    print_step "Installing dependencies (this may take a few minutes)..."
    pip install -r requirements.txt --quiet
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    print_step "Creating logs directory..."
    mkdir -p logs
    touch logs/recruitment.log logs/security.log
    chmod 755 logs
    print_success "Logs directory created"
else
    print_success "Logs directory exists"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created (please update with your settings)"
    else
        print_warning "No .env.example found, creating minimal .env..."
        cat > .env << EOF
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
USE_POSTGRESQL=False
USE_REDIS_CACHE=False
EOF
        print_success "Minimal .env file created"
    fi
else
    print_success ".env file exists"
fi

# Check if migrations need to be run
print_step "Checking database status..."
if [ ! -f "db.sqlite3" ]; then
    print_step "Running initial migrations..."
    python manage.py migrate --noinput
    print_success "Database initialized"
    
    # Prompt to create superuser
    echo ""
    print_warning "No superuser found. Would you like to create one now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python manage.py createsuperuser
    else
        print_warning "Skipping superuser creation. You can create one later with: python manage.py createsuperuser"
    fi
else
    print_step "Applying any pending migrations..."
    python manage.py migrate --noinput 2>/dev/null || print_warning "No new migrations to apply"
    print_success "Database up to date"
fi

# Collect static files
print_step "Collecting static files..."
python manage.py collectstatic --noinput --clear > /dev/null 2>&1
print_success "Static files collected"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✨ Setup Complete! ✨                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Starting development server...${NC}"
echo ""
echo "📌 Access Points:"
echo "   🌐 Swagger API Docs:  http://localhost:8000/"
echo "   📖 ReDoc:             http://localhost:8000/redoc/"
echo "   👨‍💼 Admin Panel:       http://localhost:8000/admin/"
echo ""
echo "📚 Documentation:"
echo "   📄 Setup Guide:       SETUP_GUIDE.md"
echo "   📄 Improvements:      IMPROVEMENTS_SUMMARY.md"
echo "   📄 API Endpoints:     API_ENDPOINTS.md"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start the server
python manage.py runserver 0.0.0.0:8000
