#!/bin/bash

# Celery Worker & Beat Startup Script
# Run this to start background task processing

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🔄 Starting Celery Worker & Beat Scheduler 🔄      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "env" ]; then
    source env/bin/activate
else
    echo -e "${YELLOW}⚠ Warning: No virtual environment found${NC}"
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠ Redis not found. Some features may not work.${NC}"
    echo "  Install Redis: sudo apt install redis-server"
    echo "  Start Redis: sudo systemctl start redis-server"
    echo ""
fi

# Check which mode to run
echo ""
echo "Select mode:"
echo "  1) Run Celery Worker only"
echo "  2) Run Celery Beat only (scheduler)"
echo "  3) Run both Worker and Beat (recommended)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Starting Celery Worker..."
        echo "Press Ctrl+C to stop"
        echo ""
        celery -A recruitment_platform worker -l info
        ;;
    2)
        echo ""
        echo "📅 Starting Celery Beat..."
        echo "Press Ctrl+C to stop"
        echo ""
        celery -A recruitment_platform beat -l info
        ;;
    3)
        echo ""
        echo "🔄 Starting Celery Worker & Beat..."
        echo "Press Ctrl+C to stop"
        echo ""
        # Run both worker and beat in the same process
        celery -A recruitment_platform worker -B -l info
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
