# Route Structure Visualization

## Directory Tree

```
frontend/src/routes/
├── index.tsx                    # Central exports
├── routeHelpers.tsx             # Shared Suspense wrapper
├── README.md                    # Full documentation
├── ROUTE_STRUCTURE.md          # This file
│
├── studentRoutes.tsx           # 90 routes
│   └── /dashboard/student/
│       ├── index                              # Dashboard home
│       ├── today/*                            # 5 routes
│       ├── ai-tutor/*                         # 6 routes
│       ├── courses/*                          # 2 routes
│       ├── browse/*                           # 4 routes
│       ├── live/*                             # 4 routes
│       ├── practice/*                         # 1 route
│       ├── assignments/*                      # 6 routes
│       ├── quizzes/*                          # 4 routes
│       ├── projects/*                         # 4 routes
│       ├── achievements/*                     # 3 routes
│       ├── learning-map/*                     # 3 routes
│       ├── reports/*                          # 5 routes
│       ├── goals/*                            # 2 routes
│       ├── community/*                        # 7 routes
│       ├── discussions/*                      # 3 routes
│       ├── shoutouts/*                        # 1 route
│       ├── wallet/*                           # 9 routes
│       ├── subscriptions                      # 1 route
│       ├── support/*                          # 7 routes
│       ├── notifications/*                    # 3 routes
│       ├── profile/*                          # 5 routes
│       ├── preferences/*                      # 2 routes
│       └── privacy/*                          # 2 routes
│
├── parentRoutes.tsx            # 41 routes
│   └── /dashboard/parent/
│       ├── index                              # Dashboard home
│       ├── highlights                         # 1 route
│       ├── urgent                             # 1 route
│       ├── mood                               # 1 route
│       ├── children/*                         # 2 routes
│       ├── ai/*                               # 12 routes (6 with :childId, 6 without)
│       ├── learning-journey                   # 1 route
│       ├── cbc-competencies                   # 1 route
│       ├── activity                           # 1 route
│       ├── achievements                       # 1 route
│       ├── goals                              # 1 route
│       ├── communications/*                   # 1 route
│       ├── messages                           # 1 route
│       ├── support                            # 1 route
│       ├── finance/*                          # 4 routes
│       ├── reports/*                          # 4 routes
│       └── settings/*                         # 6 routes
│
├── instructorRoutes.tsx        # 51 routes
│   └── /dashboard/instructor/
│       ├── index                              # Dashboard home
│       ├── insights                           # 1 route
│       ├── courses/*                          # 9 routes (incl. dynamic :courseId)
│       ├── modules                            # 1 route
│       ├── cbc-alignment                      # 1 route
│       ├── assessments/*                      # 6 routes (incl. dynamic :assessmentId)
│       ├── submissions/*                      # 2 routes (incl. dynamic :submissionId)
│       ├── resources                          # 1 route
│       ├── sessions/*                         # 4 routes (incl. dynamic :sessionId)
│       ├── messages                           # 1 route
│       ├── ai-handoff                         # 1 route
│       ├── progress-pulse                     # 1 route
│       ├── interventions                      # 1 route
│       ├── discussions/*                      # 3 routes (incl. dynamic :postId)
│       ├── feedback/*                         # 2 routes
│       ├── performance                        # 1 route
│       ├── badges                             # 1 route
│       ├── recognition                        # 1 route
│       ├── earnings/*                         # 5 routes
│       ├── hub/*                              # 6 routes (incl. dynamic :ticketId)
│       ├── notifications                      # 1 route
│       ├── profile/*                          # 2 routes
│       ├── availability                       # 1 route
│       └── security/*                         # 2 routes
│
├── partnerRoutes.tsx           # 33 routes
│   └── /dashboard/partner/
│       ├── index                              # Dashboard home
│       ├── quick-links                        # 1 route
│       ├── ai-highlights                      # 1 route
│       ├── sponsorships                       # 1 route
│       ├── sponsored-children/*               # 2 routes (incl. dynamic :id)
│       ├── children/*                         # 6 routes
│       ├── enrollments                        # 1 route
│       ├── impact-reports                     # 1 route
│       ├── collaboration                      # 1 route
│       ├── courses                            # 1 route
│       ├── resources                          # 1 route
│       ├── ai-resources                       # 1 route
│       ├── finance/*                          # 3 routes
│       ├── funding                            # 1 route
│       ├── analytics/*                        # 3 routes
│       ├── support/*                          # 4 routes
│       ├── notifications                      # 1 route
│       ├── profile                            # 1 route
│       └── settings                           # 1 route
│
├── staffRoutes.tsx             # 34 routes
│   └── /dashboard/staff/
│       ├── index                              # Dashboard home
│       ├── moderation/*                       # 4 routes
│       ├── support/*                          # 8 routes (incl. dynamic :ticketId, :journeyId, :articleId)
│       ├── learning/*                         # 9 routes (incl. dynamic :sessionId, :contentId, :assessmentId)
│       ├── insights/*                         # 4 routes
│       ├── team/*                             # 3 routes
│       └── account/*                          # 4 routes
│
└── adminRoutes.tsx             # 35 routes
    └── /dashboard/admin/
        ├── index                              # Dashboard home
        ├── pulse                              # 1 route
        ├── ai-providers                       # 1 route
        ├── users/*                            # 2 routes (incl. dynamic :id)
        ├── roles-permissions                  # 1 route
        ├── families                           # 1 route
        ├── restrictions                       # 1 route
        ├── courses                            # 1 route
        ├── cbc-alignment                      # 1 route
        ├── assessments                        # 1 route
        ├── certificates                       # 1 route
        ├── resources                          # 1 route
        ├── ai-monitoring                      # 1 route
        ├── ai-content                         # 1 route
        ├── ai-personalization                 # 1 route
        ├── ai-performance                     # 1 route
        ├── analytics/*                        # 4 routes
        ├── finance/*                          # 2 routes
        ├── partners                           # 1 route
        ├── invoices                           # 1 route
        ├── tickets/*                          # 2 routes (incl. dynamic :id)
        ├── moderation                         # 1 route
        ├── config                             # 1 route
        ├── audit-logs                         # 1 route
        ├── system-health                      # 1 route
        ├── notifications                      # 1 route
        ├── profile                            # 1 route
        └── preferences                        # 1 route
```

## Route Path Patterns

### Static Routes
Simple paths without parameters:
```
/dashboard/student/profile
/dashboard/parent/highlights
/dashboard/instructor/courses
```

### Dynamic Routes
Routes with parameters:
```
/dashboard/student/browse/course/:id
/dashboard/parent/ai/summary/:childId
/dashboard/instructor/courses/:courseId/edit
/dashboard/partner/sponsored-children/:id
/dashboard/staff/support/tickets/:ticketId
/dashboard/admin/users/:id
```

### Nested Routes
Routes with multiple path segments:
```
/dashboard/student/ai-tutor/chat
/dashboard/parent/finance/subscription
/dashboard/instructor/earnings/breakdown
/dashboard/partner/support/training/webinars
/dashboard/staff/learning/assessments/editor
/dashboard/admin/analytics/business
```

## Route Statistics

| Role | Total Routes | Static Routes | Dynamic Routes | Nested Routes |
|------|--------------|---------------|----------------|---------------|
| Student | 90 | 88 | 2 | 90 |
| Parent | 41 | 39 | 2 | 41 |
| Instructor | 51 | 44 | 7 | 51 |
| Partner | 33 | 32 | 1 | 33 |
| Staff | 34 | 29 | 5 | 34 |
| Admin | 35 | 33 | 2 | 35 |
| **Total** | **284** | **265** | **19** | **284** |

## Dynamic Route Parameters

### Student Routes
- `:id` - Course ID in browse/course/:id
- `:id` - Assignment ID in assignments/resubmit/:id

### Parent Routes
- `:childId` - Child ID in various AI insight routes (6 routes)

### Instructor Routes
- `:courseId` - Course ID (3 routes)
- `:assessmentId` - Assessment ID (2 routes)
- `:submissionId` - Submission ID (1 route)
- `:sessionId` - Session ID (2 routes)
- `:postId` - Discussion post ID (1 route)
- `:ticketId` - Support ticket ID (1 route)

### Partner Routes
- `:id` - Sponsored child ID (1 route)

### Staff Routes
- `:ticketId` - Support ticket ID (1 route)
- `:journeyId` - Student journey ID (1 route)
- `:articleId` - Knowledge base article ID (2 routes)
- `:sessionId` - Live class session ID (1 route)
- `:contentId` - Content ID (2 routes)
- `:assessmentId` - Assessment ID (2 routes)

### Admin Routes
- `:id` - User ID (1 route)
- `:id` - Ticket ID (1 route)

## Route Organization Principles

### 1. Hierarchical Structure
Routes are organized in a logical hierarchy:
```
Dashboard Root → Section → Feature → Action
Example: /dashboard/student/ai-tutor/chat
```

### 2. Consistent Naming
- Use kebab-case for all route segments
- Keep names descriptive but concise
- Use plural for collection routes (e.g., `/courses`)
- Use singular for detail routes (e.g., `/profile`)

### 3. Logical Grouping
Routes are grouped by feature area:
- Learning-related: courses, browse, live
- Assessment-related: assignments, quizzes, projects
- Social-related: community, discussions
- Account-related: profile, settings, notifications

### 4. Role-Based Separation
Each role has its own route namespace:
- Student: `/dashboard/student/*`
- Parent: `/dashboard/parent/*`
- Instructor: `/dashboard/instructor/*`
- Partner: `/dashboard/partner/*`
- Staff: `/dashboard/staff/*`
- Admin: `/dashboard/admin/*`

## Performance Optimization

### Lazy Loading
All page components are lazy-loaded:
```typescript
const StudentDashboardHome = lazy(() => import('../pages/student/StudentDashboardHome'));
```

### Code Splitting
Routes are split by role for optimal bundle sizes:
- Student routes: ~15 KB
- Parent routes: ~6.4 KB
- Instructor routes: ~9.2 KB
- Partner routes: ~5.6 KB
- Staff routes: ~5.9 KB
- Admin routes: ~5.7 KB

### Suspense Boundaries
Each route wrapped in Suspense for smooth loading:
```typescript
<Route path="profile" element={<S><StudentProfilePage /></S>} />
```

---

**Last Updated**: February 18, 2025  
**Total Routes**: 284  
**Total Roles**: 6
