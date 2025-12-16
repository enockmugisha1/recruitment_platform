#!/bin/bash

# 🚀 Quick Integration Test Script
# This script tests the frontend-backend integration

echo "=================================="
echo "🔍 Testing Frontend-Backend Integration"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "1️⃣ Checking backend..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo -e "${YELLOW}   Start it with: cd /home/enock/recruitment_platform && ./quick_start.sh${NC}"
fi
echo ""

# Test 2: Check frontend configuration
echo "2️⃣ Checking frontend configuration..."
if [ -f "Application-analyzer/.env" ]; then
    API_URL=$(grep "VITE_API_BASE_URL" Application-analyzer/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
    echo "   API URL: $API_URL"
else
    echo -e "${RED}❌ Frontend .env not found${NC}"
fi
echo ""

# Test 3: Check if frontend dependencies are installed
echo "3️⃣ Checking frontend dependencies..."
if [ -d "Application-analyzer/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend dependencies NOT installed${NC}"
    echo -e "${YELLOW}   Run: cd Application-analyzer && npm install${NC}"
fi
echo ""

# Test 4: Test API endpoint
echo "4️⃣ Testing API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/auth/login/ -X POST -H "Content-Type: application/json")
if [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "401" ]; then
    echo -e "${GREEN}✅ API endpoint accessible (status: $RESPONSE)${NC}"
    echo "   (400/401 is expected without credentials)"
else
    echo -e "${RED}❌ API endpoint returned: $RESPONSE${NC}"
fi
echo ""

# Test 5: Check CORS configuration
echo "5️⃣ Checking CORS configuration..."
if grep -q "localhost:5173" recruitment_platform/settings.py; then
    echo -e "${GREEN}✅ CORS configured for localhost:5173${NC}"
else
    echo -e "${YELLOW}⚠️  CORS might not include localhost:5173${NC}"
fi
echo ""

echo "=================================="
echo "📊 Integration Test Complete"
echo "=================================="
echo ""
echo "🎯 Next Steps:"
echo "1. If backend is not running:"
echo "   Terminal 1: cd /home/enock/recruitment_platform && ./quick_start.sh"
echo ""
echo "2. Start frontend:"
echo "   Terminal 2: cd /home/enock/recruitment_platform/Application-analyzer && npm run dev"
echo ""
echo "3. Open browser: http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   - Full Integration Guide: /home/enock/recruitment_platform/INTEGRATION_GUIDE.md"
echo "   - API Docs: http://localhost:8000/"
echo ""
