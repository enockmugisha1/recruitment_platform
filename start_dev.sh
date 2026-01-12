#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Recruitment Platform - Dev Startup${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Store PIDs for cleanup
declare -a PIDS=()

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    for pid in "${PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Check PostgreSQL
echo -e "${BLUE}[1/7] Checking PostgreSQL...${NC}"
if sudo systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo systemctl start postgresql
    sleep 2
    if sudo systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
        exit 1
    fi
fi
echo ""

# 2. Check Redis
echo -e "${BLUE}[2/7] Checking Redis...${NC}"
if sudo systemctl is-active --quiet redis-server; then
    echo -e "${GREEN}✓ Redis is running${NC}"
elif sudo systemctl is-active --quiet redis; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}Starting Redis...${NC}"
    sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis 2>/dev/null
    sleep 2
    if sudo systemctl is-active --quiet redis-server || sudo systemctl is-active --quiet redis; then
        echo -e "${GREEN}✓ Redis started${NC}"
    else
        echo -e "${YELLOW}⚠ Redis not running (Celery tasks will not work)${NC}"
    fi
fi
echo ""

# 3. Activate virtual environment
echo -e "${BLUE}[3/7] Activating virtual environment...${NC}"
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated (venv)${NC}"
elif [ -d "env" ]; then
    source env/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated (env)${NC}"
else
    echo -e "${YELLOW}⚠ No virtual environment found${NC}"
fi
echo ""

# 4. Check database connection
echo -e "${BLUE}[4/7] Checking database connection...${NC}"
PGPASSWORD=kingofkings psql -h localhost -U recruitment_user -d recruitment_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo -e "${YELLOW}Run './setup_local_db.sh' to set up the database${NC}"
    exit 1
fi
echo ""

# 5. Run migrations
echo -e "${BLUE}[5/7] Running migrations...${NC}"
python manage.py migrate --noinput
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}✗ Migrations failed${NC}"
    exit 1
fi
echo ""

# 6. Start Django server
echo -e "${BLUE}[6/7] Starting Django development server...${NC}"
python manage.py runserver 0.0.0.0:8000 > logs/django.log 2>&1 &
DJANGO_PID=$!
PIDS+=($DJANGO_PID)
sleep 3

# Check if Django started successfully
if ps -p $DJANGO_PID > /dev/null; then
    echo -e "${GREEN}✓ Django server started on http://localhost:8000${NC}"
    echo -e "  Admin panel: ${CYAN}http://localhost:8000/admin/${NC}"
    echo -e "  Swagger API: ${CYAN}http://localhost:8000/swagger/${NC}"
else
    echo -e "${RED}✗ Failed to start Django server${NC}"
    exit 1
fi
echo ""

# 7. Start Celery worker (optional)
echo -e "${BLUE}[7/7] Starting Celery worker...${NC}"
if command -v celery &> /dev/null; then
    celery -A recruitment_platform worker -l info > logs/celery.log 2>&1 &
    CELERY_PID=$!
    PIDS+=($CELERY_PID)
    sleep 2
    
    if ps -p $CELERY_PID > /dev/null; then
        echo -e "${GREEN}✓ Celery worker started${NC}"
    else
        echo -e "${YELLOW}⚠ Celery worker failed to start${NC}"
    fi
    
    # Start Celery Beat
    celery -A recruitment_platform beat -l info > logs/celery_beat.log 2>&1 &
    BEAT_PID=$!
    PIDS+=($BEAT_PID)
    
    if ps -p $BEAT_PID > /dev/null; then
        echo -e "${GREEN}✓ Celery beat started${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Celery not found (background tasks disabled)${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All Services Running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Backend Services:${NC}"
echo -e "  Django:  ${GREEN}http://localhost:8000${NC}"
echo -e "  Admin:   ${GREEN}http://localhost:8000/admin/${NC}"
echo -e "  Swagger: ${GREEN}http://localhost:8000/swagger/${NC}"
echo ""
echo -e "${CYAN}Frontend:${NC}"
echo -e "  To start frontend, run in a new terminal:"
echo -e "  ${BLUE}cd Application-analyzer${NC}"
echo -e "  ${BLUE}npm run dev${NC}"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  Django: ${BLUE}tail -f logs/django.log${NC}"
echo -e "  Celery: ${BLUE}tail -f logs/celery.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
