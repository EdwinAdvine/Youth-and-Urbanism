# Architecture Overview

**Urban Home School (UHS v1) / Urban Bird v1**
*AI-Powered Educational Platform for Kenyan Students*

Version: 1.0.0
Last Updated: 2026-02-15

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Monorepo Structure](#monorepo-structure)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Multi-Role System](#multi-role-system)
6. [CBC Curriculum Alignment](#cbc-curriculum-alignment)
7. [AI Orchestration Layer (Urban Bird v1)](#ai-orchestration-layer-urban-bird-v1)
8. [Payment Processing Architecture](#payment-processing-architecture)
9. [Real-Time Features](#real-time-features)
10. [Security Architecture](#security-architecture)
11. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Urban Home School is a full-stack educational platform purpose-built for the Kenyan education market. The platform delivers AI-powered one-on-one tutoring aligned with Kenya's Competency-Based Curriculum (CBC), multi-role dashboards for students, parents, instructors, administrators, partners, and staff, alongside integrated payment processing through M-Pesa, PayPal, and Stripe.

The system is branded as "The Bird AI" (Urban Bird v1) when referring to the AI tutoring capabilities.

### High-Level System Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        FE[React 18 + TypeScript SPA]
        WS_CLIENT[WebSocket Clients]
        WEBRTC_CLIENT[WebRTC Peers]
    end

    subgraph "Reverse Proxy"
        NGINX[Nginx]
    end

    subgraph "Application Layer"
        API[FastAPI Backend<br/>Port 8000]
        WS_SERVER[WebSocket Server]
        WEBRTC_SIG[WebRTC Signaling]
        BG[Background Tasks<br/>SLA Monitor]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 16<br/>Port 5432)]
        REDIS[(Redis 7<br/>Port 6379)]
    end

    subgraph "External Services"
        subgraph "AI Providers"
            GEMINI[Google Gemini]
            CLAUDE[Anthropic Claude]
            GPT4[OpenAI GPT-4]
            GROQ[Groq / Llama]
            OPENROUTER[OpenRouter]
        end
        subgraph "Voice / Video AI"
            ELEVENLABS[ElevenLabs TTS]
            SYNTHESIA[Synthesia Video]
        end
        subgraph "Payment Gateways"
            MPESA[Safaricom M-Pesa]
            PAYPAL[PayPal]
            STRIPE[Stripe]
        end
        EMAIL[Email Service<br/>SMTP]
    end

    FE -->|HTTPS| NGINX
    WS_CLIENT -->|WSS| NGINX
    WEBRTC_CLIENT -->|WSS| NGINX
    NGINX -->|HTTP| API
    NGINX -->|WS| WS_SERVER
    NGINX -->|WS| WEBRTC_SIG

    API --> PG
    API --> REDIS
    API --> GEMINI
    API --> CLAUDE
    API --> GPT4
    API --> GROQ
    API --> OPENROUTER
    API --> ELEVENLABS
    API --> SYNTHESIA
    API --> MPESA
    API --> PAYPAL
    API --> STRIPE
    API --> EMAIL

    WS_SERVER --> REDIS
    BG --> PG

    style FE fill:#61dafb,color:#000
    style API fill:#009688,color:#fff
    style PG fill:#336791,color:#fff
    style REDIS fill:#d82c20,color:#fff
```

---

## Tech Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.x | UI library |
| | TypeScript | 5.x | Type-safe JavaScript |
| | Vite | 5.x | Build tool and dev server |
| | Tailwind CSS | 3.x | Utility-first CSS framework |
| | React Router | 7.x | Client-side routing |
| | Zustand | Latest | Lightweight state management |
| **Backend** | Python | 3.11+ | Server-side language |
| | FastAPI | Latest | Async web framework |
| | SQLAlchemy | 2.x | ORM and database toolkit |
| | Pydantic | 2.x | Data validation and serialization |
| | Uvicorn | Latest | ASGI server |
| | Alembic | Latest | Database migration tool |
| **Database** | PostgreSQL | 16 (Alpine) | Primary relational database |
| | Redis | 7 (Alpine) | Caching, sessions, token blacklist |
| **Infrastructure** | Docker | Latest | Containerization |
| | Docker Compose | Latest | Multi-container orchestration |
| | Nginx | Latest | Reverse proxy and static file server |
| **AI SDKs** | google-generativeai | Latest | Gemini integration |
| | anthropic | Latest | Claude integration |
| | openai | Latest | GPT-4 and OpenRouter integration |
| | elevenlabs | Latest | Text-to-speech |
| **Auth** | python-jose | Latest | JWT token handling |
| | passlib (bcrypt) | Latest | Password hashing |

### Frontend Libraries

| Library | Purpose |
|---------|---------|
| `axios` | HTTP client for API calls |
| `zustand` | State management (stores per feature) |
| `react-router-dom` | Routing with protected routes |
| `tailwindcss` | Utility CSS with custom "copilot" theme |
| `lucide-react` | Icon library |
| `framer-motion` | Animations |

### Backend Libraries

| Library | Purpose |
|---------|---------|
| `fastapi` | Async web framework with auto-docs |
| `sqlalchemy[asyncio]` | Async ORM with PostgreSQL |
| `asyncpg` | Async PostgreSQL driver |
| `redis.asyncio` | Async Redis client |
| `python-jose` | JWT creation and verification |
| `passlib[bcrypt]` | Password hashing |
| `pydantic[email]` | Request/response validation |
| `alembic` | Database migrations |

---

## Monorepo Structure

The project follows a monorepo layout with clearly separated frontend and backend directories.

```
urban-home-school/
|
+-- frontend/                       # React 18 SPA
|   +-- src/
|   |   +-- components/             # Feature-based component folders
|   |   |   +-- auth/               # Login, Signup, AuthModal
|   |   |   +-- bird-chat/          # The Bird AI chat interface
|   |   |   +-- co-pilot/           # AI CoPilot (chat, performance, sidebar)
|   |   |   +-- layout/             # DashboardLayout, Sidebar, Topbar
|   |   |   +-- dashboard/          # StatsCards, WelcomeWidget
|   |   |   +-- course/             # Course catalog and detail views
|   |   |   +-- student/            # Student-specific components
|   |   |   +-- parent/             # ParentSidebar, parent views
|   |   |   +-- instructor/         # InstructorSidebar, instructor views
|   |   |   +-- partner/            # PartnerSidebar, partner views
|   |   |   +-- admin/              # Admin-specific components
|   |   |   +-- staff/              # Staff-specific components
|   |   |   +-- store/              # E-commerce store components
|   |   |   +-- error/              # Error boundary, 404
|   |   |   +-- ProtectedRoute.tsx  # Auth guard wrapper
|   |   +-- pages/                  # Route-level page components
|   |   |   +-- DashboardStudent.tsx
|   |   |   +-- DashboardParent.tsx
|   |   |   +-- DashboardInstructor.tsx
|   |   |   +-- DashboardAdmin.tsx
|   |   |   +-- DashboardPartner.tsx
|   |   |   +-- DashboardStaff.tsx
|   |   +-- store/                  # Zustand state stores
|   |   |   +-- authStore.ts
|   |   |   +-- studentStore.ts
|   |   |   +-- parentStore.ts
|   |   |   +-- instructorStore.ts
|   |   |   +-- adminStore.ts
|   |   |   +-- staffStore.ts
|   |   |   +-- partnerStore.ts
|   |   |   +-- chatStore.ts
|   |   |   +-- coPilotStore.ts
|   |   |   +-- cartStore.ts
|   |   +-- services/               # API service layer
|   |   +-- types/                  # TypeScript type definitions
|   |   +-- App.tsx                 # Root component with routing
|   |   +-- main.tsx                # Entry point
|   +-- tailwind.config.js          # Custom theme (copilot colors)
|   +-- vite.config.ts              # Vite configuration
|   +-- package.json
|
+-- backend/                        # FastAPI server
|   +-- app/
|   |   +-- main.py                 # FastAPI app initialization, middleware, routers
|   |   +-- config.py               # Settings from environment variables
|   |   +-- database.py             # SQLAlchemy async engine and sessions
|   |   +-- models/                 # SQLAlchemy ORM models
|   |   |   +-- user.py             # User model (6 roles, JSONB profile)
|   |   |   +-- student.py          # Student model
|   |   |   +-- ai_tutor.py         # AI tutor instance per student
|   |   |   +-- ai_provider.py      # Admin-configured AI providers
|   |   |   +-- course.py           # CBC-aligned courses
|   |   |   +-- enrollment.py       # Student-course enrollment
|   |   |   +-- assessment.py       # Quizzes, assignments, exams
|   |   |   +-- payment.py          # Transactions, wallets, payment methods
|   |   |   +-- forum.py            # Community forum posts
|   |   |   +-- notification.py     # Push notifications
|   |   |   +-- certificate.py      # Course completion certificates
|   |   |   +-- instructor/         # Instructor-specific models
|   |   |   +-- parent/             # Parent-specific models
|   |   |   +-- partner/            # Partner-specific models
|   |   |   +-- admin/              # Admin-specific models
|   |   |   +-- staff/              # Staff-specific models
|   |   +-- schemas/                # Pydantic request/response schemas
|   |   +-- api/v1/                 # Versioned API route handlers
|   |   |   +-- auth.py             # Authentication endpoints
|   |   |   +-- ai_tutor.py         # AI tutor chat endpoints
|   |   |   +-- courses.py          # Course CRUD and enrollment
|   |   |   +-- payments.py         # Payment processing
|   |   |   +-- assessments.py      # Assessment management
|   |   |   +-- users.py            # User profile management
|   |   |   +-- forum.py            # Community forum
|   |   |   +-- notifications.py    # Notification system
|   |   |   +-- certificates.py     # Certificate validation
|   |   |   +-- categories.py       # CBC categories
|   |   |   +-- store.py            # E-commerce store
|   |   |   +-- search.py           # Global search
|   |   |   +-- contact.py          # Contact form
|   |   |   +-- ai_agent_profile.py # Per-user AI customization
|   |   |   +-- instructor_applications.py
|   |   |   +-- student/            # Student dashboard APIs
|   |   |   +-- parent/             # Parent dashboard APIs
|   |   |   +-- instructor/         # Instructor dashboard APIs
|   |   |   +-- admin/              # Admin dashboard APIs
|   |   |   +-- staff/              # Staff dashboard APIs
|   |   |   +-- partner/            # Partner dashboard APIs
|   |   +-- services/               # Business logic layer
|   |   |   +-- ai_orchestrator.py  # Multi-AI routing engine
|   |   |   +-- auth_service.py     # Authentication logic
|   |   |   +-- course_service.py   # Course management
|   |   |   +-- payment_service.py  # Payment processing
|   |   |   +-- email_service.py    # Email sending
|   |   |   +-- student/            # Student-specific services
|   |   |   +-- parent/             # Parent-specific services
|   |   |   +-- instructor/         # Instructor-specific services
|   |   |   +-- admin/              # Admin-specific services
|   |   |   +-- staff/              # Staff-specific services
|   |   |   +-- partner/            # Partner-specific services
|   |   +-- utils/                  # Utilities
|   |   |   +-- security.py         # JWT, password hashing, encryption
|   |   +-- middleware/             # Custom middleware
|   |   |   +-- error_logging_middleware.py
|   |   |   +-- audit_middleware.py
|   |   +-- websocket/              # WebSocket handlers
|   |       +-- connection_manager.py
|   |       +-- instructor_connection_manager.py
|   |       +-- parent_connection_manager.py
|   |       +-- webrtc_signaling.py
|   |       +-- yjs_handler.py
|   |       +-- live_chat_handler.py
|   +-- alembic/                    # Database migrations
|   +-- tests/                      # Pytest test suite
|   +-- seed_users.py               # Database seeder
|   +-- main.py                     # Uvicorn entry point
|   +-- requirements.txt
|
+-- docker-compose.yml              # Full stack Docker Compose
+-- docker-compose.dev.yml          # Dev services (PostgreSQL + Redis only)
+-- CLAUDE.md                       # Project instructions
+-- docs/                           # Technical documentation
```

---

## Data Flow Architecture

### Request Lifecycle

```mermaid
sequenceDiagram
    participant Client as React SPA
    participant Nginx as Nginx Proxy
    participant API as FastAPI
    participant Auth as Auth Middleware
    participant Service as Service Layer
    participant DB as PostgreSQL
    participant Cache as Redis
    participant AI as AI Orchestrator

    Client->>Nginx: HTTPS Request
    Nginx->>API: Forward to Backend (Port 8000)
    API->>Auth: JWT Verification
    Auth->>Cache: Check Token Blacklist
    Cache-->>Auth: Token Status
    Auth-->>API: User Context

    API->>Service: Business Logic Call
    Service->>Cache: Check Cache
    alt Cache Hit
        Cache-->>Service: Cached Data
    else Cache Miss
        Service->>DB: SQL Query (SQLAlchemy)
        DB-->>Service: Query Result
        Service->>Cache: Store in Cache
    end

    alt AI Request
        Service->>AI: Route Query
        AI->>AI: Classify Task Type
        AI->>AI: Select Best Provider
        AI-->>Service: AI Response
    end

    Service-->>API: Response Data
    API-->>Nginx: JSON Response
    Nginx-->>Client: HTTPS Response
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| **Client (React SPA)** | User interface, form validation, state management, WebSocket connections |
| **Nginx** | TLS termination, reverse proxy, static file serving, rate limiting |
| **FastAPI Routes** | Request parsing, input validation (Pydantic), HTTP response formatting |
| **Auth Middleware** | JWT verification, role-based access control, token blacklist checking |
| **Service Layer** | Business logic, data transformation, cross-cutting concerns |
| **AI Orchestrator** | Provider selection, task routing, failover management, response formatting |
| **PostgreSQL** | Persistent data storage, ACID transactions, full-text search |
| **Redis** | Session caching, token blacklist, rate limit counters, frequently accessed data |

---

## Multi-Role System

The platform supports six distinct user roles, each with dedicated dashboard interfaces, API routes, WebSocket channels, and state management stores.

### Role Architecture

```mermaid
graph LR
    subgraph "Authentication Layer"
        JWT[JWT with Role Claim]
    end

    subgraph "Role-Based Dashboards"
        S[Student Dashboard]
        P[Parent Dashboard]
        I[Instructor Dashboard]
        A[Admin Dashboard]
        ST[Staff Dashboard]
        PA[Partner Dashboard]
    end

    subgraph "Shared Services"
        AI_TUTOR[AI Tutor<br/>Students Only]
        COURSES[Course Catalog]
        PAYMENTS[Payment System]
        FORUM[Community Forum]
        NOTIFICATIONS[Notifications]
    end

    JWT --> S
    JWT --> P
    JWT --> I
    JWT --> A
    JWT --> ST
    JWT --> PA

    S --> AI_TUTOR
    S --> COURSES
    S --> PAYMENTS

    P --> COURSES
    P --> PAYMENTS

    I --> COURSES
    I --> PAYMENTS

    A --> COURSES
    A --> PAYMENTS
    A --> AI_TUTOR
```

### Role Details

| Role | Dashboard Component | Sidebar Component | Backend API Prefix | WebSocket Channel | Zustand Store |
|------|-------------------|-------------------|-------------------|-------------------|--------------|
| **Student** | `DashboardStudent.tsx` | Default sidebar | `/api/v1/student/*` | `/ws/student/{token}` | `studentStore.ts` |
| **Parent** | `DashboardParent.tsx` | `ParentSidebar.tsx` | `/api/v1/parent/*` | `/ws/parent/{token}` | `parentStore.ts` |
| **Instructor** | `DashboardInstructor.tsx` | `InstructorSidebar.tsx` | `/api/v1/instructor/*` | `/ws/instructor/{token}` | `instructorStore.ts` |
| **Admin** | `DashboardAdmin.tsx` | Default sidebar | `/api/v1/admin/*` | `/ws/admin/{token}` | `adminStore.ts` |
| **Staff** | `DashboardStaff.tsx` | Default sidebar | `/api/v1/staff/*` | `/ws/staff/{token}` | `staffStore.ts` |
| **Partner** | `DashboardPartner.tsx` | `PartnerSidebar.tsx` | `/api/v1/partner/*` | `/ws/partner/{token}` | `partnerStore.ts` |

### Role Permissions Matrix

| Feature | Student | Parent | Instructor | Admin | Staff | Partner |
|---------|---------|--------|------------|-------|-------|---------|
| AI Tutor Chat | Full | -- | -- | Manage | -- | -- |
| Course Enrollment | Full | View Child's | -- | Full | View | Sponsor |
| Course Creation | -- | -- | Full | Full | Create | -- |
| Payment Initiation | Full | Full | Payout | Full | -- | Full |
| Forum Access | Full | Read | Full | Moderate | Moderate | Read |
| Analytics | Own Progress | Child's Progress | Own Courses | Full | Delegated | Own Campaigns |
| User Management | -- | Linked Children | Own Students | Full | Delegated | -- |
| AI Provider Config | -- | -- | -- | Full | -- | -- |

---

## CBC Curriculum Alignment

The platform is built around Kenya's Competency-Based Curriculum (CBC) framework, which structures education into progressive levels.

### CBC Grade Levels Supported

| Level | Grades | Age Range | Description |
|-------|--------|-----------|-------------|
| **Pre-Primary** | PP1, PP2 | 4-5 years | Foundation stage |
| **Lower Primary** | Grade 1-3 | 6-8 years | Early years education |
| **Upper Primary** | Grade 4-6 | 9-11 years | Middle years education |
| **Junior Secondary** | Grade 7-9 | 12-14 years | Junior secondary |
| **Senior Secondary** | Grade 10-12 | 15-17 years | Senior secondary (pathways) |

### Learning Areas

Courses in the platform are tagged with CBC learning areas:

- Mathematics
- English
- Kiswahili
- Science and Technology
- Social Studies
- Creative Arts
- Physical and Health Education
- Religious Education (CRE/IRE/HRE)
- Agriculture
- Home Science
- Business Studies
- Pre-Technical Studies

### CBC-Aligned Data Model

The `courses` table includes:
- `grade_levels` (array): Which CBC grades the course applies to
- `learning_area` (string): CBC learning area classification
- `syllabus` (JSONB): Structured syllabus aligned with CBC competencies
- `lessons` (JSONB): Lesson content with CBC strand and sub-strand references

---

## AI Orchestration Layer (Urban Bird v1)

The AI Orchestrator is the core differentiating feature of the platform. It dynamically routes student queries to the most suitable AI provider based on task classification, provider availability, and administrative configuration.

### Orchestration Flow

```mermaid
flowchart TD
    START[Student Sends Message] --> CLASSIFY[Task Classification]
    CLASSIFY --> |General| GENERAL[General Knowledge]
    CLASSIFY --> |Reasoning| REASONING[Math/Logic/Analysis]
    CLASSIFY --> |Creative| CREATIVE[Writing/Art/Stories]
    CLASSIFY --> |Research| RESEARCH[Current Events/Facts]

    GENERAL --> SELECT[Select Best Provider]
    REASONING --> SELECT
    CREATIVE --> SELECT
    RESEARCH --> SELECT

    SELECT --> |Recommended + Specialized| PRIMARY[Primary Provider]
    SELECT --> |Recommended + General| SECONDARY[Secondary Provider]
    SELECT --> |First Available| TERTIARY[Tertiary Provider]

    PRIMARY --> EXECUTE[Execute Query]
    SECONDARY --> EXECUTE
    TERTIARY --> EXECUTE

    EXECUTE --> |Success| MODE{Response Mode?}
    EXECUTE --> |Failure| FALLBACK[Fallback Chain]
    FALLBACK --> |Gemini| FB1[Try Gemini]
    FALLBACK --> |Groq| FB2[Try Groq]
    FALLBACK --> |OpenRouter| FB3[Try OpenRouter]

    FB1 --> MODE
    FB2 --> MODE
    FB3 --> MODE

    MODE --> |text| TEXT_RESP[Return Text]
    MODE --> |voice| VOICE[Text + ElevenLabs TTS]
    MODE --> |video| VIDEO[Text + Synthesia Video]

    TEXT_RESP --> SAVE[Save to Conversation History]
    VOICE --> SAVE
    VIDEO --> SAVE

    SAVE --> RESPOND[Return ChatResponse]
```

### AI Provider Registry

Providers are managed dynamically through the database (`ai_providers` table). Admins can add, remove, or reconfigure providers without code changes.

| Provider | Type | Default Model | Specialization | Priority |
|----------|------|--------------|----------------|----------|
| **Gemini** | Text | `gemini-2.5-flash` | General, default | Primary |
| **Groq** | Text | `llama-3.3-70b-versatile` | General, fast inference | Secondary |
| **OpenRouter** | Text | `nvidia/nemotron-nano-9b-v2:free` | General, cost-effective | Tertiary |
| **Claude** | Text | `claude-3-5-sonnet` | Creative, detailed explanations | Specialized |
| **GPT-4** | Text | `gpt-4` | Reasoning, analysis | Specialized |
| **ElevenLabs** | Voice | `eleven_multilingual_v2` | Text-to-speech | Voice output |
| **Synthesia** | Video | -- | AI-generated video lessons | Video output (planned) |

### Task Classification

The orchestrator uses keyword-based classification (extensible to ML-based classification):

| Task Type | Trigger Keywords | Preferred Provider |
|-----------|-----------------|-------------------|
| `reasoning` | solve, calculate, prove, analyze, compare, explain, math | Gemini or GPT-4 |
| `creative` | write, create, story, poem, imagine, compose | Claude |
| `research` | research, find, search, latest, current, news | Gemini or Groq |
| `general` | (default) | Recommended provider |

### Provider Failover Chain

1. Attempt primary provider (selected by specialization + recommendation)
2. On failure, try Gemini fallback
3. On failure, try Groq fallback
4. On failure, try OpenRouter fallback
5. On total failure, return graceful error message

### AI Agent Profile

Each user can customize their AI agent's behavior through the `ai_agent_profile` API, allowing personalized:
- Communication style preferences
- Subject focus areas
- Response verbosity levels
- Language preferences

---

## Payment Processing Architecture

The platform supports three payment gateways to serve both local Kenyan and international users.

### Payment Flow

```mermaid
sequenceDiagram
    participant User as Student/Parent
    participant FE as Frontend
    participant API as Backend API
    participant GW as Payment Gateway
    participant DB as Database
    participant WALLET as Instructor Wallet

    User->>FE: Select Course + Payment Method
    FE->>API: POST /payments/initiate
    API->>DB: Create Transaction (pending)

    alt M-Pesa
        API->>GW: STK Push Request
        GW-->>API: CheckoutRequestID
        API-->>FE: "Check your phone"
        GW->>API: POST /payments/mpesa/callback
        API->>DB: Update Transaction (completed)
    else PayPal
        API->>GW: Create Order
        GW-->>API: Approval URL
        API-->>FE: Redirect to PayPal
        User->>GW: Approve Payment
        GW->>API: POST /payments/paypal/webhook
        API->>DB: Update Transaction (completed)
    else Stripe
        API->>GW: Create PaymentIntent
        GW-->>API: Client Secret
        API-->>FE: Client Secret
        FE->>GW: Confirm Payment (Stripe.js)
        GW->>API: POST /payments/stripe/webhook
        API->>DB: Update Transaction (completed)
    end

    API->>DB: Create Enrollment
    API->>WALLET: Revenue Split (60/30/10)
    WALLET->>DB: Credit Instructor Wallet
    API-->>FE: Enrollment Confirmed
```

### Revenue Split Model

For courses created by external instructors:

| Recipient | Share | Description |
|-----------|-------|-------------|
| Instructor | 60% | Course creator revenue |
| Platform | 30% | Urban Home School operations |
| Marketing/Support | 10% | Marketing and customer support |

For platform-created courses (admin), 100% goes to the platform.

### Supported Currencies

| Currency | Code | Primary Gateway |
|----------|------|----------------|
| Kenyan Shilling | KES | M-Pesa |
| US Dollar | USD | PayPal, Stripe |
| Euro | EUR | PayPal, Stripe |
| British Pound | GBP | PayPal, Stripe |

### Payout System

Instructors can request payouts from their wallet balance:
- **M-Pesa Payout**: Minimum KES 100
- **Bank Transfer**: Minimum KES 1,000

---

## Real-Time Features

The platform uses WebSocket connections and WebRTC for real-time functionality across all roles.

### WebSocket Architecture

```mermaid
graph TD
    subgraph "WebSocket Endpoints"
        WS_ADMIN["/ws/admin/{token}"]
        WS_STAFF["/ws/staff/{token}"]
        WS_INSTRUCTOR["/ws/instructor/{token}"]
        WS_PARENT["/ws/parent/{token}"]
        WS_STUDENT["/ws/student/{token}"]
        WS_PARTNER["/ws/partner/{token}"]
        WS_YJS["/ws/yjs/{doc_id}/{token}"]
        WS_SUPPORT["/ws/support-chat/{ticket_id}/{token}"]
        WS_WEBRTC["/ws/webrtc/{room_id}/{token}"]
    end

    subgraph "Connection Managers"
        CM_GENERAL[General WS Manager]
        CM_INSTRUCTOR[Instructor WS Manager]
        CM_PARENT[Parent WS Manager]
        CM_YJS[Yjs CRDT Manager]
        CM_CHAT[Live Chat Manager]
        CM_WEBRTC[WebRTC Signaling Manager]
    end

    WS_ADMIN --> CM_GENERAL
    WS_STAFF --> CM_GENERAL
    WS_STUDENT --> CM_GENERAL
    WS_PARTNER --> CM_GENERAL
    WS_INSTRUCTOR --> CM_INSTRUCTOR
    WS_PARENT --> CM_PARENT
    WS_YJS --> CM_YJS
    WS_SUPPORT --> CM_CHAT
    WS_WEBRTC --> CM_WEBRTC
```

### WebSocket Channels

| Endpoint | Auth Required | Role | Purpose |
|----------|--------------|------|---------|
| `/ws/admin/{token}` | JWT (admin/staff) | Admin | Real-time platform metrics, alerts |
| `/ws/staff/{token}` | JWT (staff/admin) | Staff | Support counters, SLA warnings, notifications |
| `/ws/instructor/{token}` | JWT (instructor) | Instructor | Student activity, earnings notifications, badges |
| `/ws/parent/{token}` | JWT (parent) | Parent | Child progress, messages, achievement alerts |
| `/ws/student/{token}` | JWT (student) | Student | Progress updates, notifications, achievements |
| `/ws/partner/{token}` | JWT (partner) | Partner | Campaign analytics, notifications |
| `/ws/yjs/{doc_id}/{token}` | JWT (staff/admin/instructor) | Collaborative | Yjs CRDT real-time document editing |
| `/ws/support-chat/{ticket_id}/{token}` | JWT (any) | Support | Live support chat on tickets |
| `/ws/webrtc/{room_id}/{token}` | JWT (instructor/student/staff/admin) | Video | WebRTC signaling for live video sessions |

### WebRTC Video Sessions

The platform supports live video sessions between instructors and students using WebRTC:

- **Signaling**: WebSocket-based signaling (`/ws/webrtc/{room_id}/{token}`)
- **STUN/TURN**: Configurable ICE servers via `/api/v1/instructor/sessions/{session_id}/ice-config`
- **Participants**: Configurable maximum participants per room
- **Roles**: Instructor, student, staff, and admin can join sessions

### Background Processes

- **SLA Monitor**: Runs every 60 seconds, checks for SLA breaches on support tickets, and triggers escalations
- **Email Sending**: Background tasks for verification emails, password resets, and notifications

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as FastAPI
    participant Auth as Auth Service
    participant DB as PostgreSQL
    participant Redis as Redis

    Note over Client,Redis: Registration
    Client->>API: POST /auth/register
    API->>Auth: Validate + Hash Password (bcrypt)
    Auth->>DB: Create User
    Auth->>API: Send Verification Email (background)
    API-->>Client: UserResponse (201)

    Note over Client,Redis: Login
    Client->>API: POST /auth/login
    API->>Auth: Verify Password (bcrypt)
    Auth->>DB: Fetch User
    Auth->>Auth: Generate JWT (access + refresh)
    API-->>Client: TokenResponse (access_token, refresh_token)

    Note over Client,Redis: Authenticated Request
    Client->>API: GET /api/v1/... (Bearer token)
    API->>Redis: Check Token Blacklist
    Redis-->>API: Not Blacklisted
    API->>Auth: Decode + Verify JWT
    Auth-->>API: User Context (id, role)
    API->>API: Check Role Permissions
    API-->>Client: Response Data

    Note over Client,Redis: Logout
    Client->>API: POST /auth/logout (Bearer token)
    API->>Redis: Add Token to Blacklist (TTL = remaining lifetime)
    API-->>Client: "Logged out successfully"
```

### Security Layers

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| **Transport** | TLS/SSL (HTTPS) | Encrypted communication via Nginx + Let's Encrypt |
| **Authentication** | JWT Bearer Tokens | Access tokens (30 min) + refresh tokens |
| **Password Storage** | bcrypt (passlib) | Salted hashing with configurable rounds |
| **Authorization** | Role-Based Access Control (RBAC) | 6 roles with granular endpoint permissions |
| **Token Blacklist** | Redis | Revoked tokens stored with TTL matching expiry |
| **API Key Encryption** | Fernet (AES-128-CBC) | AI provider API keys encrypted at rest |
| **Input Validation** | Pydantic v2 | Strict request validation with type checking |
| **SQL Injection** | SQLAlchemy ORM | Parameterized queries by default |
| **CORS** | FastAPI CORSMiddleware | Restricted origins (`localhost:3000`, `127.0.0.1:3000`) |
| **Rate Limiting** | Nginx + Application | Request rate limiting on sensitive endpoints |
| **Audit Logging** | AuditMiddleware | All POST/PUT/PATCH/DELETE to admin/staff logged |
| **Error Logging** | ErrorLoggingMiddleware | Unhandled exceptions captured to `error_logs` table |
| **Soft Deletes** | `is_deleted` flag | Data recovery capability, prevents permanent loss |
| **Email Enumeration** | Constant-time response | `/forgot-password` always returns success |

### JWT Token Structure

```json
{
  "sub": "user-uuid-here",
  "role": "student",
  "email": "user@example.com",
  "type": "access",
  "exp": 1708012345,
  "iat": 1708010545
}
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

---

## Deployment Architecture

### Production Deployment (Contabo VDS)

```mermaid
graph TB
    subgraph "Internet"
        USERS[Users / Browsers]
        CF[Cloudflare CDN + DDoS Protection]
    end

    subgraph "Contabo VDS (4-8 GB RAM, 4 Cores)"
        subgraph "Docker Network"
            NGINX_C[Nginx Container<br/>Port 80/443]
            API_C[FastAPI Container<br/>tuhs_backend<br/>Port 8000]
            PG_C[(PostgreSQL Container<br/>tuhs_postgres<br/>Port 5432)]
            REDIS_C[(Redis Container<br/>tuhs_redis<br/>Port 6379)]
        end

        STATIC[/var/www/tuhs<br/>Static Frontend Files]
        BACKUPS[/backups<br/>Daily Database Backups]
    end

    subgraph "External Storage"
        BACKUP_STORE[External Backup Storage]
    end

    USERS --> CF
    CF --> NGINX_C
    NGINX_C --> |"/ (static)"| STATIC
    NGINX_C --> |"/api/*"| API_C
    NGINX_C --> |"/ws/*"| API_C
    API_C --> PG_C
    API_C --> REDIS_C
    PG_C --> BACKUPS
    BACKUPS --> BACKUP_STORE
```

### Docker Compose Services

| Service | Image | Container Name | Exposed Port | Healthcheck |
|---------|-------|---------------|-------------|-------------|
| PostgreSQL | `postgres:16-alpine` | `tuhs_postgres` | 5432 | `pg_isready` |
| Redis | `redis:7-alpine` | `tuhs_redis` | 6379 | `redis-cli ping` |
| Backend | `./backend` (Dockerfile) | `tuhs_backend` | 8000 | `/health` endpoint |
| Frontend | `./frontend` (Dockerfile) | `tuhs_frontend` | 3000 | HTTP check |

### Development Setup

```bash
# Start database and cache only (for local frontend/backend dev)
docker compose -f docker-compose.dev.yml up -d

# Start full stack
docker compose up -d

# Stop all services
docker compose down

# Reset database (remove volumes)
docker compose down -v
```

### Nginx Configuration Overview

| Route Pattern | Target | Description |
|--------------|--------|-------------|
| `/` | Static files (`/var/www/tuhs`) | Frontend SPA |
| `/api/v1/*` | `http://localhost:8000` | Backend API proxy |
| `/ws/*` | `ws://localhost:8000` | WebSocket proxy |
| `/docs` | `http://localhost:8000/docs` | Swagger UI |
| `/redoc` | `http://localhost:8000/redoc` | ReDoc UI |

### Environment Configuration

The application reads configuration from environment variables via Pydantic `Settings` class in `app/config.py`.

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://user:pass@localhost:5432/tuhs_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SECRET_KEY` | JWT signing key | Random 64-character string |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | `sk_...` |

**Optional Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | -- |
| `OPENAI_API_KEY` | OpenAI API key | -- |
| `DEBUG` | Debug mode | `True` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

---

## Additional Resources

- [API Reference Overview](api-reference/README.md) -- Complete API endpoint documentation
- [Authentication API](api-reference/authentication.md) -- Auth endpoints reference
- [AI Tutor API](api-reference/ai-tutor.md) -- AI tutoring endpoints reference
- [Courses API](api-reference/courses.md) -- Course management endpoints reference
- [Payments API](api-reference/payments.md) -- Payment processing endpoints reference
- Interactive API Docs: `http://localhost:8000/docs` (Swagger UI)
- Alternative API Docs: `http://localhost:8000/redoc` (ReDoc)
