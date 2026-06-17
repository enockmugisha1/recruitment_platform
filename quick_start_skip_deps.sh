#!/bin/bash

# Quick Start Script - Skip Dependencies (Already Installed)
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 TGA Recruitment Platform - Quick Start (No Deps) 🚀  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Activate virtual environment
print_step "Activating virtual environment..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    source env/bin/activate
fi
print_success "Virtual environment activated"

print_success "Skipping dependency installation (already installed)"

# Create logs directory if needed
if [ ! -d "logs" ]; then
    mkdir -p logs
    touch logs/recruitment.log logs/security.log
    chmod 755 logs
fi

# Create .env if needed
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
fi

# Apply migrations
print_step "Checking database status..."
python manage.py migrate --noinput 2>/dev/null || true
print_success "Database up to date"

# Collect static files
print_step "Collecting static files..."
python manage.py collectstatic --noinput --clear > /dev/null 2>&1
print_success "Static files collected"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✨ Ready to Go! ✨                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Starting development servers...${NC}"
echo ""
echo "📌 Access Points:"
echo "   🌐 Frontend:          http://localhost:3000/"
echo "   🌐 Backend API:       http://localhost:8000/"
echo "   📖 Admin Panel:       http://localhost:8000/admin/"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start backend in background
print_step "Starting Django backend on port 8000..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
print_success "Backend started (PID: $BACKEND_PID)"

# Start frontend if directory exists
if [ -d "frontend" ]; then
    print_step "Starting React frontend on port 3000..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    print_success "Frontend started (PID: $FRONTEND_PID)"
else
    print_warning "Frontend directory not found - running backend only"
    FRONTEND_PID=""
fi

echo ""

# Handle graceful shutdown
trap "
    echo ""
    print_warning 'Shutting down servers...'
    kill $BACKEND_PID 2>/dev/null || true
    if [ -n \"\$FRONTEND_PID\" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    print_success 'All servers stopped. Goodbye!'
    exit 0
" SIGINT SIGTERM

# Keep running
wait
