#!/bin/bash

# Python Virtual Environment Setup Script
# Usage: ./setup-python-env.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐍 Setting up Python virtual environment for Urban Home School Backend...${NC}"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python3 is installed: $(python3 --version)${NC}"

# Navigate to backend directory
cd backend

# Check if virtual environment already exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment already exists. Skipping creation.${NC}"
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Virtual environment created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "Installing requirements..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Requirements installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install requirements${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  requirements.txt not found. Skipping installation.${NC}"
fi

# Deactivate virtual environment
deactivate

echo
echo -e "${GREEN}🎉 Python virtual environment setup complete!${NC}"
echo
echo "To activate the virtual environment in the future, run:"
echo "  cd backend && source venv/bin/activate"
echo
echo "To start the backend server, run:"
echo "  cd backend && source venv/bin/activate && python main.py"