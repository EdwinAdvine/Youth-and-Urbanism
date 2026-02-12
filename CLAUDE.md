# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Urban Home School** (The Bird AI) is a full-stack educational platform for Kenyan children featuring AI-powered tutoring with multi-AI orchestration. This is a monorepo with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) + SQLAlchemy ORM
- **Database**: PostgreSQL (Docker) with Redis caching (Docker)
- **AI Integration**: Multi-AI orchestrator (Gemini, Claude, OpenAI, Grok, ElevenLabs, Synthesia)
- **Deployment**: Contabo VDS with Nginx reverse proxy

## Docker Services

All infrastructure services run in Docker containers via Docker Compose.

### Quick Start
```bash
# Start PostgreSQL + Redis only (for local backend/frontend dev)
docker compose -f docker-compose.dev.yml up -d

# Start full stack (PostgreSQL + Redis + Backend + Frontend)
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

### Services
| Service    | Image              | Container         | Port  | Purpose                    |
|------------|--------------------|-------------------|-------|----------------------------|
| PostgreSQL | postgres:16-alpine | tuhs_postgres     | 5432  | Primary database           |
| Redis      | redis:7-alpine     | tuhs_redis        | 6379  | Caching & session storage  |
| Backend    | ./backend          | tuhs_backend      | 8000  | FastAPI API server         |
| Frontend   | ./frontend         | tuhs_frontend     | 3000  | React dev/production server|

### Database Credentials (Development)
```
Host: localhost (or postgres inside Docker network)
Port: 5432
Database: tuhs_db
User: tuhs_user
Password: tuhs_dev_password_123
```

## Development Commands

### Frontend (run from `/frontend/`)

```bash
npm install                # Install dependencies
npm run dev               # Start Vite dev server at http://localhost:3000
npm run build             # Build for production
npm run lint              # Run ESLint
npm run preview           # Preview production build
npx tsc --noEmit         # Run TypeScript type checking
```

### Backend (run from `/backend/`)

```bash
pip install -r requirements.txt                              # Install dependencies
python main.py                                               # Start backend server
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000        # Start with uvicorn (http://localhost:8000)
pytest                                                       # Run tests

# Database seeding (creates tables + demo users for all roles)
python seed_users.py
```

**API Documentation**: Once backend is running, visit `/docs` (Swagger) or `/redoc` (ReDoc) for interactive API documentation.

### Backend Structure

The backend follows a modular FastAPI structure:
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Environment variables and settings
│   ├── database.py          # SQLAlchemy connection and session management
│   ├── models/              # SQLAlchemy ORM models (user.py, student.py, course.py, etc.)
│   ├── schemas/             # Pydantic schemas for request/response validation
│   ├── api/v1/              # API route handlers (auth.py, users.py, students.py, ai_tutor.py, etc.)
│   ├── services/            # Business logic (auth_service.py, ai_orchestrator.py, etc.)
│   ├── utils/               # Utilities (security.py for JWT, validators.py, etc.)
│   └── middleware/          # Custom middleware (auth, logging)
├── tests/                   # Pytest test files
├── alembic/                 # Database migrations
├── seed_users.py            # Database seeding script (tables + demo users)
└── requirements.txt
```

**Key patterns**:
- API versioning with `/api/v1/` prefix
- Dependency injection for database sessions and authentication
- JWT authentication with role-based access control
- Pydantic schemas for validation and automatic API documentation

## Architecture & Key Patterns

### Multi-Role System

The application supports six user roles, each with dedicated interfaces:

| Role | Dashboard Page | Sidebar Component |
|------|---------------|-------------------|
| Student | [DashboardStudent.tsx](frontend/src/pages/DashboardStudent.tsx) | Default |
| Parent | [DashboardParent.tsx](frontend/src/pages/DashboardParent.tsx) | [parent/ParentSidebar.tsx](frontend/src/components/parent/ParentSidebar.tsx) |
| Instructor | [DashboardInstructor.tsx](frontend/src/pages/DashboardInstructor.tsx) | [instructor/InstructorSidebar.tsx](frontend/src/components/instructor/InstructorSidebar.tsx) |
| Admin | [DashboardAdmin.tsx](frontend/src/pages/DashboardAdmin.tsx) | Default |
| Partner | [DashboardPartner.tsx](frontend/src/pages/DashboardPartner.tsx) | [partner/PartnerSidebar.tsx](frontend/src/components/partner/PartnerSidebar.tsx) |
| Staff | [DashboardStaff.tsx](frontend/src/pages/DashboardStaff.tsx) | Default |

**Backend**: JWT authentication with role-based access control. Dashboard routes organized by role in [dashboard_routes.py](backend/dashboard_routes.py).

### Database Schema (PostgreSQL)

Core tables with UUID primary keys, soft deletes, and timestamps:

- **users**: Authentication, roles (`student`, `parent`, `instructor`, `admin`, `partner`, `staff`), profile data (JSONB)
- **students**: Links to users and parents, admission numbers, grade levels, AI tutor assignments, learning profiles
- **ai_tutors**: Student-specific AI instances, conversation history (JSONB array), learning paths, performance metrics
- **courses**: CBC-aligned courses, grade levels (array), learning areas, creator info, pricing, ratings
- **enrollments**: Student-course relationships, progress tracking, completion status
- **assessments**: Quizzes, assignments, projects, exams with questions (JSONB)
- **payments**: M-Pesa integration, transaction tracking, wallet management

**Key patterns**:
- Foreign keys with cascading rules for referential integrity
- JSONB columns for flexible metadata and conversation history
- Indexes on frequently queried columns (user_id, email, created_at, grade_level)
- Soft deletes with `is_deleted` flag for data recovery
- Alembic for database migrations

### Multi-AI Orchestration Layer

The AI Orchestrator (`app/services/ai_orchestrator.py`) manages interactions with multiple AI providers:

**Primary AI Models**:
- **Gemini Pro** (Google): Default tutor for reasoning and general education
- **Claude 3.5 Sonnet** (Anthropic): Creative tasks and detailed explanations
- **Grok** (X.AI): Research and current events (when available)
- **GPT-4** (OpenAI): Fallback model

**Additional Services**:
- **ElevenLabs**: Text-to-speech for voice responses
- **Synthesia**: AI-generated video lessons

**Orchestration features**:
- Task-based routing (general, research, reasoning, creative)
- Automatic failover to alternative models
- Conversation history management
- Usage tracking and cost optimization

**API endpoint**: `POST /api/v1/ai-tutor/chat` handles student-tutor interactions.

### Frontend Architecture

#### State Management (Zustand)
All stores located in [frontend/src/store/](frontend/src/store/):

- **useUserStore**: User data, preferences, courses, assignments, quizzes, certificates, transactions, forum posts
- **useThemeStore**: Theme management (light/dark/system) with localStorage persistence
- **useCoPilotStore**: AI CoPilot state and interactions
- **useChatStore**: Chat interface state and message history

#### Component Organization (Feature-Based)

```
frontend/src/components/
├── auth/           # Login, Signup, AuthModal
├── co-pilot/       # AI CoPilot features (chat, performance, sidebar)
├── bird-chat/      # The Bird AI chat interface
├── layout/         # DashboardLayout, Sidebar, Topbar
├── dashboard/      # StatsCards, WelcomeWidget, dashboard-specific components
├── parent/         # Parent role sidebar
├── instructor/     # Instructor role sidebar
└── partner/        # Partner role sidebar
```

#### Type System
Comprehensive TypeScript types in [frontend/src/types/](frontend/src/types/):
- **Domain entities**: User, Course, Assignment, Quiz, Certificate
- **Role type**: `'student' | 'parent' | 'instructor' | 'admin' | 'partner'`
- **Chat types**: Separate file for chat-related interfaces

#### Routing
- **Router**: React Router v7
- **Protected Routes**: [ProtectedRoute.tsx](frontend/src/components/ProtectedRoute.tsx) wraps authenticated pages
- **Main routing**: Defined in [App.tsx](frontend/src/App.tsx)

### Backend Architecture

- **Framework**: FastAPI with automatic OpenAPI documentation
- **ORM**: SQLAlchemy with PostgreSQL database (Docker)
- **Cache**: Redis for session management and frequently accessed data (Docker)
- **Authentication**: JWT tokens using python-jose and passlib (bcrypt)
- **CORS**: Configured for `http://localhost:3000` and `http://127.0.0.1:3000`
- **Entry Point**: [main.py](backend/main.py)
- **Migrations**: Alembic for database schema management

## Environment Configuration

### Frontend `.env`
```
VITE_PORT=3000
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Urban Home School
```

### Backend `.env`
```
# Database (Docker PostgreSQL)
DATABASE_URL=postgresql+asyncpg://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=urbanhomeschool-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Service API Keys
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Environment
DEBUG=True
```

**Important**:
- Change `SECRET_KEY` to a strong randomly generated key in production
- Use different API keys for development and production
- Never commit `.env` files to version control

## Important Notes

- **Testing**: No testing framework currently configured in frontend. Backend has pytest setup with test files.
- **Custom Tailwind Theme**: Extended color palette with "copilot" brand colors (blue, cyan, green, purple, orange, teal) defined in [tailwind.config.js](frontend/tailwind.config.js).
- **TypeScript**: Strict mode enabled with no unused locals/parameters allowed.
- **Dev Server**: Vite configured to auto-open browser on `npm run dev`.
- **Mock Data**: Development mock data available in [frontend/src/services/mockData.ts](frontend/src/services/mockData.ts).

## Deployment (Contabo VDS)

The application is designed for deployment on Contabo Virtual Dedicated Servers:

**Infrastructure**:
- Single VDS initially (4-8 GB RAM, 4 cores minimum)
- Docker containers for all services (PostgreSQL, Redis, Backend, Frontend)
- Nginx as reverse proxy and load balancer
- Let's Encrypt for SSL/TLS certificates
- Automated backups to external storage
- Cloudflare for CDN and DDoS protection

**Services**:
- Frontend: Served as static files from `/var/www/tuhs`
- Backend: Systemd service running uvicorn on port 8000
- Database: PostgreSQL Docker container with daily automated backups
- Cache: Redis Docker container for session management and caching

**Nginx configuration**: Frontend at root, backend API proxied to `/api/*` endpoints.

## Security Best Practices

- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: PostgreSQL SSL connections, strong passwords, prepared statements (SQLAlchemy default)
- **API**: Rate limiting, HTTPS enforcement, input validation, restricted CORS policies
- **Data**: Encryption at rest for sensitive data, GDPR/DPA-compliant deletion, minimal data collection
- **Monitoring**: Log all authentication attempts, regular security audits

## Testing

### Backend (pytest)
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app
```

Test files use FastAPI `TestClient` for endpoint testing.

### Frontend (Jest + React Testing Library)
```bash
# Run tests (when configured)
npm test

# Run with coverage
npm test -- --coverage
```

## Performance Optimization

**Backend**:
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Async/await for I/O-bound operations
- Background tasks for heavy operations (Celery or FastAPI BackgroundTasks)
- Connection pooling (SQLAlchemy default)

**Frontend**:
- Code splitting with React.lazy and Suspense
- Image optimization (WebP, lazy loading)
- CDN for static assets
- Service workers for offline functionality

**Database**:
- Indexes on frequently queried columns
- Regular VACUUM and ANALYZE operations
- Read replicas for scaling (future consideration)
