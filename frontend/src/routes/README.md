# Route Files Organization

This directory contains modularized route definitions extracted from the main `App.tsx` file. Each role has its own dedicated route file for better maintainability and code organization.

## File Structure

```
routes/
├── README.md                  # This file
├── index.tsx                  # Central export file for all routes
├── routeHelpers.tsx           # Shared Suspense wrapper component (S)
├── studentRoutes.tsx          # Student dashboard routes (96 routes)
├── parentRoutes.tsx           # Parent dashboard routes (38 routes)
├── instructorRoutes.tsx       # Instructor dashboard routes (48 routes)
├── partnerRoutes.tsx          # Partner dashboard routes (31 routes)
├── staffRoutes.tsx            # Staff dashboard routes (32 routes)
└── adminRoutes.tsx            # Admin dashboard routes (36 routes)
```

## Usage

### In App.tsx

Replace the inline route definitions with imports from these files:

```tsx
import {
  studentRoutes,
  parentRoutes,
  instructorRoutes,
  partnerRoutes,
  staffRoutes,
  adminRoutes
} from './routes';

// In your Routes component:
<Routes>
  {/* Public routes */}
  {/* ... */}
  
  {/* Role-based dashboard routes */}
  {studentRoutes}
  {parentRoutes}
  {instructorRoutes}
  {partnerRoutes}
  {staffRoutes}
  {adminRoutes}
  
  {/* Other routes */}
  {/* ... */}
</Routes>
```

## Route Breakdown

### Student Routes (`studentRoutes.tsx`) - 96 routes
- **Today**: AI plan, streak, mood check, urgent items, daily quote (5 routes)
- **AI Tutor**: Chat, learning path, voice mode, journal, explanations, teacher collaboration (6 routes)
- **Learning**: Enrolled courses, recommendations, browse, wishlist, topics, live sessions (10 routes)
- **Practice & Assessments**: Assignments, quizzes, projects (13 routes)
- **Progress & Growth**: Achievements, learning map, reports, goals (12 routes)
- **Community**: Connect, study groups, discussions, shoutouts, teacher Q&A (11 routes)
- **Wallet**: Balance, top-up, transactions, subscriptions, advisor (10 routes)
- **Support**: Guides, contact, community, teacher chat, reporting (7 routes)
- **Account**: Notifications, profile, preferences, privacy (10 routes)

### Parent Routes (`parentRoutes.tsx`) - 38 routes
- **Dashboard**: Home, highlights, urgent, mood (4 routes)
- **Children**: Overview, child details (2 routes)
- **AI Insights**: Learning style, support tips, planning, patterns, warnings (12 routes - with/without childId)
- **Children Progress**: Journey, CBC competencies, activity, achievements, goals (5 routes)
- **Communications**: Inbox, messages, support (3 routes)
- **Finance**: Subscription, payment history, manage, add-ons (4 routes)
- **Reports**: Term summary, transcripts, portfolio export (4 routes)
- **Settings**: Notifications, consent, privacy, family, profile, security (6 routes)

### Instructor Routes (`instructorRoutes.tsx`) - 48 routes
- **Dashboard**: Home, AI insights (2 routes)
- **Content Creation**: Courses, modules, CBC alignment, assessments, resources (12 routes)
- **Teaching**: Sessions, live classes, messages, AI handoff (7 routes)
- **Student Management**: Progress pulse, interventions, discussions, feedback (6 routes)
- **Performance**: Analytics, badges, recognition (3 routes)
- **Earnings**: Dashboard, breakdown, payouts, rates, documents (5 routes)
- **Hub**: CBC references, AI prompts, community, co-create, support (6 routes)
- **Account**: Notifications, profile, availability, security (5 routes)

### Partner Routes (`partnerRoutes.tsx`) - 31 routes
- **Dashboard**: Home, quick links, AI highlights (3 routes)
- **Sponsorships**: Overview, sponsored children, child progress (3 routes)
- **Children**: Overview, journey, activity, achievements, goals, AI insights (6 routes)
- **Partnership**: Enrollments, impact reports, collaboration (3 routes)
- **Content**: Sponsored courses, resources, AI resources (3 routes)
- **Finance**: Funding, budget, grants (4 routes)
- **Analytics**: ROI metrics, custom reports, student insights (3 routes)
- **Support**: Tickets, resources, webinars, certification (4 routes)
- **Account**: Notifications, profile, settings (3 routes)

### Staff Routes (`staffRoutes.tsx`) - 32 routes
- **Dashboard**: Home (1 route)
- **Moderation & Quality**: Content review, approvals, CBC standards, safety (4 routes)
- **Support & Care**: Tickets, live support, student journeys, knowledge base (8 routes)
- **Learning Experience**: Sessions, progress, content studio, assessments (9 routes)
- **Insights & Impact**: Platform health, content performance, support metrics, reports (4 routes)
- **Team & Growth**: Performance, pulse, resources (3 routes)
- **Account**: Notifications, profile, preferences, security (4 routes)

### Admin Routes (`adminRoutes.tsx`) - 36 routes
- **Dashboard**: Home, pulse, AI providers (3 routes)
- **People & Access**: Users, roles, families, restrictions (5 routes)
- **Content & Learning**: Courses, CBC alignment, assessments, certificates, resources (5 routes)
- **AI Systems**: Monitoring, content review, personalization, performance (4 routes)
- **Analytics & Intelligence**: Learning, business, compliance, custom (4 routes)
- **Finance & Partnerships**: Transactions, plans, partners, invoices (4 routes)
- **Operations & Control**: Tickets, moderation, config, audit logs, system health (5 routes)
- **Account**: Notifications, profile, preferences (3 routes)

## Benefits

1. **Maintainability**: Each role's routes are in their own file, making updates easier
2. **Code Organization**: Clear separation of concerns by role
3. **Performance**: Code splitting with lazy loading is preserved
4. **Readability**: Smaller files are easier to navigate and understand
5. **Scalability**: Easy to add new routes without cluttering App.tsx
6. **Team Collaboration**: Multiple developers can work on different role routes simultaneously

## Development Notes

- All routes use lazy loading for optimal performance
- The `S` component (from `routeHelpers.tsx`) wraps lazy components in Suspense
- All routes are protected with `ProtectedRoute` and `DashboardLayout` with role-specific access
- Route paths match the original App.tsx structure exactly

## Migration from App.tsx

The original App.tsx had approximately 848 lines with inline route definitions. This modularization:
- Reduces App.tsx complexity
- Improves code maintainability
- Makes route updates role-specific
- Enables better testing of individual route groups
