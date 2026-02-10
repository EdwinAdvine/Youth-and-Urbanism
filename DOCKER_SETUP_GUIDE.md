# Urban Home School - Docker Setup Guide

This guide provides comprehensive instructions for running your Urban Home School application using Docker containers.

## 🚀 Quick Start

### Prerequisites

1. **Docker** installed on your machine
   - [Install Docker Desktop](https://docs.docker.com/get-docker/)
   
2. **Docker Compose** (included with Docker Desktop)

3. **MySQL Database** running locally on port 3306
   - Your existing MySQL setup should continue to work
   - Database name: `home_school`
   - User: `root`
   - Password: `edwin3100DB`

### One-Command Setup

```bash
# Make the script executable (if not already)
chmod +x scripts/docker-setup.sh

# Start all services
./scripts/docker-setup.sh start
```

### Manual Setup

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
Urban Home School/
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Files to ignore in backend container
│   ├── .env.docker            # Docker-specific environment variables
│   └── [existing backend files]
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── .dockerignore           # Files to ignore in frontend container
│   ├── .env.docker            # Docker-specific environment variables
│   ├── nginx.conf             # Nginx configuration for production
│   └── [existing frontend files]
├── docker-compose.yml         # Orchestration configuration
├── scripts/
│   └── docker-setup.sh        # Management script
└── DOCKER_SETUP_GUIDE.md      # This file
```

## 🔧 Configuration

### Database Connection

The backend container connects to your local MySQL database using `host.docker.internal`, which resolves to your host machine from within containers.

**Connection String:**
```
mysql+pymysql://root:edwin3100DB@host.docker.internal:3306/home_school
```

### Environment Variables

#### Backend (.env.docker)
```bash
DATABASE_URL=mysql+pymysql://root:edwin3100DB@host.docker.internal:3306/home_school
SECRET_KEY=urbanhomeschool-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=False
```

#### Frontend (.env.docker)
```bash
VITE_PORT=3000
VITE_API_URL=http://backend:8000
VITE_APP_TITLE=Urban Home School
```

## 🌐 Service URLs

Once running, your services will be available at:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠️ Management Commands

### Using the Management Script

```bash
# Start services
./scripts/docker-setup.sh start

# Stop services
./scripts/docker-setup.sh stop

# Restart services
./scripts/docker-setup.sh restart

# View logs
./scripts/docker-setup.sh logs

# Check status
./scripts/docker-setup.sh status

# Test database connection
./scripts/docker-setup.sh test-db

# Rebuild containers
./scripts/docker-setup.sh rebuild

# Clean up resources
./scripts/docker-setup.sh cleanup

# Show help
./scripts/docker-setup.sh help
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View service status
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend bash

# View container logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MySQL Connection Failed
```bash
# Check if MySQL is running
lsof -i :3306

# Start MySQL (macOS with Homebrew)
brew services start mysql

# Check MySQL status
brew services list | grep mysql
```

#### 2. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 8000
lsof -i :8000

# Kill process (replace PID)
kill -9 PID
```

#### 3. Container Won't Start
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check if containers are running
docker-compose ps

# Restart with fresh build
./scripts/docker-setup.sh rebuild
```

#### 4. Database Migration Issues
```bash
# Access backend container
docker-compose exec backend bash

# Run migrations manually
python migrations/create_tables_direct.py
python migrations/populate_users_direct.py
```

### Health Checks

The containers include health checks that verify:

- **Backend**: HTTP health endpoint at `/health`
- **Frontend**: HTTP response at root path

Check health status:
```bash
./scripts/docker-setup.sh status
```

### Network Connectivity

Containers communicate via the `app-network` bridge network:

- Frontend can reach backend at `http://backend:8000`
- Backend connects to MySQL at `host.docker.internal:3306`
- Both services expose ports to host machine

## 🔄 Development Workflow

### Development Mode

For development, you can mount your source code into containers:

1. **Edit docker-compose.yml** to uncomment volume mounts:
   ```yaml
   volumes:
     - ./backend:/app  # Uncomment for development
   ```

2. **Restart services**:
   ```bash
   ./scripts/docker-setup.sh restart
   ```

3. **Make changes** to your source code - they'll be reflected immediately in containers.

### Production Mode

For production deployment:

1. **Remove volume mounts** from docker-compose.yml
2. **Build optimized images**:
   ```bash
   docker-compose build --no-cache
   ```
3. **Deploy** to your Docker host

## 🚀 Deployment

### Local Deployment
```bash
# Full setup and start
./scripts/docker-setup.sh start

# Verify everything is working
./scripts/docker-setup.sh status
./scripts/docker-setup.sh test-db
```

### Production Deployment

1. **Copy files** to your production server
2. **Ensure MySQL** is accessible
3. **Run**:
   ```bash
   docker-compose up --build -d
   ```

4. **Set up reverse proxy** (nginx, Apache) if needed for SSL/HTTPS

## 📊 Monitoring

### Container Health
```bash
# Check health status
docker-compose ps

# View detailed container info
docker inspect <container_name>
```

### Application Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df
```

## 🔒 Security Considerations

1. **Environment Variables**: Sensitive data is stored in environment variables
2. **Non-root User**: Containers run as non-root user for security
3. **Health Checks**: Monitor container health automatically
4. **Network Isolation**: Services communicate via internal network

## 🧹 Maintenance

### Regular Tasks

1. **Update Images**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **Clean Up**:
   ```bash
   ./scripts/docker-setup.sh cleanup
   ```

3. **Backup Database**: Your MySQL database remains on the host, so use standard MySQL backup procedures.

### Updating Dependencies

1. **Backend**: Update `backend/requirements.txt` and rebuild
2. **Frontend**: Update `frontend/package.json` and rebuild

```bash
# Rebuild after dependency changes
./scripts/docker-setup.sh rebuild
```

## 📞 Support

If you encounter issues:

1. **Check logs**: `./scripts/docker-setup.sh logs`
2. **Verify MySQL**: `./scripts/docker-setup.sh test-db`
3. **Check status**: `./scripts/docker-setup.sh status`
4. **Review troubleshooting section** above

For additional help, refer to:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

## 🎉 Benefits of Docker Setup

✅ **Isolated Dependencies**: No conflicts with system packages  
✅ **Reproducible Environment**: Same setup across all machines  
✅ **Easy Deployment**: One command to start everything  
✅ **Production Ready**: Optimized for both development and production  
✅ **No Database Migration**: Keeps your existing MySQL setup  
✅ **Health Monitoring**: Automatic health checks and restarts  
✅ **Professional Workflow**: Industry-standard containerization