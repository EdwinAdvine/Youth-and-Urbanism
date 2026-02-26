# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Urban Home School** (The Bird AI) is a full-stack educational platform for Kenyan children featuring AI-powered tutoring with multi-AI orchestration. Turborepo + pnpm monorepo targeting **Web + Desktop (Mac/Windows) + Mobile (iOS/Android)** via Tauri v2:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand (in `apps/web/`)
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy (async) + PostgreSQL 16 + Redis 7
- **Desktop/Mobile**: Tauri v2 (Rust) — ships Mac .dmg, Windows .exe, Android .apk/.aab, iOS .ipa
- **AI**: Multi-AI orchestrator (Gemini, Claude, OpenAI, Grok, ElevenLabs)
- **Real-time**: WebSocket, WebRTC (LiveKit), Yjs collaborative editing
- **Payments**: M-Pesa STK Push, PayPal, Stripe, Paystack, Flutterwave
- **i18n**: English + Swahili (i18next)

## Monorepo Structure

```
urban-home-school/
├── apps/
│   └── web/                   # React frontend (moved from frontend/)
│       ├── src/               # React source (unchanged internally)
│       ├── src-tauri/         # Tauri v2 — desktop + mobile shell
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   ├── capabilities/  # Tauri permission scopes
│       │   ├── icons/         # Generated from public/icon-512.png
│       │   └── src/lib.rs     # Rust entry point + plugin registration
│       ├── package.json       # @uhs/web
│       └── vite.config.ts     # Conditional PWA (disabled in Tauri)
├── packages/
│   ├── tsconfig/              # @uhs/tsconfig — shared TS config (base, react, node)
│   ├── core-types/            # @uhs/core-types — 12 domain type files (subpath exports)
│   ├── utils/                 # @uhs/utils — dashboardDetection, courseCode, cbcLookup
│   ├── config/                # @uhs/config — Zod env validation, platform detection
│   └── api-client/            # @uhs/api-client — Axios factory + interceptors
├── backend/                   # FastAPI (unchanged except CORS config)
├── .github/workflows/
│   ├── security.yml           # Lint + tests on push to main/develop
│   ├── desktop-build.yml      # Mac + Windows builds on version tags
│   └── mobile-build.yml       # Android + iOS builds on version tags
├── package.json               # Root workspace (turbo scripts)
├── pnpm-workspace.yaml        # apps/* + packages/*
└── turbo.json                 # Task pipeline
```

## Development Commands

### Monorepo (from project root)
```bash
pnpm install                     # Install all workspace dependencies
pnpm turbo run dev               # Start all dev servers (web at :3000)
pnpm turbo run build             # Build all packages + web app
pnpm turbo run test              # Run all tests
pnpm turbo run typecheck         # TypeScript check all packages
pnpm turbo run lint              # Lint all packages
```

### Infrastructure (Docker)
```bash
docker compose -f docker-compose.dev.yml up -d   # Start PostgreSQL + Redis only (local dev)
docker compose up -d                              # Start full stack
docker compose down                               # Stop services
docker compose down -v                            # Stop + reset database volumes
```

### Web App (from `apps/web/`)
```bash
pnpm run dev                     # Vite dev server at http://localhost:3000
pnpm run build                   # Production build
pnpm run lint                    # ESLint
pnpm run typecheck               # TypeScript type checking
pnpm run test                    # Vitest (single run)
pnpm run test:watch              # Vitest watch mode
pnpm run test:coverage           # Vitest with coverage
```

### Tauri Desktop (from `apps/web/`)
```bash
pnpm run tauri:dev               # Launch native window with live reload
pnpm run tauri:build             # Build .dmg (Mac) / .exe+.msi (Windows)
pnpm run tauri:icon              # Regenerate icons from public/icon-512.png
```

### Tauri Mobile (requires Android Studio / Xcode — see prerequisites below)
```bash
pnpm run android:dev             # Run on Android emulator
pnpm run android:build           # Build .apk + .aab
pnpm run ios:dev                 # Run on iOS simulator (Mac only)
pnpm run ios:build               # Build .ipa (Mac + Xcode required)
```

### Mobile Prerequisites
Before running mobile commands, you need:
- **Android**: Install Android Studio, then run `pnpm tauri android init` from `apps/web/`
  - Android NDK 27+ required
  - Set `ANDROID_HOME` and `NDK_HOME` env vars
- **iOS**: Install Xcode (full app, not just CLT), then run `pnpm tauri ios init` from `apps/web/`
  - Apple Developer account required for device builds / App Store

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
python seed_users.py                    # Seed 6 demo users (1 per role)
python seed_comprehensive.py            # Full seed: 54 users + courses + AI providers
python seed_categories.py               # Seed course categories
python seed_cbc_competencies.py         # CBC curriculum competencies
python seed_parent_data.py              # Parent demo family (1 parent + 4 children)
python seed_admin_data.py               # Admin-specific data
python seed_instructor.py               # Instructor-specific data
python seed_staff_data.py               # Staff-specific data
python seed_student_dashboard.py        # Student dashboard demo data
python seed_partner_data.py             # Partner-specific data
python seed_products.py                 # Store products
```

### Demo Credentials (after seeding)
See `DEMO_CREDENTIALS.md` for full details. Quick reference after running `python seed_users.py`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@urbanhomeschool.co.ke` | `Admin@2026!` |
| Staff | `staff@urbanhomeschool.co.ke` | `Staff@2026!` |
| Instructor | `instructor@urbanhomeschool.co.ke` | `Instructor@2026!` |
| Parent | `parent@urbanhomeschool.co.ke` | `Parent@2026!` |
| Student | `student@urbanhomeschool.co.ke` | `Student@2026!` |
| Partner | `partner@urbanhomeschool.co.ke` | `Partner@2026!` |

### E2E Tests (from project root)
```bash
npx playwright test                     # Run all Playwright tests
npx playwright test e2e/staff/          # Run staff E2E tests
npx playwright test --project=chromium  # Desktop only
```

### CI/CD
GitHub Actions workflows:
- `security.yml` — runs on push to main/develop: pip-audit, pnpm audit, ruff, ESLint, typecheck, pytest
- `desktop-build.yml` — triggers on `v*` tags: Mac universal .dmg + Windows .msi/.exe
- `mobile-build.yml` — triggers on `v*` tags: Android .apk/.aab + iOS .ipa

To release: `git tag v1.0.0 && git push --tags`

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

### Frontend Structure (apps/web/src/)

```
apps/web/src/
├── App.tsx                    # Root component: imports and composes all route modules (~65 lines)
├── main.tsx                   # Entry point, conditional PWA registration, theme init
├── routes/                    # Route definitions extracted from App.tsx (per-role files)
│   ├── index.tsx              # Central export for all role routes
│   ├── routeHelpers.tsx       # S = Suspense wrapper shorthand for lazy routes
│   ├── publicRoutes.tsx       # Public/unauthenticated routes
│   ├── sharedAuthRoutes.tsx   # Routes shared across roles (auto-detects role)
│   ├── docsRoutes.tsx         # Documentation pages at /docs/*
│   ├── studentRoutes.tsx      # ~96 student routes
│   ├── parentRoutes.tsx       # ~38 parent routes
│   ├── instructorRoutes.tsx   # ~48 instructor routes
│   ├── adminRoutes.tsx        # ~36 admin routes
│   ├── partnerRoutes.tsx      # ~31 partner routes
│   └── staffRoutes.tsx        # ~32 staff routes
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
│   ├── api.ts                 # Thin wrapper around @uhs/api-client factory
│   ├── authService.ts         # Login, register, logout
│   └── admin/, student/, parent/, partner/, staff/
├── hooks/                     # Custom hooks (WebSocket, WebRTC, Yjs, LiveKit, etc.)
│   └── usePlatform.ts         # Platform detection (web/desktop/android/ios)
├── types/                     # TypeScript interfaces (11 files, role-specific)
├── i18n/                      # i18next config + locales (en.json, sw.json)
└── utils/                     # dashboardDetection.ts (role-based routing)
```

**Key frontend patterns:**
- `@/` path alias maps to `src/` (configured in tsconfig + vite)
- Code splitting with `React.lazy` for all dashboard pages; use `<S>` from `routes/routeHelpers.tsx` as shorthand for `<Suspense>` wrapping lazy routes
- `<ProtectedRoute>` component guards authenticated routes
- Zustand stores with `persist` middleware for localStorage sync
- Axios interceptor handles silent JWT refresh on 401 (via `@uhs/api-client` factory)
- Theme: dark mode default, class-based toggling via `useThemeStore`
- Custom Tailwind colors: `copilot-blue`, `copilot-cyan`, `copilot-green`, `copilot-purple`, `copilot-orange`, `copilot-teal`
- PWA: Service worker (`sw.ts`) with VitePWA — disabled when `TAURI_ENV_PLATFORM` is set
- Platform detection: `usePlatform()` hook or `@uhs/config` `isTauri()`, `getPlatform()`

### Shared Packages (packages/)

| Package | Import | Contents |
|---------|--------|----------|
| `@uhs/tsconfig` | n/a (devDep only) | Shared TypeScript configs: base.json, react.json, node.json |
| `@uhs/core-types` | `@uhs/core-types/student` etc. | 12 domain type files via subpath exports |
| `@uhs/utils` | `@uhs/utils` | dashboardDetection, courseCode, cbcLookup |
| `@uhs/config` | `@uhs/config` | Zod env validation (`validateEnv`), platform detection (`isTauri`, `getPlatform`) |
| `@uhs/api-client` | `@uhs/api-client` | `createApiClient(config)` Axios factory with refresh mutex |

### Tauri v2 Configuration

- **identifier**: `ke.urbanhomeschool.uhs`
- **capabilities**: `src-tauri/capabilities/default.json` — Tauri v2 permission scopes (required for production HTTP calls)
- **plugins**: http, store, deep-link, updater, log
- **Auto-updater**: configured to poll `https://api.urbanhomeschool.ke/releases/{{target}}/{{arch}}/{{current_version}}`
- **Cookie auth**: Vite proxies `/api` and `/ws` to backend when `TAURI_ENV_PLATFORM` is set, making cookies same-origin

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

See `.env.example` at project root for the full template. Key vars:

### Frontend (apps/web/.env)
```
VITE_PORT=3000
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Urban Home School
VITE_GOOGLE_CLIENT_ID=
```

### Backend (.env in backend/)
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
- All packages extend `@uhs/tsconfig/react.json` (apps) or `@uhs/tsconfig/base.json` (packages)
