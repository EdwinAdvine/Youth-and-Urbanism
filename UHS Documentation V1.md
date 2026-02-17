UHS v1 / Urban Bird v1 - Comprehensive Documentation Plan
Context
The Urban Home School project has 37+ documentation files scattered across root, backend/, and frontend/ directories. The codebase has 296 frontend pages, 20+ API route modules, 15+ database models, and 12+ services - all lacking consistent documentation. This plan consolidates existing docs, creates comprehensive technical + user-facing documentation, adds in-code comments throughout, and builds public documentation pages accessible from the website footer.

Two products branded in this release:

Urban Home School v1 (UHS v1) - The full educational platform
Urban Bird v1 - The AI system (AI Tutor, CoPilot, Orchestrator)
Phase 1: Consolidate Existing Documentation into /docs/
1.1 Create folder structure

docs/
├── README.md                              # Master index / table of contents
├── CHANGELOG.md                           # v1 release notes
├── planning/                              # Historical planning docs
│   ├── admin-dashboard-plan.md
│   ├── instructor-dashboard-plan.md
│   ├── parent-dashboard-plan.md
│   ├── partner-dashboard-plan.md
│   ├── student-dashboard-plan.md
│   ├── staff-teachers-plan.md
│   ├── implementation-plan.md
│   └── ai-functions-inventory.md
├── completion-reports/                    # Phase completion records
│   ├── phase-1-complete.md
│   ├── phase-2-complete.md
│   ├── phase-2-migration-complete.md
│   ├── phase-3-integration.md
│   ├── phase-4-admin-panel.md
│   ├── phase-5a-complete-platform.md
│   ├── phase-5b-payment-integration.md
│   ├── course-management-complete.md
│   ├── course-system-enhancements.md
│   ├── schema-design-complete.md
│   ├── migration-guide.md
│   ├── testing-phase-1-complete.md
│   └── testing-phase-2-complete.md
├── technical/                             # Comprehensive technical documentation
│   ├── architecture-overview.md
│   ├── getting-started.md
│   ├── api-reference/
│   │   ├── README.md                      # API overview + auth guide
│   │   ├── authentication.md
│   │   ├── users.md
│   │   ├── ai-tutor.md
│   │   ├── courses.md
│   │   ├── enrollments.md
│   │   ├── payments.md
│   │   ├── assessments.md
│   │   ├── forum.md
│   │   ├── notifications.md
│   │   ├── store.md
│   │   ├── certificates.md
│   │   ├── categories.md
│   │   ├── search.md
│   │   ├── contact.md
│   │   ├── instructor-applications.md
│   │   ├── ai-agent-profile.md
│   │   ├── student-dashboard-api.md
│   │   ├── parent-dashboard-api.md
│   │   ├── instructor-dashboard-api.md
│   │   ├── admin-dashboard-api.md
│   │   ├── staff-dashboard-api.md
│   │   └── partner-dashboard-api.md
│   ├── database/
│   │   ├── schema-overview.md
│   │   ├── models-reference.md
│   │   ├── relationships.md
│   │   └── migrations.md
│   ├── frontend/
│   │   ├── component-architecture.md
│   │   ├── routing-map.md
│   │   ├── state-management.md
│   │   ├── theming.md
│   │   └── pages-by-role/
│   │       ├── student-pages.md
│   │       ├── parent-pages.md
│   │       ├── instructor-pages.md
│   │       ├── admin-pages.md
│   │       ├── staff-pages.md
│   │       └── partner-pages.md
│   ├── ai-system/                         # Urban Bird v1 technical docs
│   │   ├── orchestrator.md
│   │   ├── providers.md
│   │   ├── copilot.md
│   │   ├── task-routing.md
│   │   └── failover.md
│   ├── payments/
│   │   ├── overview.md
│   │   ├── mpesa-integration.md
│   │   ├── paypal-integration.md
│   │   └── stripe-integration.md
│   ├── realtime/
│   │   ├── websockets.md
│   │   └── webrtc.md
│   ├── security/
│   │   ├── authentication-flow.md
│   │   ├── rbac.md
│   │   ├── encryption.md
│   │   └── data-protection.md
│   └── deployment/
│       ├── docker-setup.md
│       ├── contabo-deployment.md
│       └── environment-variables.md
├── user-guide/                            # Source content for in-app docs
│   ├── getting-started.md
│   ├── uhs-v1/                            # Urban Home School platform guides
│   │   ├── student-guide.md
│   │   ├── parent-guide.md
│   │   ├── instructor-guide.md
│   │   ├── partner-guide.md
│   │   ├── courses.md
│   │   ├── assessments.md
│   │   ├── payments.md
│   │   ├── forum.md
│   │   ├── store.md
│   │   └── certificates.md
│   ├── urban-bird-v1/                     # AI system user guides
│   │   ├── ai-tutor.md
│   │   ├── copilot.md
│   │   ├── voice-mode.md
│   │   └── learning-paths.md
│   └── faq.md
└── screenshots/                           # Placeholder image directories
    ├── README.md                          # Guide for which screenshots are needed
    ├── home/
    ├── student/
    ├── parent/
    ├── instructor/
    ├── admin/
    ├── staff/
    ├── partner/
    ├── ai-tutor/
    ├── courses/
    ├── payments/
    └── general/
1.2 File moves (git mv for history preservation)
Source	Destination
"Admin Plan.md"	docs/planning/admin-dashboard-plan.md
"Instructor Plan.md"	docs/planning/instructor-dashboard-plan.md
"Parents Plan.md"	docs/planning/parent-dashboard-plan.md
"Partners Plan.md"	docs/planning/partner-dashboard-plan.md
"Students.md"	docs/planning/student-dashboard-plan.md
"Staff:Teachers Plan.md"	docs/planning/staff-teachers-plan.md
"Complete AI Function.md"	docs/planning/ai-functions-inventory.md
IMPLEMENTATION_PLAN.md	docs/planning/implementation-plan.md
MIGRATION_GUIDE.md	docs/completion-reports/migration-guide.md
PHASE_5B_PAYMENT_INTEGRATION.md	docs/completion-reports/phase-5b-payment-integration.md
COURSE_MANAGEMENT_COMPLETE.md	docs/completion-reports/course-management-complete.md
COURSE_SYSTEM_ENHANCEMENTS.md	docs/completion-reports/course-system-enhancements.md
backend/PHASE_1_COMPLETE.md	docs/completion-reports/phase-1-complete.md
backend/PHASE_2_COMPLETE.md	docs/completion-reports/phase-2-complete.md
backend/PHASE_2_MIGRATION_COMPLETE.md	docs/completion-reports/phase-2-migration-complete.md
backend/SCHEMA_DESIGN_COMPLETE.md	docs/completion-reports/schema-design-complete.md
backend/TESTING_PHASE_1_COMPLETE.md	docs/completion-reports/testing-phase-1-complete.md
backend/TESTING_PHASE_2_COMPLETE.md	docs/completion-reports/testing-phase-2-complete.md
backend/QUICK_START.md	docs/technical/getting-started.md (merge content)
backend/DATABASE_SCHEMA.md	docs/technical/database/schema-overview.md (merge)
backend/app/services/PAYMENT_SERVICE_README.md	docs/technical/payments/overview.md (merge)
WebSocket implementation docs (backend/app/websocket/*.md)	docs/technical/realtime/
frontend/PHASE_3_INTEGRATION.md	docs/completion-reports/phase-3-integration.md
frontend/PHASE_4_ADMIN_PANEL.md	docs/completion-reports/phase-4-admin-panel.md
frontend/PHASE_5A_COMPLETE_PLATFORM.md	docs/completion-reports/phase-5a-complete-platform.md
Files that STAY in place:

CLAUDE.md (root) - Claude Code tool config
backend/README.md - Backend entry-point docs
frontend/README.md - Frontend entry-point docs
Component-level READMEs (contextual to their directories)
Phase 2: Write Comprehensive Technical Documentation
2.1 Architecture Overview (docs/technical/architecture-overview.md)
System diagram (text-based Mermaid)
Technology stack breakdown
Monorepo structure
Data flow: Client → API → Service → DB → Response
Multi-role system overview with table
CBC curriculum alignment explanation
2.2 API Reference (docs/technical/api-reference/)
Each file documents every endpoint with:

HTTP method + path
Description
Authentication requirements
Request body JSON example
Response JSON example
Error responses
curl example
Files to write (22 API reference docs):

authentication.md, users.md, ai-tutor.md, courses.md, enrollments.md, payments.md, assessments.md, forum.md, notifications.md, store.md, certificates.md, categories.md, search.md, contact.md, instructor-applications.md, ai-agent-profile.md
Role dashboard APIs (6): student, parent, instructor, admin, staff, partner
2.3 Database Reference (docs/technical/database/)
Every model with all columns, types, constraints, indexes
Relationship diagrams (Mermaid ER)
JSONB column structures documented
Migration history
2.4 Frontend Reference (docs/technical/frontend/)
Component tree and architecture
Complete routing map (all 296 pages listed by role)
Zustand store documentation (shape, actions, selectors)
Tailwind theme documentation (custom colors, spacing)
2.5 AI System / Urban Bird v1 (docs/technical/ai-system/)
Orchestrator architecture and provider loading
Task-based routing logic
Failover chain
Provider configuration (Gemini, Claude, GPT-4, Grok, ElevenLabs, Synthesia)
CoPilot sidebar architecture
2.6 Payment System (docs/technical/payments/)
M-Pesa STK Push flow with sequence diagram
PayPal integration flow
Stripe integration flow
Wallet system
Revenue sharing model
2.7 Real-time Features (docs/technical/realtime/)
WebSocket endpoints and protocols
WebRTC signaling for live sessions
Yjs collaborative editing
2.8 Security (docs/technical/security/)
JWT auth flow diagram
RBAC role matrix
API key encryption (Fernet)
Data protection (KDPA 2019)
2.9 Deployment (docs/technical/deployment/)
Docker Compose setup
Contabo VDS deployment
Environment variables reference (every variable documented)
2.10 Changelog (docs/CHANGELOG.md)
v1.0.0 release notes documenting all features
Phase 3: In-Code Documentation (Every File, Every Function)
Documentation standard: Simple descriptive comments
No formal tags (no @param, @returns)
Plain English explaining what each function does, inputs, outputs
Module-level comments explaining file purpose
3.1 Backend Python Docstrings
Priority order and files:

Models (backend/app/models/) - ~15+ model files

Class docstring: table purpose, key relationships
Column comments: purpose, constraints, default values
Method docstrings: what it does
Services (backend/app/services/) - ~12+ service files

Module docstring: service purpose
Function docstrings: what it does, what it accepts, what it returns, what can go wrong
API Routes (backend/app/api/v1/) - ~20+ route files

Module docstring: route group purpose
Handler docstrings: endpoint purpose, auth requirements, request/response
Schemas (backend/app/schemas/) - ~10+ schema files

Class docstring: what this schema validates
Field comments: purpose and constraints
Utilities (backend/app/utils/) - security.py, validators.py, etc.

Function docstrings for every utility function
Middleware (backend/app/middleware/)

Class/function docstrings
Config (backend/app/config.py)

Setting group comments
Validator docstrings
WebSocket handlers (backend/app/websocket/)

Handler docstrings
Main entry point (backend/app/main.py, backend/main.py)

Startup/shutdown docstrings
3.2 Frontend TypeScript Comments
Priority order and files:

Store files (frontend/src/store/) - ~4 store files

File header: store purpose and state shape
Action comments: what each action does
Selector comments: what data it derives
Service files (frontend/src/services/) - API service files

File header: service purpose
Function comments: API endpoint called, params, return type
Layout components (frontend/src/components/layout/) - 6 files

Component header: purpose, where it's used
Key section comments
Shared/reusable components per role - admin/shared/, instructor/shared/, etc.

Component header: purpose, props explanation
Type definitions (frontend/src/types/)

Interface/type comments: purpose, usage context
Page components (frontend/src/pages/) - 296 files

File header comment: page purpose, route path, role, key features
Comments for complex logic sections
Auth components (frontend/src/components/auth/)

Component and function comments
AI components (frontend/src/components/co-pilot/, bird-chat/)

Component and function comments
Role-specific sidebar components

Navigation structure comments
App.tsx - Route comments explaining each route group

Phase 4: User-Facing Documentation Pages
4.1 Architecture
Route: /docs and /docs/* (public, under PublicLayout with header + footer)
Layout: Sidebar navigation (left) + content area (right)
Search: Client-side search bar filtering docs sidebar entries
Theme: Respects existing dark/light mode via useThemeStore
Responsive: Sidebar collapses to hamburger on mobile
4.2 New files to create

frontend/src/
├── pages/docs/
│   ├── DocsLayout.tsx                    # Sidebar + content layout wrapper
│   ├── DocsHomePage.tsx                  # Landing page with two product sections
│   ├── GettingStartedPage.tsx            # Getting started guide
│   ├── ChangelogPage.tsx                 # v1 release notes
│   │
│   ├── uhs/                             # Urban Home School v1 section
│   │   ├── StudentGuidePage.tsx
│   │   ├── ParentGuidePage.tsx
│   │   ├── InstructorGuidePage.tsx
│   │   ├── PartnerGuidePage.tsx
│   │   ├── CoursesGuidePage.tsx
│   │   ├── AssessmentsGuidePage.tsx
│   │   ├── PaymentsGuidePage.tsx
│   │   ├── ForumGuidePage.tsx
│   │   ├── StoreGuidePage.tsx
│   │   └── CertificatesGuidePage.tsx
│   │
│   ├── bird/                            # Urban Bird v1 section
│   │   ├── AITutorGuidePage.tsx
│   │   ├── CoPilotGuidePage.tsx
│   │   ├── VoiceModeGuidePage.tsx
│   │   └── LearningPathsGuidePage.tsx
│   │
│   ├── api/                             # Technical API docs section
│   │   ├── ApiOverviewPage.tsx
│   │   ├── AuthApiPage.tsx
│   │   ├── CoursesApiPage.tsx
│   │   ├── AITutorApiPage.tsx
│   │   ├── PaymentsApiPage.tsx
│   │   └── MoreApisPage.tsx             # Links to remaining APIs
│   │
│   └── FAQPage.tsx
│
├── components/docs/
│   ├── DocsSidebar.tsx                   # Collapsible navigation sidebar
│   ├── DocsSearch.tsx                    # Search bar with filtering
│   ├── DocsSection.tsx                   # Reusable section component
│   ├── DocsCodeBlock.tsx                 # Syntax-highlighted code blocks
│   ├── DocsApiEndpoint.tsx              # Reusable API endpoint display
│   ├── DocsImagePlaceholder.tsx         # Screenshot placeholder component
│   └── DocsBreadcrumb.tsx               # Breadcrumb navigation
4.3 Routing additions (App.tsx)

// Under PublicLayout routes
<Route path="/docs" element={<DocsLayout />}>
  <Route index element={<DocsHomePage />} />
  <Route path="getting-started" element={<GettingStartedPage />} />
  <Route path="changelog" element={<ChangelogPage />} />

  {/* Urban Home School v1 */}
  <Route path="student-guide" element={<StudentGuidePage />} />
  <Route path="parent-guide" element={<ParentGuidePage />} />
  <Route path="instructor-guide" element={<InstructorGuidePage />} />
  <Route path="partner-guide" element={<PartnerGuidePage />} />
  <Route path="courses" element={<CoursesGuidePage />} />
  <Route path="assessments" element={<AssessmentsGuidePage />} />
  <Route path="payments" element={<PaymentsGuidePage />} />
  <Route path="forum" element={<ForumGuidePage />} />
  <Route path="store" element={<StoreGuidePage />} />
  <Route path="certificates" element={<CertificatesGuidePage />} />

  {/* Urban Bird v1 */}
  <Route path="ai-tutor" element={<AITutorGuidePage />} />
  <Route path="copilot" element={<CoPilotGuidePage />} />
  <Route path="voice-mode" element={<VoiceModeGuidePage />} />
  <Route path="learning-paths" element={<LearningPathsGuidePage />} />

  {/* API Reference */}
  <Route path="api" element={<ApiOverviewPage />} />
  <Route path="api/auth" element={<AuthApiPage />} />
  <Route path="api/courses" element={<CoursesApiPage />} />
  <Route path="api/ai-tutor" element={<AITutorApiPage />} />
  <Route path="api/payments" element={<PaymentsApiPage />} />
  <Route path="api/more" element={<MoreApisPage />} />

  <Route path="faq" element={<FAQPage />} />
</Route>
4.4 DocsLayout component design

┌─────────────────────────────────────────────────────────┐
│ [PublicHeader]                                           │
├──────────┬──────────────────────────────────────────────┤
│          │  [DocsBreadcrumb]                             │
│  [Search]│                                              │
│  ────────│  # Page Title                                │
│          │                                              │
│  UHS v1  │  Content area with sections,                 │
│  ├─Guide │  code blocks, API examples,                  │
│  ├─Stud. │  screenshot placeholders,                    │
│  ├─Parent│  tables, and navigation links.               │
│  ├─Instr.│                                              │
│  ├─...   │                                              │
│          │                                              │
│  Bird v1 │                                              │
│  ├─Tutor │                                              │
│  ├─CoPlt │                                              │
│  ├─Voice │                                              │
│          │                                              │
│  API Ref │                                              │
│  ├─Auth  │                                              │
│  ├─Cours.│                                              │
│  ├─...   │                                              │
│          │                                              │
│  FAQ     │  [Previous / Next navigation]                │
│  Changlog│                                              │
├──────────┴──────────────────────────────────────────────┤
│ [Footer]                                                │
└─────────────────────────────────────────────────────────┘
4.5 Footer modification
File: frontend/src/components/layout/Footer.tsx

Add to the Quick Links column:


<Link to="/docs" ...>Documentation</Link>
4.6 Screenshot placeholders
Create docs/screenshots/README.md listing every screenshot needed:

Homepage hero section
Each role's dashboard overview
AI Tutor chat interface
Course catalog and detail pages
Payment flow (M-Pesa, PayPal)
Forum page
Store page
Certificate validation
Settings pages
CoPilot sidebar
The DocsImagePlaceholder.tsx component renders a styled box with the expected screenshot description and path.

Phase 5: Version Branding
Update docs/README.md with version badges for UHS v1 and Urban Bird v1
DocsHomePage shows two product cards: "Urban Home School v1" and "Urban Bird v1"
Each doc page footer references the version
CHANGELOG.md documents the v1 feature set
Critical Files to Modify
File	Change
frontend/src/components/layout/Footer.tsx	Add Documentation link to Quick Links
frontend/src/App.tsx	Add /docs routes under PublicLayout
frontend/src/pages/docs/*	NEW - All documentation page components
frontend/src/components/docs/*	NEW - Docs layout, sidebar, search, reusable components
backend/app/models/*.py	Add docstrings to all models
backend/app/services/*.py	Add docstrings to all services
backend/app/api/v1/*.py	Add docstrings to all route handlers
backend/app/schemas/*.py	Add docstrings to all schemas
backend/app/utils/*.py	Add docstrings to all utilities
backend/app/config.py	Add setting group comments
backend/app/main.py	Add startup/handler docstrings
frontend/src/store/*.ts	Add comments to all stores
frontend/src/services/*.ts	Add comments to all services
frontend/src/components/**/*.tsx	Add header comments to all components
frontend/src/pages/**/*.tsx	Add header comments to all 296 pages
frontend/src/types/*.ts	Add comments to all type definitions
docs/**	NEW - All markdown documentation files
Execution Order
Phase 1 (Consolidate) → Move files, create folder structure
Phase 2 (Technical docs) → Write all markdown documentation
Phase 3 (In-code docs) → Add comments to all code files
Phase 4 (User-facing pages) → Build React documentation pages + footer link
Phase 5 (Branding) → Version references throughout
Phases 2 and 3 can be parallelized since they're independent.

Verification
Run npm run build from frontend/ to catch TypeScript/import errors
Run npx tsc --noEmit from frontend/ for type checking
Navigate to /docs and verify all pages render
Click footer "Documentation" link from homepage
Test docs search functionality
Verify dark/light mode works on docs pages
Verify mobile responsive sidebar collapse
Confirm all 37+ original docs are in /docs/ folder
Spot-check in-code comments across backend and frontend files