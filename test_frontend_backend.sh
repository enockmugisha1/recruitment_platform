#!/bin/bash

echo "========================================"
echo "🔗 Frontend-Backend Integration Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Backend
echo "1️⃣ Testing Backend (Port 8000)..."
BACKEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null)

if [ "$BACKEND_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "Start it with: cd /home/enock/recruitment_platform && ./quick_start.sh"
    exit 1
fi

# Test Backend API
echo ""
echo "2️⃣ Testing Backend API Endpoints..."

# Test Registration endpoint
REG_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/auth/register/ -X OPTIONS)
if [ "$REG_TEST" == "200" ]; then
    echo -e "${GREEN}✅ Registration endpoint accessible${NC}"
else
    echo -e "${RED}❌ Registration endpoint issue${NC}"
fi

# Test Login endpoint
LOGIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/auth/login/ -X OPTIONS)
if [ "$LOGIN_TEST" == "200" ]; then
    echo -e "${GREEN}✅ Login endpoint accessible${NC}"
else
    echo -e "${RED}❌ Login endpoint issue${NC}"
fi

# Test Jobs endpoint
JOBS_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/access/jobs/)
if [ "$JOBS_TEST" == "200" ]; then
    echo -e "${GREEN}✅ Jobs endpoint accessible${NC}"
else
    echo -e "${RED}❌ Jobs endpoint issue${NC}"
fi

# Check CORS configuration
echo ""
echo "3️⃣ Testing CORS Configuration..."
CORS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: http://localhost:5173" -X OPTIONS http://localhost:8000/auth/login/)
if [ "$CORS_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ CORS configured correctly for port 5173${NC}"
else
    echo -e "${YELLOW}⚠️  CORS might need configuration${NC}"
fi

# Test Frontend
echo ""
echo "4️⃣ Checking Frontend Setup..."

if [ -d "/home/enock/recruitment_platform/Application-analyzer" ]; then
    echo -e "${GREEN}✅ Frontend directory exists${NC}"
    
    # Check if node_modules exists
    if [ -d "/home/enock/recruitment_platform/Application-analyzer/node_modules" ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Dependencies not installed. Run: cd Application-analyzer && npm install${NC}"
    fi
    
    # Check .env file
    if [ -f "/home/enock/recruitment_platform/Application-analyzer/.env" ]; then
        echo -e "${GREEN}✅ .env file exists${NC}"
        ENV_URL=$(grep VITE_API_BASE_URL /home/enock/recruitment_platform/Application-analyzer/.env | cut -d '=' -f2)
        if [ "$ENV_URL" == "http://localhost:8000" ]; then
            echo -e "${GREEN}✅ API URL correctly configured: $ENV_URL${NC}"
        else
            echo -e "${YELLOW}⚠️  API URL is: $ENV_URL (should be http://localhost:8000)${NC}"
        fi
    else
        echo -e "${RED}❌ .env file missing${NC}"
    fi
    
    # Check if frontend is running
    FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null)
    if [ "$FRONTEND_CHECK" == "200" ]; then
        echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend is NOT running${NC}"
        echo "   Start it with: cd Application-analyzer && npm run dev"
    fi
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
fi

# Summary
echo ""
echo "========================================"
echo "📊 Integration Status Summary"
echo "========================================"
echo ""

if [ "$BACKEND_CHECK" == "200" ] && [ "$REG_TEST" == "200" ] && [ "$LOGIN_TEST" == "200" ] && [ "$JOBS_TEST" == "200" ]; then
    echo -e "${GREEN}✅ Backend: Fully operational${NC}"
    echo -e "${GREEN}✅ API Endpoints: All accessible${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Start frontend: cd Application-analyzer && npm run dev"
    echo "   2. Open browser: http://localhost:5173"
    echo "   3. Test login with existing user or register new one"
    echo ""
    echo "📚 Quick API Test:"
    echo "   Register: curl -X POST http://localhost:8000/auth/register/ -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"Test123!\",\"first_name\":\"Test\",\"last_name\":\"User\",\"role\":\"job_seeker\"}'"
    echo ""
    echo "   Login: curl -X POST http://localhost:8000/auth/login/ -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"Test123!\"}'"
    echo ""
else
    echo -e "${RED}⚠️  Some issues detected. Check the errors above.${NC}"
fi

echo "========================================"
