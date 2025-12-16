#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Starting Frontend + Backend${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}Starting Backend (Django)...${NC}"
cd "$DIR"
source venv/bin/activate 2>/dev/null || true
python manage.py runserver > logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✅ Backend running on http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might not be ready yet. Check logs/backend.log${NC}"
fi

# Start Frontend
echo ""
echo -e "${GREEN}Starting Frontend (React)...${NC}"
cd "$DIR/Application-analyzer"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 3

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Integration Started!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}🔙 Backend:${NC}  http://localhost:8000"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:8000/"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Keep script running
wait
