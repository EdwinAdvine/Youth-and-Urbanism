#!/bin/bash

# Production Server Script for Urban Home School Frontend
# Usage: ./serve-production.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Urban Home School Production Server...${NC}"
echo

# Check if build directory exists
if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}❌ Build directory not found. Please run 'npm run build' first.${NC}"
    exit 1
fi

# Check if Python is available for serving
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build directory found${NC}"
echo -e "${GREEN}✓ Python3 is available: $(python3 --version)${NC}"
echo

# Step 1: Check and resolve port conflicts
echo -e "${BLUE}Step 1: Checking port availability...${NC}"
if [ -f "scripts/check-ports.sh" ]; then
    chmod +x scripts/check-ports.sh
    ./scripts/check-ports.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Port conflicts detected. Please resolve them first.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Port checking script not found. Proceeding without port check.${NC}"
fi

echo

# Step 2: Start production server
echo -e "${BLUE}Step 2: Starting production server...${NC}"
cd frontend/dist

# Create a simple Python HTTP server
echo "Starting production server on port 3000..."
python3 -m http.server 3000 &
SERVER_PID=$!

echo -e "${GREEN}✓ Production server started (PID: $SERVER_PID)${NC}"
echo -e "${GREEN}✓ Frontend available at: http://localhost:3000${NC}"
echo

# Test if server is running
echo "Testing production server..."
sleep 2
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Production server is responding successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Production server may still be starting up. Please wait a moment.${NC}"
fi

cd ../..

echo
echo -e "${GREEN}🎉 Production server started successfully!${NC}"
echo
echo "📋 Service Status:"
echo "   Frontend (Production): http://localhost:3000 (PID: $SERVER_PID)"
echo
echo "🔧 Production URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Backend Health: http://localhost:8000/health"
echo
echo "🛑 To stop the production server, run: ./scripts/dev-stop.sh"
echo "🔍 To check ports, run: ./scripts/check-ports.sh"

# Wait for user input to stop
echo
echo "Press Ctrl+C to stop the production server..."
trap "echo 'Stopping production server...'; kill $SERVER_PID 2>/dev/null; exit" INT
wait