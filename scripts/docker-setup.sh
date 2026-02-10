#!/bin/bash

# Docker Setup Script for Urban Home School
# This script helps set up and manage the Dockerized application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to check if MySQL is running
check_mysql() {
    if ! lsof -i :3306 &> /dev/null; then
        print_warning "MySQL is not running on port 3306"
        print_status "Please ensure your MySQL database is running"
        print_status "You can start MySQL with: brew services start mysql (on macOS)"
        print_status "Or check your MySQL service status"
        echo
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "MySQL is running on port 3306"
    fi
}

# Function to build and start services
start_services() {
    print_status "Building and starting services..."
    docker-compose up --build -d
    print_success "Services started successfully"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to view logs
view_logs() {
    print_status "Viewing logs (press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to rebuild services
rebuild_services() {
    print_status "Rebuilding services..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Services rebuilt and started"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down
    docker system prune -f
    print_success "Docker resources cleaned up"
}

# Function to show status
show_status() {
    print_status "Service Status:"
    echo
    docker-compose ps
    echo
    print_status "Container Health:"
    docker-compose exec backend curl -f http://localhost:8000/health || echo "Backend health check failed"
    docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost:3000/ || echo "Frontend health check failed"
}

# Function to test database connection
test_db_connection() {
    print_status "Testing database connection from backend container..."
    docker-compose exec backend python -c "
import sys
sys.path.append('/app')
from database.connection import test_connection
if test_connection():
    print('Database connection successful')
else:
    print('Database connection failed')
"
}

# Function to show help
show_help() {
    echo "Urban Home School Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View logs from all services"
    echo "  status    Show service status and health"
    echo "  rebuild   Rebuild and restart all services"
    echo "  test-db   Test database connection"
    echo "  cleanup   Stop services and clean up Docker resources"
    echo "  help      Show this help message"
    echo
    echo "Services will be available at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API:      http://localhost:8000/api"
}

# Main script logic
case "${1:-help}" in
    "start")
        check_docker
        check_mysql
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        check_docker
        check_mysql
        stop_services
        start_services
        ;;
    "logs")
        view_logs
        ;;
    "status")
        show_status
        ;;
    "rebuild")
        check_docker
        check_mysql
        rebuild_services
        ;;
    "test-db")
        test_db_connection
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac