#!/bin/bash

# Backend-only Development Start Script
# Usage: ./backend-start.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐍 Starting Urban Home School Backend...${NC}"
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python3 is installed: $(python3 --version)${NC}"
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

# Step 2: Setup Python virtual environment
echo -e "${BLUE}Step 2: Setting up Python virtual environment...${NC}"
if [ -f "scripts/setup-python-env.sh" ]; then
    chmod +x scripts/setup-python-env.sh
    ./scripts/setup-python-env.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Python environment setup failed.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Python setup script not found.${NC}"
fi
echo

# Step 3: Start backend server
echo -e "${BLUE}Step 3: Starting backend server...${NC}"
cd backend
if [ -d "venv" ] && [ -f "main.py" ]; then
    source venv/bin/activate
    echo "Starting FastAPI server on port 8000..."
    python main.py &
    BACKEND_PID=$!
    deactivate
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    sleep 2
    
    # Test if server is running
    echo "Testing backend connection..."
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}✓ Backend is responding successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend may still be starting up. Please wait a moment.${NC}"
    fi
elif [ -f "main.py" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Starting backend without venv...${NC}"
    python3 main.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    sleep 2
else
    echo -e "${RED}❌ Backend files not found${NC}"
    exit 1
fi
cd ..

echo
echo -e "${GREEN}🎉 Backend development environment started successfully!${NC}"
echo
echo "📋 Service Status:"
echo "   Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo
echo "🔧 Development URLs:"
echo "   Backend API: http://localhost:8000"
echo "   Backend Health: http://localhost:8000/health"
echo "   Backend Students: http://localhost:8000/api/students"
echo
echo "🛑 To stop the backend, run: ./scripts/dev-stop.sh"
echo "🔍 To check ports, run: ./scripts/check-ports.sh"

# Wait for user input to stop
echo
echo "Press Ctrl+C to stop the backend..."
trap "echo 'Stopping backend...'; kill $BACKEND_PID 2>/dev/null; exit" INT
wait