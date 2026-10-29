#!/bin/bash

# Quick Start Script for TGA Recruitment Platform
# Sets up the virtual environment, installs dependencies, and runs the app.
#
# What's new in this version:
#   - Detects a broken virtual environment (e.g. moved/copied/zipped) and rebuilds it
#   - Prefers Python 3.12 / 3.13 / 3.11 (best supported by the pinned dependencies)
#   - Works on Python 3.14 by swapping in a Pillow release that ships 3.14 wheels
#   - Installs Pillow from prebuilt wheels only (no libjpeg/compiler needed)
#   - Shows real errors for migrate / collectstatic instead of hiding them

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 TGA Recruitment Platform - Quick Start Setup 🚀      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Always run from the project directory (where this script lives)
cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step()    { echo -e "${BLUE}➜${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }

# ---------------------------------------------------------------------------
# 1. Pick a Python interpreter
# ---------------------------------------------------------------------------
# Order of preference: versions the pinned requirements are tested against first.
PYTHON_BIN=""
for candidate in python3.12 python3.13 python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
        PYTHON_BIN="$candidate"
        break
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    print_error "Python 3 not found. Install it with: brew install python@3.12"
    exit 1
fi

py_minor() { "$1" -c 'import sys; print(sys.version_info[1])'; }
PY_MINOR="$(py_minor "$PYTHON_BIN")"
print_success "Using $PYTHON_BIN ($("$PYTHON_BIN" --version 2>&1))"

if [ "$PY_MINOR" -ge 14 ]; then
    print_warning "Python 3.14 is very new; Django 4.2 doesn't officially support it."
    print_warning "For best results: brew install python@3.12  (then re-run this script)"
fi

# ---------------------------------------------------------------------------
# 2. Find / validate / (re)create the virtual environment
# ---------------------------------------------------------------------------
VENV_DIR=""
if [ -d "venv" ]; then
    VENV_DIR="venv"
elif [ -d "env" ]; then
    VENV_DIR="env"
fi

rebuild_venv=false
if [ -n "$VENV_DIR" ]; then
    # Broken venv: its python binary is missing or can't run
    if ! "$VENV_DIR/bin/python" -c "import sys" >/dev/null 2>&1; then
        print_warning "Virtual environment '$VENV_DIR' is broken (its Python is missing)."
        rebuild_venv=true
    else
        # A healthy venv on Python 3.14 while a better interpreter is available
        VENV_MINOR="$("$VENV_DIR/bin/python" -c 'import sys; print(sys.version_info[1])')"
        if [ "$VENV_MINOR" -ge 14 ] && [ "$PY_MINOR" -lt 14 ]; then
            print_warning "Virtual environment uses Python 3.$VENV_MINOR; rebuilding with $PYTHON_BIN."
            rebuild_venv=true
        fi
    fi
else
    VENV_DIR="venv"
    rebuild_venv=true
fi

if [ "$rebuild_venv" = true ]; then
    print_step "Creating virtual environment in '$VENV_DIR'..."
    rm -rf "$VENV_DIR"
    "$PYTHON_BIN" -m venv "$VENV_DIR"
    print_success "Virtual environment created"
else
    print_success "Virtual environment found ($VENV_DIR)"
fi

print_step "Activating virtual environment..."
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
print_success "Virtual environment activated"

# ---------------------------------------------------------------------------
# 3. Install dependencies
# ---------------------------------------------------------------------------
print_step "Checking dependencies..."
if ! python -c "import django, PIL, celery, rest_framework, psycopg" 2>/dev/null; then
    print_step "Installing dependencies (this may take a few minutes)..."
    python -m pip install --upgrade pip --quiet

    REQ_FILE="requirements.txt"
    TMP_REQ=""

    # Pillow 11.2.1 has no prebuilt wheel for Python 3.14, so pip tries to compile
    # it from source and fails without libjpeg. Pillow 12+ ships 3.14 wheels.
    if [ "$(python -c 'import sys; print(sys.version_info[1])')" -ge 14 ]; then
        print_warning "Python 3.14 detected: using Pillow >=12.0.0 (prebuilt wheels)"
        TMP_REQ="$(mktemp -t requirements.XXXXXX)"
        sed -E 's/^[Pp]illow==.*/pillow>=12.0.0/' requirements.txt > "$TMP_REQ"
        REQ_FILE="$TMP_REQ"
    fi

    # --only-binary=pillow: never try to compile Pillow (needs libjpeg etc.)
    if ! pip install -r "$REQ_FILE" --only-binary=pillow; then
        [ -n "$TMP_REQ" ] && rm -f "$TMP_REQ"
        print_error "Dependency installation failed."
        echo "   If Pillow was the problem, install Python 3.12 and re-run:"
        echo "     brew install python@3.12 && rm -rf $VENV_DIR && ./quick_start.sh"
        exit 1
    fi
    [ -n "$TMP_REQ" ] && rm -f "$TMP_REQ"
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# ---------------------------------------------------------------------------
# 4. Logs directory
# ---------------------------------------------------------------------------
if [ ! -d "logs" ]; then
    print_step "Creating logs directory..."
    mkdir -p logs
    touch logs/recruitment.log logs/security.log
    chmod 755 logs
    print_success "Logs directory created"
else
    print_success "Logs directory exists"
fi

# ---------------------------------------------------------------------------
# 5. .env file (local development settings)
# ---------------------------------------------------------------------------
# .env.example is a PRODUCTION template (DEBUG=False, forced HTTPS redirect).
# The dev server only speaks HTTP, so for local use we override those values.
set_env() {  # set_env KEY VALUE  -> set or replace KEY in .env
    if grep -q "^$1=" .env; then
        sed -i.bak -E "s|^$1=.*|$1=$2|" .env && rm -f .env.bak
    else
        echo "$1=$2" >> .env
    fi
}

if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating one for local development..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
USE_POSTGRESQL=False
USE_REDIS_CACHE=False
EOF
    fi
    set_env DEBUG True
    set_env ALLOWED_HOSTS "localhost,127.0.0.1,0.0.0.0,.render.com,.onrender.com"
    set_env SECURE_SSL_REDIRECT False
    set_env SESSION_COOKIE_SECURE False
    set_env CSRF_COOKIE_SECURE False
    print_success ".env created with local development settings (DEBUG=True, no HTTPS redirect)"
else
    print_success ".env file exists"
    # An existing .env with DEBUG=False makes Django redirect every request to
    # https://, which the dev server can't serve -> "HTTPS but only supports HTTP".
    if grep -qiE "^DEBUG=(False|0)" .env; then
        print_warning "Your .env has DEBUG=False (production mode): the dev server would"
        print_warning "redirect to HTTPS and fail. Switching to local-dev values."
        cp .env .env.production.bak
        print_success "Backed up current .env to .env.production.bak"
        set_env DEBUG True
        set_env SECURE_SSL_REDIRECT False
        set_env SESSION_COOKIE_SECURE False
        set_env CSRF_COOKIE_SECURE False
    fi
    # Make sure local hostnames are allowed
    if ! grep -qE "^ALLOWED_HOSTS=.*0\.0\.0\.0" .env; then
        CURRENT_HOSTS="$(grep -E '^ALLOWED_HOSTS=' .env | head -1 | cut -d= -f2-)"
        set_env ALLOWED_HOSTS "${CURRENT_HOSTS:+$CURRENT_HOSTS,}0.0.0.0"
    fi
fi

# ---------------------------------------------------------------------------
# 6. Database
# ---------------------------------------------------------------------------
print_step "Checking database status..."
if [ ! -f "db.sqlite3" ]; then
    print_step "Running initial migrations..."
    python manage.py migrate --noinput
    print_success "Database initialized"

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
    if python manage.py migrate --noinput; then
        print_success "Database up to date"
    else
        print_error "Migrations failed (see error above)."
        exit 1
    fi
fi

# ---------------------------------------------------------------------------
# 7. Static files
# ---------------------------------------------------------------------------
print_step "Collecting static files..."
if COLLECT_OUTPUT="$(python manage.py collectstatic --noinput --clear 2>&1)"; then
    print_success "Static files collected"
else
    print_error "collectstatic failed:"
    echo "$COLLECT_OUTPUT"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   ✨ Setup Complete! ✨                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Starting development server...${NC}"
echo ""
echo "📌 Access Points:"
echo "   🌐 Swagger API Docs:  http://localhost:8000/   (use localhost, not 0.0.0.0)"
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