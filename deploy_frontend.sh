#!/bin/bash

# Frontend Deployment Preparation Script
# This script prepares your frontend for deployment

set -e  # Exit on error

echo "=============================================="
echo "   Frontend Deployment Preparation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="Application-analyzer"
BACKEND_URL="https://recruitment-backend-5wpy.onrender.com"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory '$FRONTEND_DIR' not found!${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

echo "📦 Step 1: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""
echo "🔧 Step 2: Creating production .env file..."
cat > .env << EOF
# Production Backend URL
VITE_API_BASE_URL=$BACKEND_URL
EOF
echo -e "${GREEN}✓ Created .env with backend URL: $BACKEND_URL${NC}"

echo ""
echo "🏗️  Step 3: Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful! Output in 'dist' folder${NC}"
else
    echo -e "${RED}✗ Build failed! Check errors above${NC}"
    exit 1
fi

echo ""
echo "🧪 Step 4: Testing build locally (optional)..."
echo "To preview the production build, run:"
echo -e "${YELLOW}  npm run preview${NC}"
echo ""

cd ..

echo "=============================================="
echo "   Deployment Options"
echo "=============================================="
echo ""
echo "Choose your deployment platform:"
echo ""
echo "📘 Option 1: RENDER (Static Site)"
echo "   1. Go to: https://dashboard.render.com"
echo "   2. Click 'New +' → 'Static Site'"
echo "   3. Connect GitHub repository"
echo "   4. Use these settings:"
echo "      - Root Directory: Application-analyzer"
echo "      - Build Command: npm install && npm run build"
echo "      - Publish Directory: dist"
echo "      - Environment Variable:"
echo "        VITE_API_BASE_URL=$BACKEND_URL"
echo ""
echo "📗 Option 2: NETLIFY (Recommended)"
echo "   1. Go to: https://app.netlify.com"
echo "   2. Click 'Add new site' → 'Import an existing project'"
echo "   3. Connect GitHub repository"
echo "   4. Use these settings:"
echo "      - Base directory: Application-analyzer"
echo "      - Build command: npm run build"
echo "      - Publish directory: Application-analyzer/dist"
echo "      - Environment Variable:"
echo "        VITE_API_BASE_URL=$BACKEND_URL"
echo ""
echo "📙 Option 3: NETLIFY CLI (Quick Deploy)"
echo "   Run these commands:"
echo "   $ npm install -g netlify-cli"
echo "   $ cd Application-analyzer"
echo "   $ netlify deploy --prod"
echo ""
echo "=============================================="
echo "   After Deployment"
echo "=============================================="
echo ""
echo "🔗 Don't forget to:"
echo "   1. Copy your deployed frontend URL"
echo "   2. Add it to backend CORS settings:"
echo "      File: recruitment_platform/settings.py"
echo "      Add: 'https://your-frontend-url.com' to CORS_ALLOWED_ORIGINS"
echo "   3. Push backend changes to trigger redeployment"
echo ""
echo -e "${GREEN}✓ Frontend is ready for deployment!${NC}"
echo ""
echo "📖 For detailed guide, see: FRONTEND_DEPLOYMENT_GUIDE.md"
