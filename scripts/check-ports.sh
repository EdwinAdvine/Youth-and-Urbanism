#!/bin/bash

# Port checking and conflict resolution script
# Usage: ./check-ports.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ports to check
FRONTEND_PORT=3000
BACKEND_PORT=8000

echo "🔍 Checking port availability..."

# Function to check and kill process on a port
check_and_kill_port() {
    local port=$1
    local service_name=$2
    
    echo "Checking port $port ($service_name)..."
    
    # Check if port is in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        PID=$(lsof -t -i:$port)
        echo -e "${YELLOW}⚠️  Port $port is in use by process ID: $PID${NC}"
        
        # Get process info
        PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null)
        if [ ! -z "$PROCESS_NAME" ]; then
            echo -e "${YELLOW}   Process: $PROCESS_NAME${NC}"
        fi
        
        # Ask user if they want to kill it
        read -p "Do you want to kill this process? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}✓ Killing process $PID...${NC}"
            kill -9 $PID
            sleep 1
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
                echo -e "${RED}❌ Failed to kill process on port $port${NC}"
                return 1
            else
                echo -e "${GREEN}✓ Port $port is now free${NC}"
                return 0
            fi
        else
            echo -e "${RED}❌ Port $port is still in use. Cannot start $service_name.${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✓ Port $port is available${NC}"
        return 0
    fi
}

# Check frontend port
check_and_kill_port $FRONTEND_PORT "Frontend (React/Vite)"
FRONTEND_OK=$?

# Check backend port  
check_and_kill_port $BACKEND_PORT "Backend (FastAPI)"
BACKEND_OK=$?

echo
if [ $FRONTEND_OK -eq 0 ] && [ $BACKEND_OK -eq 0 ]; then
    echo -e "${GREEN}🎉 All ports are ready! You can now start your services.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some ports are still in use. Please resolve conflicts before starting services.${NC}"
    exit 1
fi