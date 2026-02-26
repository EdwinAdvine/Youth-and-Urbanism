# Docker Compose Development Setup

**Project**: Urban Home School (The Bird AI)
**Last Updated**: 2026-02-15

This guide covers the Docker Compose configuration for local development and full-stack deployment of the Urban Home School platform.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Development Setup (docker-compose.dev.yml)](#development-setup-docker-composedevyml)
- [Full Stack Setup (docker-compose.yml)](#full-stack-setup-docker-composeyml)
- [Quick Start Commands](#quick-start-commands)
- [Database Credentials](#database-credentials)
- [Volume Management and Data Persistence](#volume-management-and-data-persistence)
- [Networking](#networking)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before getting started, make sure you have the following installed on your machine:

| Tool | Minimum Version | Installation |
|------|----------------|--------------|
| Docker Engine | 24.0+ | [docs.docker.com/engine/install](https://docs.docker.com/engine/install/) |
| Docker Compose | v2.20+ (included with Docker Desktop) | Bundled with Docker Desktop; standalone via `apt install docker-compose-plugin` |
| Git | 2.30+ | `brew install git` (macOS) or `apt install git` (Linux) |

Verify your installation:

```bash
docker --version          # Docker version 24.x or higher
docker compose version    # Docker Compose version v2.x
```

**System Requirements for Local Development:**

- 4 GB RAM minimum (8 GB recommended)
- 10 GB free disk space
- macOS, Linux, or Windows with WSL2

---

## Architecture Overview

The project uses two Docker Compose files for different development scenarios:

| File | Purpose | Services |
|------|---------|----------|
| `docker-compose.dev.yml` | Infrastructure only (local backend/frontend dev) | PostgreSQL, Redis |
| `docker-compose.yml` | Full stack deployment | PostgreSQL, Redis, Backend, Frontend |

### Service Dependency Graph

```
Frontend (port 3000)
    └── Backend (port 8000)
            ├── PostgreSQL (port 5432)
            └── Redis (port 6379)
```

---

## Development Setup (docker-compose.dev.yml)

This configuration starts only the infrastructure services (PostgreSQL and Redis), allowing you to run the backend and frontend locally with hot-reloading for faster development.

### Services

#### PostgreSQL 16-alpine

| Property | Value |
|----------|-------|
| Image | `postgres:16-alpine` |
| Container Name | `tuhs_postgres` |
| Port | `5432:5432` |
| Database | `tuhs_db` |
| User | `tuhs_user` |
| Password | `tuhs_dev_password_123` |
| Volume | `postgres_data:/var/lib/postgresql/data` |
| Health Check | `pg_isready -U tuhs_user -d tuhs_db` |

PostgreSQL uses the lightweight Alpine image for a smaller footprint. Data is persisted via a named Docker volume so it survives container restarts.

#### Redis 7-alpine

| Property | Value |
|----------|-------|
| Image | `redis:7-alpine` |
| Container Name | `tuhs_redis` |
| Port | `6379:6379` |
| Volume | `redis_data:/data` |
| Health Check | `redis-cli ping` |
| Persistence | AOF (append-only file) enabled |

Redis is used for session management, caching frequently accessed data, and temporary storage of AI conversation context.

### Starting Development Infrastructure

```bash
# Start PostgreSQL and Redis in the background
docker compose -f docker-compose.dev.yml up -d

# Verify both services are running
docker compose -f docker-compose.dev.yml ps

# Check container health
docker inspect --format='{{.State.Health.Status}}' tuhs_postgres
docker inspect --format='{{.State.Health.Status}}' tuhs_redis
```

After starting infrastructure, run the backend and frontend locally:

```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python seed_users.py        # First time: create tables and demo users
python main.py              # Start FastAPI server on port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev                 # Start Vite dev server on port 3000
```

---

## Full Stack Setup (docker-compose.yml)

This configuration runs the entire application stack in Docker containers, useful for integration testing or when you do not want to install Python or Node.js locally.

### Additional Services

#### Backend

| Property | Value |
|----------|-------|
| Build Context | `./backend` |
| Container Name | `tuhs_backend` |
| Port | `8000:8000` |
| Depends On | PostgreSQL (healthy), Redis (healthy) |
| Command | `uvicorn main:app --host 0.0.0.0 --port 8000` |
| Environment | Loaded from `backend/.env` |

#### Frontend

| Property | Value |
|----------|-------|
| Build Context | `./frontend` |
| Container Name | `tuhs_frontend` |
| Port | `3000:3000` |
| Depends On | Backend |
| Environment | `VITE_API_URL=http://localhost:8000` |

### Starting Full Stack

```bash
# Build and start all services
docker compose up -d --build

# Watch logs for all services
docker compose logs -f

# Watch logs for a specific service
docker compose logs -f backend
```

---

## Quick Start Commands

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up -d` | Start PostgreSQL and Redis only |
| `docker compose up -d` | Start full stack (all 4 services) |
| `docker compose up -d --build` | Rebuild images and start full stack |
| `docker compose down` | Stop all services (preserves data) |
| `docker compose down -v` | Stop all services and delete volumes (resets database) |
| `docker compose ps` | List running containers and their status |
| `docker compose logs -f` | Stream logs from all services |
| `docker compose logs -f <service>` | Stream logs from a specific service |
| `docker compose restart <service>` | Restart a specific service |
| `docker compose exec postgres psql -U tuhs_user -d tuhs_db` | Open a PostgreSQL shell |
| `docker compose exec redis redis-cli` | Open a Redis CLI session |

---

## Database Credentials

Development database credentials used across all Docker Compose configurations:

| Property | Value |
|----------|-------|
| Host | `localhost` (from host machine) or `postgres` (from other containers) |
| Port | `5432` |
| Database | `tuhs_db` |
| User | `tuhs_user` |
| Password | `tuhs_dev_password_123` |
| Connection String (async) | `postgresql+asyncpg://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db` |
| Connection String (sync) | `postgresql://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db` |

**Important**: When connecting from another Docker container (such as the backend service), use the service name `postgres` as the host instead of `localhost`. Docker Compose creates an internal network where services can reference each other by name.

### Connecting with External Tools

```bash
# psql CLI
psql -h localhost -p 5432 -U tuhs_user -d tuhs_db

# pgAdmin connection
Host: localhost
Port: 5432
Database: tuhs_db
Username: tuhs_user
Password: tuhs_dev_password_123
```

---

## Volume Management and Data Persistence

Docker named volumes persist data between container restarts and recreations. The project uses two named volumes:

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `postgres_data` | `/var/lib/postgresql/data` | PostgreSQL database files |
| `redis_data` | `/data` | Redis AOF persistence files |

### Inspecting Volumes

```bash
# List all Docker volumes
docker volume ls

# Inspect a specific volume
docker volume inspect urban-home-school_postgres_data

# Check volume disk usage
docker system df -v
```

### Resetting the Database

To completely reset the database and start fresh:

```bash
# Stop services and remove volumes
docker compose down -v

# Restart services (creates fresh volumes)
docker compose -f docker-compose.dev.yml up -d

# Re-seed the database
cd backend && python seed_users.py
```

### Backing Up Data Locally

```bash
# Dump the PostgreSQL database
docker compose exec postgres pg_dump -U tuhs_user tuhs_db > backup_$(date +%Y%m%d).sql

# Restore from a backup
docker compose exec -T postgres psql -U tuhs_user -d tuhs_db < backup_20260215.sql
```

---

## Networking

Docker Compose creates a default bridge network for inter-service communication. All services on this network can reference each other by their service names.

| Service Name | Internal Hostname | Internal Port |
|-------------|-------------------|---------------|
| PostgreSQL | `postgres` | `5432` |
| Redis | `redis` | `6379` |
| Backend | `backend` | `8000` |
| Frontend | `frontend` | `3000` |

The backend connects to PostgreSQL using `postgres:5432` and to Redis using `redis:6379` when running inside Docker.

---

## Environment Variables

Each service can be configured through environment variables. See the [Environment Variables Reference](./environment-variables.md) for the complete list.

For Docker Compose, environment variables can be set in three ways:

1. **`.env` file** in the service directory (recommended for development)
2. **`environment` block** in docker-compose.yml
3. **Shell environment** variables (highest precedence)

---

## Troubleshooting

### Port Conflicts

If port 5432, 6379, 8000, or 3000 is already in use:

```bash
# Find what is using the port
lsof -i :5432
# or on Linux
ss -tlnp | grep 5432

# Stop the conflicting process, or change the port mapping in docker-compose
# Example: map PostgreSQL to port 5433 instead
# ports:
#   - "5433:5432"
```

### Container Fails to Start

```bash
# Check container logs for error messages
docker compose logs postgres
docker compose logs redis

# Check container status and exit codes
docker compose ps -a

# Restart a specific service
docker compose restart postgres
```

### PostgreSQL Connection Refused

1. Verify the container is running: `docker compose ps`
2. Check the health status: `docker inspect --format='{{.State.Health.Status}}' tuhs_postgres`
3. Ensure no local PostgreSQL is competing on port 5432.
4. Wait a few seconds after startup -- PostgreSQL may still be initializing.

### Redis Connection Issues

```bash
# Test Redis connectivity
docker compose exec redis redis-cli ping
# Expected response: PONG

# Check Redis logs
docker compose logs redis
```

### Database Not Seeded

If the backend cannot find tables or demo users:

```bash
# Run the seed script manually
cd backend
python seed_users.py
```

### Rebuilding Containers

If you have changed a Dockerfile or need a clean rebuild:

```bash
# Rebuild without cache
docker compose build --no-cache

# Or rebuild and start in one command
docker compose up -d --build --force-recreate
```

### Disk Space Issues

```bash
# Check Docker disk usage
docker system df

# Remove unused containers, images, networks, and volumes
docker system prune

# Remove only unused volumes (caution: deletes data)
docker volume prune
```

### Viewing Container Resource Usage

```bash
# Real-time resource stats for all containers
docker stats

# One-time snapshot
docker stats --no-stream
```

---

## Related Documentation

- [Environment Variables Reference](./environment-variables.md)
- [Contabo Production Deployment](./contabo-deployment.md)
- [Architecture Overview](../architecture-overview.md)
- [Database Schema](../database/schema-overview.md)
