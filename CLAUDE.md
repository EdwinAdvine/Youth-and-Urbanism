# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Urban Home School** (The Bird AI) is a full-stack educational platform for Kenyan children featuring AI-powered tutoring with multi-AI orchestration. Monorepo with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy (async) + PostgreSQL 16 + Redis 7
- **AI**: Multi-AI orchestrator (Gemini, Claude, OpenAI, Grok, ElevenLabs)
- **Real-time**: WebSocket, WebRTC (LiveKit), Yjs collaborative editing
- **Payments**: M-Pesa STK Push, PayPal, Stripe, Paystack, Flutterwave
- **i18n**: English + Swahili (i18next)

## Development Commands

### Infrastructure (Docker)
```bash
docker compose -f docker-compose.dev.yml up -d   # Start PostgreSQL + Redis only (local dev)
docker compose up -d                              # Start full stack (DB + Redis + Backend + Frontend + LiveKit)
docker compose down                               # Stop services
docker compose down -v                            # Stop + reset database volumes
```

### Frontend (from `frontend/`)
```bash
npm install                  # Install dependencies
npm run dev                  # Vite dev server at http://localhost:3000
npm run build                # Production build
npm run lint                 # ESLint
npx tsc --noEmit             # TypeScript type checking
npm run test                 # Vitest (single run)
npm run test:watch           # Vitest watch mode
npm run test:coverage        # Vitest with coverage
```

### Backend (from `backend/`)
```bash
pip install -r requirements.txt
python main.py                                          # Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000   # Start with hot reload
pytest                                                  # Run all tests (coverage auto-enabled)
pytest tests/test_auth.py                               # Run single test file
pytest -m unit                                          # Run by marker (unit/integration/e2e/security/payment/ai)
pytest --cov-fail-under=0                               # Skip coverage threshold
```

### Database
```bash
# Migrations (from backend/)
alembic upgrade head                    # Apply all migrations
alembic revision --autogenerate -m "description"  # Create new migration

# Seeding (from backend/)
python seed_users.py                    # Seed demo users (all 6 roles)
python seed_categories.py               # Seed course categories
python seed_comprehensive.py            # Comprehensive seed (all data)
python seed_cbc_competencies.py         # CBC curriculum competencies
```

### E2E Tests (from project root)
```bash
npx playwright test                     # Run all Playwright tests
npx playwright test e2e/staff/          # Run staff E2E tests
npx playwright test --project=chromium  # Desktop only
```

### CI/CD
GitHub Actions workflow (`.github/workflows/security.yml`) runs on push to main/develop:
- `pip-audit` for backend dependency vulnerabilities
- `npm audit` for frontend dependency vulnerabilities
- Ruff linter + type checking (backend)
- ESLint + TypeScript checking (frontend)
- pytest with PostgreSQL + Redis service containers

## Architecture

### Six-Role System

Every feature layer (API routes, services, models, schemas, frontend pages, components, stores, services) is organized by role subdirectories:

| Role | Backend API prefix | Frontend route prefix |
|------|-------------------|----------------------|
| Student | `/api/v1/student/` | `/dashboard/student/` |
| Parent | `/api/v1/parent/` | `/dashboard/parent/` |
| Instructor | `/api/v1/instructor/` | `/dashboard/instructor/` |
| Admin | `/api/v1/admin/` | `/dashboard/admin/` |
| Partner | `/api/v1/partner/` | `/dashboard/partner/` |
| Staff | `/api/v1/staff/` | `/dashboard/staff/` |

Shared endpoints (auth, courses, assessments, payments, search, forum) live at `/api/v1/` without a role prefix.

### Backend Structure

```
backend/
├── main.py                    # Root entry point (imports app.main)
├── app/
│   ├── main.py                # FastAPI app init, all route registration (~1400 lines)
│   ├── config.py              # Pydantic Settings (env vars)
│   ├── database.py            # SQLAlchemy async engine + session management
│   ├── api/v1/                # Route handlers
│   │   ├── auth.py, users.py, courses.py, ...  # Shared routes
│   │   ├── admin/             # 17 route files
│   │   ├── student/           # 8 route files
│   │   ├── parent/            # 8 route files
│   │   ├── instructor/        # 11 route files
│   │   ├── partner/           # 8 route files
│   │   └── staff/             # 18 route files
│   ├── models/                # SQLAlchemy ORM models (80+ models)
│   │   ├── user.py, course.py, payment.py, ...  # Core models
│   │   └── admin/, student/, parent/, instructor/, partner/, staff/
│   ├── schemas/               # Pydantic request/response schemas (60+ files)
│   ├── services/              # Business logic (85+ files, same role subdirs)
│   ├── utils/
│   │   ├── security.py        # JWT tokens, password hashing, auth helpers
│   │   ├── permissions.py     # Role-based access control
│   │   ├── payments/          # M-Pesa, PayPal, Paystack, Flutterwave integrations
│   │   └── sms/               # Africa's Talking SMS
│   ├── middleware/            # Audit logging, error logging middleware
│   └── websocket/             # WebSocket handlers (live chat, Yjs collab, WebRTC signaling)
├── alembic/                   # 26 migration files
├── tests/                     # Pytest suite (mirrors app/ structure)
│   ├── conftest.py            # Fixtures, TestClient, factories
│   ├── api/, models/, services/, middleware/, utils/, integration/
└── seed_*.py                  # Database seeding scripts
```

**Key backend patterns:**
- Async SQLAlchemy with `asyncpg` driver
- UUID primary keys, JSONB columns, soft deletes (`is_deleted` flag), timestamps on all models
- JWT auth with role-based dependency injection
- API docs auto-generated at `/docs` (Swagger) and `/redoc`

### Frontend Structure

```
frontend/src/
├── App.tsx                    # All routing (~800+ routes with React Router v7)
├── main.tsx                   # Entry point, PWA registration, theme init
├── pages/                     # Route-level components
│   ├── student/, parent/, instructor/, admin/, partner/, staff/
│   └── docs/                  # Documentation pages (uhs/, bird/, api/)
├── components/                # Feature-based by role
│   ├── layout/                # DashboardLayout, Sidebar, Topbar, PublicLayout
│   ├── auth/                  # AuthModal, LoginForm, SignupForm
│   ├── co-pilot/              # AI CoPilot sidebar assistant
│   ├── bird-chat/             # The Bird AI chat interface
│   ├── student/, parent/, instructor/, admin/, partner/, staff/
│   └── error/                 # GlobalErrorBoundary
├── store/                     # Zustand stores (11 files)
│   ├── authStore.ts           # JWT auth state (persisted to localStorage)
│   ├── index.ts               # useUserStore, useThemeStore
│   └── studentStore.ts, parentStore.ts, ...  # Role-specific stores
├── services/                  # API layer (Axios with JWT auto-refresh)
│   ├── api.ts                 # Axios instance, token refresh interceptor
│   ├── authService.ts         # Login, register, logout
│   └── admin/, student/, parent/, partner/, staff/
├── hooks/                     # Custom hooks (WebSocket, WebRTC, Yjs, LiveKit, etc.)
├── types/                     # TypeScript interfaces (11 files, role-specific)
├── i18n/                      # i18next config + locales (en.json, sw.json)
└── utils/                     # dashboardDetection.ts (role-based routing)
```

**Key frontend patterns:**
- `@/` path alias maps to `src/` (configured in tsconfig + vite)
- Code splitting with `React.lazy` for all dashboard pages
- `<ProtectedRoute>` component guards authenticated routes
- Zustand stores with `persist` middleware for localStorage sync
- Axios interceptor handles silent JWT refresh on 401
- Theme: dark mode default, class-based toggling via `useThemeStore`
- Custom Tailwind colors: `copilot-blue`, `copilot-cyan`, `copilot-green`, `copilot-purple`, `copilot-orange`, `copilot-teal`
- PWA: Service worker (`sw.ts`) with VitePWA plugin, installable with offline support

### Database Schema

PostgreSQL 16 with pgvector extension. Core tables:
- **users** — 6 roles, JSONB `profile_data`
- **students** — Links to users/parents, grade levels, AI tutor assignments, learning profiles
- **courses** — CBC-aligned, grade levels (array), pricing, 60/30/10 revenue split
- **enrollments** — Student-course progress tracking
- **assessments** — Quizzes, assignments, exams with JSONB questions
- **payments** — M-Pesa transactions, wallet management
- **ai_tutors** — Per-student AI instances, conversation history (JSONB)

Each role has additional specialized tables (e.g., `instructor_earnings`, `parent_ai_alerts`, `staff_sla_policy`).

### Multi-AI Orchestration

`app/services/ai_orchestrator.py` routes requests to AI providers by task type:
- **Gemini Pro** — Default tutor (general education, reasoning)
- **Claude 3.5 Sonnet** — Creative tasks, detailed explanations
- **GPT-4** — Fallback model
- **Grok** — Research, current events
- **ElevenLabs** — Text-to-speech voice responses

Features: task-based routing, automatic failover, conversation history, usage tracking.
Endpoint: `POST /api/v1/ai-tutor/chat`

### WebSocket Endpoints

Nine WebSocket endpoints at `/ws/admin`, `/ws/staff`, `/ws/instructor`, `/ws/parent`, `/ws/student`, `/ws/partner`, `/ws/support-chat`, `/ws/yjs` (collaborative editing), `/ws/webrtc-signaling` (video/audio).

## Environment Configuration

### Frontend `.env`
```
VITE_PORT=3000
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Urban Home School
```

### Backend `.env` (see `.env.example` for template)
Required keys: `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, plus API keys for Gemini, Anthropic, OpenAI, ElevenLabs.

Dev database: `postgresql+asyncpg://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db`

## Testing

### Backend (pytest)
- Async mode: `asyncio_mode = auto`
- Coverage: minimum 30% (`--cov-fail-under=30`), reports to `htmlcov/` and `coverage.xml`
- Markers: `unit`, `integration`, `e2e`, `security`, `slow`, `payment`, `ai`
- Fixtures in `tests/conftest.py` with FastAPI TestClient and Faker factories

### Frontend (Vitest)
- Environment: jsdom
- Setup: `src/setupTests.ts` (includes `@testing-library/jest-dom` matchers and `matchMedia` mock)
- Tests: `src/**/*.{test,spec}.{ts,tsx}`
- Libraries: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event

### E2E (Playwright)
- Config: `playwright.config.ts` at project root
- Tests: `e2e/` directory (currently staff test suite)
- Projects: Chromium (desktop) + iPhone 13 (mobile)
- Auto-starts frontend dev server

## TypeScript

- Strict mode enabled (`strict: true`)
- `noUnusedLocals` and `noUnusedParameters` enforced
- Target: ES2020
- Path alias: `@/*` → `src/*`
