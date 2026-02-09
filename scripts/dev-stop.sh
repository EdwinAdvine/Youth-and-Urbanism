#!/bin/bash

# Development Stop Script for Urban Home School
# Usage: ./dev-stop.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Urban Home School Development Environment...${NC}"
echo

# Ports to check
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Function to stop process on a port
stop_process_on_port() {
    local port=$1
    local service_name=$2
    
    echo "Checking for $service_name on port $port..."
    
    # Check if port is in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        PID=$(lsof -t -i:$port)
        if [ ! -z "$PID" ]; then
            echo -e "${YELLOW}⚠️  Found process $PID on port $port ($service_name)${NC}"
            
            # Get process info
            PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null)
            if [ ! -z "$PROCESS_NAME" ]; then
                echo -e "${YELLOW}   Process: $PROCESS_NAME${NC}"
            fi
            
            # Kill the process
            echo -e "${GREEN}✓ Stopping process $PID...${NC}"
            kill -9 $PID
            
            # Wait a moment and check if it's really stopped
            sleep 1
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
                echo -e "${RED}❌ Failed to stop process on port $port${NC}"
            else
                echo -e "${GREEN}✓ Successfully stopped $service_name on port $port${NC}"
            fi
        fi
    else
        echo -e "${GREEN}✓ Port $port is already free${NC}"
    fi
}

# Stop frontend
stop_process_on_port $FRONTEND_PORT "Frontend (React/Vite)"

echo

# Stop backend
stop_process_on_port $BACKEND_PORT "Backend (FastAPI)"

echo
echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo
echo "💡 Tip: Run './scripts/check-ports.sh' to verify ports are free"