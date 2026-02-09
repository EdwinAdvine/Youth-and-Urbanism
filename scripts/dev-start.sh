#!/bin/bash

# Development Start Script for Urban Home School
# Usage: ./dev-start.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Urban Home School Development Environment...${NC}"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Check if Python is available
if command_exists python3; then
    echo -e "${GREEN}✓ Python3: $(python3 --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Python3 not found. Backend features will be limited.${NC}"
fi

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

# Step 2: Setup Python virtual environment (if Python is available)
if command_exists python3; then
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
fi

# Step 3: Install frontend dependencies
echo -e "${BLUE}Step 3: Installing frontend dependencies...${NC}"
cd frontend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ package.json not found in frontend directory${NC}"
    exit 1
fi
cd ..

echo

# Step 4: Start services
echo -e "${BLUE}Step 4: Starting services...${NC}"

# Start backend in background
echo "Starting backend server..."
cd backend
if [ -d "venv" ] && [ -f "main.py" ]; then
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    deactivate
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    sleep 2
elif [ -f "main.py" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Starting backend without venv...${NC}"
    python3 main.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    sleep 2
else
    echo -e "${RED}❌ Backend files not found${NC}"
fi
cd ..

# Start frontend
echo "Starting frontend development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo -e "${GREEN}🎉 Development environment started successfully!${NC}"
echo
echo "📋 Service Status:"
echo "   Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo "   Backend:  http://localhost:8000 (PID: $BACKEND_PID)"
echo
echo "🔧 Development URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Backend Health: http://localhost:8000/health"
echo
echo "🛑 To stop all services, run: ./scripts/dev-stop.sh"
echo "🔍 To check ports, run: ./scripts/check-ports.sh"

# Wait for user input to stop
echo
echo "Press Ctrl+C to stop all services..."
trap "echo 'Stopping services...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
wait