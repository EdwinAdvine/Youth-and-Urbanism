# Urban Home School - Quick Start Guide

## Current Status ✅

- ✅ **Backend structure created** (25+ files, 3,500+ lines of code)
- ✅ **Database models ready** (10 models)
- ✅ **Pydantic schemas created** (50+ schemas)
- ✅ **FastAPI app configured** and working
- ✅ **Redis running** in Docker (healthy)
- ✅ **Python dependencies installed**
- ✅ **Alembic configured** for migrations

## What You Need to Do (2 simple commands!)

### Step 1: Create PostgreSQL Database

```bash
cd "/Users/edwinodhiambo/Documents/Urban Home School/backend"
./setup_database.sh
```

**You'll be prompted for**: Your PostgreSQL `postgres` user password

**This creates**:
- Database: `tuhs_db`
- User: `tuhs_user`
- Password: `tuhs_dev_password_123`

### Step 2: Run Migrations and Start Server

```bash
./complete_setup.sh
```

This will:
1. Generate initial database migration (create all tables)
2. Run the migration
3. Verify all tables were created

### Step 3: Start the Backend Server

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Verify Everything Works

### 1. Check Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "development"
}
```

### 2. Open API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Check Redis
```bash
docker ps | grep tuhs_redis
```

Should show: `Up X minutes (healthy)`

## What's Running

| Service | Port | Status | Command to Check |
|---------|------|--------|------------------|
| PostgreSQL | 5432 | Running locally | `ps aux \| grep postgres` |
| Redis | 6379 | Docker container | `docker ps \| grep redis` |
| Backend | 8000 | After `python main.py` | `curl localhost:8000/health` |

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Verify database exists
/Library/PostgreSQL/18/bin/psql -U tuhs_user -h localhost -d tuhs_db
# Password: tuhs_dev_password_123
```

### Redis Not Running
```bash
# Start Redis container
docker-compose -f ../docker-compose.dev.yml up -d

# Check status
docker ps | grep redis
```

### Alembic Migration Error
```bash
# Check Alembic can connect to database
python3 -m alembic current

# If error, verify .env.development has correct DATABASE_URL
cat .env.development | grep DATABASE_URL
```

### Import Errors
```bash
# Make sure you're in the backend directory
cd "/Users/edwinodhiambo/Documents/Urban Home School/backend"

# Check Python can import app
python3 -c "from app.main import app; print('✅ OK')"
```

## Database Tables Created

After running migrations, you should have these tables:

1. **users** - Authentication and multi-role support
2. **students** - Student profiles with CBC tracking
3. **ai_providers** - Admin-configurable AI providers ⭐
4. **ai_tutors** - Dedicated AI tutors (one per student) ⭐
5. **courses** - CBC-aligned courses
6. **assessments** - Quizzes, assignments, projects, exams
7. **assessment_submissions** - Student submissions
8. **payments** - Multi-gateway payment transactions ⭐
9. **wallets** - User wallets for credits/revenue
10. **wallet_transactions** - Transaction audit trail
11. **alembic_version** - Migration tracking

## API Endpoints Available

Once running, check the docs at http://localhost:8000/docs for:

- `GET /` - Root endpoint (app info)
- `GET /health` - Health check (database + Redis status)
- `GET /docs` - Swagger UI (interactive API docs)
- `GET /redoc` - ReDoc (alternative docs)

## Next Phase: Phase 2 - AI Orchestration

Once the backend is running, we'll implement:

1. **Authentication endpoints** (`/api/v1/auth`)
   - Register, login, JWT tokens
   - Auto-create AI tutor for students

2. **AI orchestrator service** (CORE FEATURE)
   - Dynamic AI provider loading
   - Multi-modal responses (text/voice/video)
   - Automatic failover

3. **AI tutor endpoints** (`/api/v1/ai-tutor`)
   - Chat with AI tutor
   - Conversation history
   - Response mode preferences

4. **Admin AI provider management** (`/api/v1/admin/ai-providers`)
   - Add/configure any multi-model API
   - Encrypted API key storage

See [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md) for detailed Phase 1 summary.

## Environment Configuration

Current development settings in `.env.development`:

- **Database**: PostgreSQL on localhost:5432
- **Redis**: Docker container on localhost:6379
- **Security Keys**: Generated (change for production!)
- **AI Providers**: Gemini API key ready
- **Payment Gateways**: M-Pesa, PayPal, Stripe (sandbox mode)

## Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)
3. Check the logs when running `python main.py`

---

**Ready to build the AI-powered educational platform!** 🚀
