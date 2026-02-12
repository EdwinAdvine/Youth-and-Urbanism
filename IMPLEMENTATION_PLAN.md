# Urban Home School Platform Overhaul - Implementation Plan

## Context

The Urban Home School platform needs a comprehensive UI/UX overhaul and new feature development. The current app has a dark-themed home page, 6 role-based dashboards, basic course/forum/chat pages, and a full FastAPI backend. This plan transforms it into a polished, production-ready educational platform with new pages (Pricing, Store, Bot, etc.), enhanced existing pages, a shared public layout, and full backend support for all new features.

**User decisions:**
- Public pages get new shared header/footer; dashboards keep their sidebar layout (restyled)
- Store sells physical merchandise only (bags, uniforms, books)
- Everything built full-stack (complete frontend AND backend)
- Categories stored in DB with admin CRUD API

---

## Phase 0: Foundation - Shared Components & Theme System

> All subsequent pages depend on this. Must be done first.

### Frontend

**0.1 Extract Home Page from App.tsx**
- Create `frontend/src/pages/HomePage.tsx` - move all inline home page content (~500 lines) out of App.tsx
- Modify `frontend/src/App.tsx` - import HomePage, render at `/` route. Reduces to ~100 lines of routing.

**0.2 Create Public Layout with Header**
- Create `frontend/src/components/layout/PublicLayout.tsx` - wrapper with header + footer + `<Outlet />`
- Create `frontend/src/components/layout/PublicHeader.tsx` - fixed top nav:
  - Logo (UHS), Home, Categories (mega-menu), Courses, Pricing, Bot, Store, Forum, Get Started Free, How It Works
  - Auth state: Login/Sign Up button (unauthenticated) or profile dropdown (authenticated)
  - Theme toggle (sun/moon icon)
  - Mobile hamburger menu

**0.3 Create Footer**
- Create `frontend/src/components/layout/Footer.tsx`
  - Links: About Us, Contact, Certificate Validation, Becoming an Instructor, Scholarship
  - Email: info@urbanhomeschool.co.ke
  - Copyright 2026, Data Protection Act 2019 notice, "Powered by The Bot AI"
  - Social icons

**0.4 Theme System (Dark/Light)**
- Enhance `frontend/src/store/index.ts` (useThemeStore) - default dark, toggle persists to localStorage
- Update `frontend/tailwind.config.js` - add `darkMode: 'class'`
- Define color variables: dark bg `#0F1112`/`#181C1F`, borders `#22272B`, accent `#FF0000`
- Light mode: white bg, black text, red accents

**0.5 Reorganize Routes in App.tsx**
```
<PublicLayout>          → /, /courses, /pricing, /the-bird, /store, /forum, /how-it-works, /about, /contact, /certificate-validation, /become-instructor, /categories/:slug
<DashboardLayout>       → /dashboard/*, /my-courses, /profile, /settings, etc.
```

**0.6 Placeholder Page Component**
- Create `frontend/src/pages/PlaceholderPage.tsx` - shared header/footer + "This page is under development" message
- Use for any links pointing to unbuilt pages

### Files to Create
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/layout/PublicLayout.tsx`
- `frontend/src/components/layout/PublicHeader.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/pages/PlaceholderPage.tsx`

### Files to Modify
- `frontend/src/App.tsx` (major refactor)
- `frontend/src/store/index.ts` (theme store)
- `frontend/tailwind.config.js` (darkMode config)

---

## Phase 1: Categories (Backend + Frontend)

> Prerequisite for Courses and Home Page enhancement.

### Backend

**1.1 Category Model**
- Create `backend/app/models/category.py`
  - Fields: id (UUID), name, slug (unique, indexed), description, icon, image_url, parent_id (self FK for nesting), display_order, is_active, course_count, created_at, updated_at

**1.2 Category Schemas**
- Create `backend/app/schemas/category_schemas.py`
  - CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithChildren, CategoryListResponse

**1.3 Category Service**
- Create `backend/app/services/category_service.py`
  - CRUD + get_tree (nested hierarchy) + list_active

**1.4 Category API**
- Create `backend/app/api/v1/categories.py`
  - `GET /api/v1/categories` - list active (public)
  - `GET /api/v1/categories/tree` - nested hierarchy for mega-menu (public)
  - `GET /api/v1/categories/{slug}` - single with course count (public)
  - `POST/PUT/DELETE` - admin CRUD

**1.5 Link Categories to Courses**
- Modify `backend/app/models/course.py` - add `category_id` (UUID FK to categories)
- Create Alembic migration

**1.6 Seed Categories**
- Add to `backend/seed_users.py` or create `backend/seed_categories.py`
- 12 CBC categories: Mathematics, Science and Technology, Languages, etc.

**1.7 Register Router**
- Modify `backend/app/main.py` - include categories router
- Update `backend/app/models/__init__.py`

### Frontend

**1.8 Category Types & Service**
- Create `frontend/src/types/category.ts`
- Create `frontend/src/services/categoryService.ts` - listCategories(), getCategoryTree(), getCategoryBySlug()

**1.9 Mega-Menu Component**
- Create `frontend/src/components/layout/CategoryMegaMenu.tsx`
  - Fetches from API, displays grid with icons/names
  - Integrates into PublicHeader on hover/click

**1.10 Category Page**
- Create `frontend/src/pages/CategoryPage.tsx` - route `/categories/:slug`
  - Shows category info, filters courses by category_id

---

## Phase 2: Home Page Enhancement

> Transform existing home page with animations and new sections.

### Frontend Only

**2.1 Parallax Hero** - framer-motion `useScroll`/`useTransform` for background parallax, staggered text reveal

**2.2 Popular Categories Grid** - fetch top categories from API, card grid with icons + course counts

**2.3 Featured Courses Carousel** - horizontal scroll with snap points, fetch `?is_featured=true`

**2.4 Enhanced Testimonials** - carousel/slider with auto-rotate, pause on hover

**2.5 AI Bot Teaser** - animated mini chat demo, CTA to `/the-bird`

**2.6 Pricing Teaser** - 4 tier summary cards, CTA to `/pricing`

**2.7 Scroll Animations** - framer-motion `whileInView` fade-in-up on all sections, button hover scale

### Files to Modify
- `frontend/src/pages/HomePage.tsx` (major enhancement)

---

## Phase 3: Courses Page Enhancement

> Coursera/edX-inspired catalog with advanced filtering.

### Backend
**3.1 Enhance Course List API**
- Modify `backend/app/api/v1/courses.py` - add query params: `category_id`, `price_filter` (free/paid), `sort_by`, `min_price`, `max_price`

### Frontend
**3.2 Rebuild Course Catalog**
- Rewrite `frontend/src/pages/CourseCatalogPage.tsx`
  - Filter sidebar: Free/Paid, categories (from API), price range, grade level, sort
  - Grid/List view toggle
  - Debounced search
  - Pagination

**3.3 Enhance Course Detail Page**
- Update `frontend/src/pages/CourseDetailsPage.tsx`
  - Unauthenticated: see full info, "Enroll" opens AuthModal
  - Syllabus, lesson previews (locked), reviews, instructor info

**3.4 Reusable Course Card**
- Create `frontend/src/components/course/CourseCard.tsx`
  - Thumbnail, title, instructor, rating stars, price badge, enrollment count
  - Used in catalog, home carousel, category pages

---

## Phase 4: Pricing Page

### Backend
**4.1 Seed Subscription Plans**
- Add to seed script or create `backend/seed_plans.py`
  - Free: 0 KES
  - Basic: 1000 KES/mo (800/mo annual) - 1 child
  - Parents: 800 KES/mo (600/mo annual) - 2+ children
  - Sponsor: 500 KES/child/mo annual - 10+ children

**4.2 Plans Public API**
- Create `backend/app/api/v1/subscriptions.py`
  - `GET /api/v1/plans` - list plans (public)
  - `POST /api/v1/subscriptions` - subscribe (authenticated)

### Frontend
**4.3 Pricing Page**
- Create `frontend/src/pages/PricingPage.tsx` - route `/pricing`
  - 4 tier cards, monthly/annual toggle, comparison table, FAQ accordion
  - CTAs: Free → signup, Paid → payment flow

**4.4 Subscription Service**
- Create `frontend/src/services/subscriptionService.ts`

---

## Phase 5: Bot Page (Public AI Chat)

> Grok/ChatGPT-inspired public chat interface.

### Backend
**5.1 Public Bot API**
- Create `backend/app/api/v1/public_bot.py`
  - `POST /api/v1/bot/chat` - public chat (rate-limited for unauthenticated, 5 msgs/session)
  - Returns text + optional audio_url + suggested_courses

**5.2 Voice Integration**
- Enhance `backend/app/services/ai_orchestrator.py`
  - Add `generate_voice_response(text)` using ElevenLabs API
  - Temporary audio file storage or streaming

**5.3 Course Promotion**
- Bot responses include `suggested_courses: [...]` based on conversation topic

### Frontend
**5.4 Bot Page**
- Create `frontend/src/pages/BotPage.tsx` - route `/the-bird`
  - Full-screen chat, sidebar for conversation history
  - Input bar: text + voice input (Web Speech API) + send
  - Response mode toggle: Text / Voice / Video
  - Quick suggestion chips
  - Course promotion cards inline in responses

**5.5 Refactor Bird Chat**
- Existing `components/bird-chat/` supports both authenticated (dashboard) and public modes

---

## Phase 6: Store (Full-Stack E-Commerce)

> Shopify-inspired physical merchandise store.

### Backend
**6.1 Store Models**
- Create `backend/app/models/store.py`
  - Product: id, name, slug, description, price, images (JSONB), category_id, inventory_count, sku, weight, is_active, is_featured, tags
  - ProductCategory: id, name, slug, icon, display_order
  - Cart / CartItem: user_id or session_id, product_id, quantity
  - Order / OrderItem: order_number, status, subtotal, shipping, total, tracking
  - ShippingAddress: full_name, phone, address, city, county, postal_code

**6.2 Store Schemas**
- Create `backend/app/schemas/store_schemas.py`

**6.3 Store Service**
- Create `backend/app/services/store_service.py`
  - Product CRUD, cart management, checkout flow, order management

**6.4 Store API**
- Create `backend/app/api/v1/store.py`
  - Products: GET (public), admin CRUD
  - Cart: GET, POST/PUT/DELETE items
  - Checkout: POST (creates order + payment)
  - Orders: GET list, GET detail

**6.5 Seed Products**
- Create `backend/seed_products.py` - 5-10 sample products (bags, uniforms, books, t-shirts)

### Frontend
**6.6 Store Types & State**
- Create `frontend/src/types/store.ts`
- Create `frontend/src/services/storeService.ts`
- Create `frontend/src/store/cartStore.ts` (Zustand, persisted to localStorage)

**6.7 Store Page** - `frontend/src/pages/StorePage.tsx` - route `/store`
  - Product grid, filters (category, price, sort), search

**6.8 Product Detail** - `frontend/src/pages/ProductDetailPage.tsx` - route `/store/products/:slug`
  - Image gallery, description, price, inventory, "Add to Cart"

**6.9 Cart Drawer** - `frontend/src/components/store/CartDrawer.tsx`
  - Sliding drawer, items, quantities, subtotal, checkout button

**6.10 Checkout** - `frontend/src/pages/CheckoutPage.tsx` - route `/store/checkout`
  - Shipping form, order summary, M-Pesa/Card payment

**6.11 Order Pages** - OrderConfirmation + OrderHistory

---

## Phase 7: Forum Enhancement

> Discord/Reddit-inspired with groups and private messaging.

### Backend
**7.1 Forum Groups**
- Add to `backend/app/models/forum.py`:
  - ForumGroup: name, slug, type (public/private), icon, member_count, created_by
  - ForumGroupMember: group_id, user_id, role (member/moderator/admin)
  - Modify ForumPost: add group_id FK

**7.2 Private Messaging**
- Create `backend/app/models/private_message.py`
  - PrivateConversation: participant_ids, last_message_at
  - PrivateMessage: conversation_id, sender_id, content, is_read

**7.3 WebSocket Chat**
- Create `backend/app/api/v1/websocket_chat.py`
  - `ws://localhost:8000/api/v1/ws/chat/{conversation_id}`
  - JWT auth via query param, message broadcasting

**7.4 Enhanced Forum API**
- Modify `backend/app/api/v1/forum.py` - group CRUD, membership, private messaging REST endpoints

### Frontend
**7.5 Forum Rebuild**
- Rewrite `frontend/src/pages/ForumPage.tsx`
  - Left sidebar: groups list, private chats
  - Main feed: posts, create post, filters
  - Threaded comments/replies, likes, moderation

**7.6 Private Chat**
- Create `frontend/src/components/forum/PrivateChat.tsx` - WebSocket real-time messaging
- Create `frontend/src/services/websocketService.ts`

---

## Phase 8: Static Pages & Remaining Features

### Backend
**8.1 Contact Form** - `backend/app/models/contact.py` + `backend/app/api/v1/contact.py`
  - POST stores message + sends email notification

**8.2 Certificate Validation** - `backend/app/api/v1/certificates.py`
  - `GET /api/v1/certificates/validate/{serial_number}` (public)

**8.3 Instructor Applications** - `backend/app/models/instructor_application.py` + `backend/app/api/v1/instructor_applications.py`
  - POST submit, GET admin list, PUT approve/reject

**8.4 File Upload** - `backend/app/api/v1/uploads.py`
  - POST upload ID documents (front/back images)
  - Local or S3 storage, file validation

**8.5 Age Verification**
- Modify `backend/app/models/user.py` - add date_of_birth, id_document_front/back URLs, verification_status to profile_data JSONB

### Frontend
**8.6 How It Works** - `frontend/src/pages/HowItWorksPage.tsx` - steps infographic, videos, FAQ

**8.7 About Us** - `frontend/src/pages/AboutPage.tsx` - mission, vision, team

**8.8 Contact** - `frontend/src/pages/ContactPage.tsx` - form + contact details

**8.9 Certificate Validation** - `frontend/src/pages/CertificateValidationPage.tsx` - serial number input, validate button

**8.10 Become Instructor** - `frontend/src/pages/BecomeInstructorPage.tsx` - info (70/20/10 split), application form, CV upload

**8.11 Auth Enhancement (Age Verification)**
- Modify `frontend/src/components/auth/SignupForm.tsx`
  - Year of birth input
  - Under 18: popup → "Ask your parent to create an account for you"
  - 18+: optional ID upload (front + back) with "add later" option

---

## Phase 9: Dashboard Restyling & Polish

### Frontend
**9.1 Dashboard Theme Alignment**
- Update `frontend/src/components/layout/DashboardLayout.tsx` - match dark/red theme, dark/light mode support

**9.2 Sidebar Updates**
- Update `frontend/src/components/layout/Sidebar.tsx` - add Store (orders), updated styling

**9.3 Consistent Widget Cards** - uniform card styling across all 6 dashboards, hover animations

---

## Verification Plan

After each phase:
1. **Backend**: Run `python seed_users.py` (and new seed scripts), verify endpoints via Swagger at `/docs`
2. **Frontend**: Run `npm run dev`, manually test all new pages/components
3. **Integration**: Test API calls from frontend to backend
4. **Theme**: Verify dark/light toggle works on all pages
5. **Responsive**: Test on mobile viewport sizes
6. **Links**: Verify all buttons/links work (placeholder pages for undeveloped features)

### Key Commands
```bash
# Backend
cd backend && pip install -r requirements.txt
python seed_users.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm install
npm run dev

# Docker (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# Type check
cd frontend && npx tsc --noEmit
```

---

## Critical Files Reference

### Existing files to reuse patterns from:
- `backend/app/models/course.py` - model pattern (UUID, timestamps, JSONB)
- `backend/app/schemas/course_schemas.py` - schema pattern
- `backend/app/api/v1/courses.py` - router pattern with auth dependencies
- `backend/app/services/course_service.py` - service pattern
- `frontend/src/services/api.ts` - Axios client with JWT interceptor
- `frontend/src/services/courseService.ts` - service class pattern
- `frontend/src/store/authStore.ts` - Zustand store with persistence pattern
- `frontend/src/components/layout/DashboardLayout.tsx` - layout pattern

### Implementation note
During implementation, frontend and backend work within each phase should be developed in parallel using separate agents where possible, as the user requested.
