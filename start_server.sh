#!/bin/bash

# Recruitment Platform Startup Script
echo "🚀 Starting Recruitment Platform..."
echo "=================================="

# Activate virtual environment
echo "📦 Activating virtual environment..."
source env/bin/activate

# Check if migrations are up to date
echo "🔍 Checking database migrations..."
python manage.py makemigrations --check --dry-run

# Apply any pending migrations
echo "📊 Applying database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Start the development server
echo "🌐 Starting development server at http://localhost:8000"
echo "📖 API Documentation available at: http://localhost:8000/"
echo "👨‍💼 Admin panel available at: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

python manage.py runserver 0.0.0.0:8000
