# Partner Dashboard Pages

This directory contains all pages for the Partner role in the Urban Home School platform. Partners are organizations or individuals who sponsor children's education through various programs.

## Directory Structure

```
frontend/src/pages/partner/
├── index.ts                      # Centralized exports
├── PartnerDashboardPage.tsx      # Main partner overview dashboard
├── SponsorshipsPage.tsx          # Manage sponsorship programs
├── SponsoredChildrenPage.tsx     # View all sponsored children
├── ChildProgressPage.tsx         # Individual child detailed progress
├── FundingPage.tsx               # Billing and payment management
└── PartnerProfilePage.tsx        # Organization profile settings
```

## Pages Overview

### 1. PartnerDashboardPage.tsx
**Route:** `/dashboard/partner`

**Description:** Main landing page for partners with comprehensive overview.

**Features:**
- Stats cards (Total Children, Active Programs, Pending Consents, Monthly Spend)
- BentoGrid layout with quick links to major sections
- AI-powered highlights and insights
- Recent activity feed
- Upcoming meetings calendar

**Key Components:**
- Stats cards with trend indicators
- Quick action cards for navigation
- AI highlights section with personalized insights
- Activity timeline
- Meeting cards with virtual/in-person indicators

### 2. SponsorshipsPage.tsx
**Route:** `/dashboard/partner/sponsorships`

**Description:** Comprehensive program management interface.

**Features:**
- List all sponsorship programs with detailed cards
- Create new programs
- Program status tracking (active, pending, paused, completed)
- Bulk actions toolbar for multiple programs
- Advanced filtering (status, program type, date)

**Key Components:**
- Stats overview (Total Programs, Active, Total Children, Monthly Budget)
- Search and filter controls
- Program cards with:
  - Status badges
  - Children count
  - Monthly budget
  - Start date
  - Progress bars
  - Action buttons (View Details, Edit)
- Bulk selection checkbox system

### 3. SponsoredChildrenPage.tsx
**Route:** `/dashboard/partner/sponsored-children`

**Description:** Overview of all sponsored children with key metrics.

**Features:**
- Grid view of all sponsored children
- Filter by program, status, and consent status
- Quick stats per child (progress, weekly activity, streak days)
- Alert system for children needing attention
- Consent status tracking

**Key Components:**
- Stats cards (Total Children, Excellent Progress, Needs Support, Avg Progress)
- Child cards displaying:
  - Avatar with initials
  - Grade and program
  - Status badge (excellent, good, needs-support)
  - Progress percentage
  - Weekly activity hours
  - Learning streak days
  - Recent achievement
  - Consent status
  - Alert indicators
- Click-through to detailed child progress page

### 4. ChildProgressPage.tsx
**Route:** `/dashboard/partner/sponsored-children/:id`

**Description:** Individual child's detailed progress dashboard with tabs.

**Features:**
- **Learning Journey Tab:**
  - CBC (Competency-Based Curriculum) competencies tracking
  - Weekly progress charts
  - Subject-wise performance
  - Topic completion status

- **Activity Tab:**
  - Time spent metrics
  - Session counts
  - Learning streaks
  - Completion rates

- **Achievements Tab:**
  - Awards and certificates
  - Milestone badges
  - Competition wins
  - Date-stamped achievements

- **Goals Tab:**
  - Partner-set goals with progress bars
  - Target deadlines
  - Status indicators (on-track, needs-attention)
  - Goal descriptions

- **AI Insights Tab:**
  - Learning style analysis
  - Identified strengths
  - Support recommendations
  - Early warning alerts

**Key Components:**
- Child header with avatar and basic info
- Tab navigation system
- Progress visualization components
- Trend indicators (up, down, stable)
- Status badges
- Alert systems

### 5. FundingPage.tsx
**Route:** `/dashboard/partner/funding`

**Description:** Financial management and billing center.

**Features:**
- Active subscriptions overview
- Payment processing interface
- Payment history table with search and filters
- Invoice downloads
- Subscription management
- Multiple payment method support

**Key Components:**
- Stats cards (Total Monthly, Active Subscriptions, Next Payment, YTD Spending)
- Subscription list with:
  - Program details
  - Payment frequency
  - Amount
  - Children count
  - Next payment date
  - Status badges
- Payment processing form with:
  - Payment method selector
  - Program selector
  - Amount display
- Payment history table with:
  - Date, program, amount, method, status
  - Invoice download buttons
  - Search and filter controls
  - Status badges

### 6. PartnerProfilePage.tsx
**Route:** `/dashboard/partner/profile`

**Description:** Organization settings and profile management with tabs.

**Features:**
- **Organization Details Tab:**
  - Edit organization information
  - Contact details
  - Legal information
  - Registration details
  - Description

- **Branding & Preferences Tab:**
  - Logo upload
  - Tagline configuration
  - Communication preferences
  - Email notification settings

- **Team Management Tab:**
  - Add/remove team members
  - Role assignment
  - Permission management
  - Member status tracking

- **Partnership Tier Tab:**
  - Current tier display (Gold, Platinum, etc.)
  - Benefits showcase
  - Impact metrics
  - Upgrade options

**Key Components:**
- Tab navigation
- Editable form fields with save/cancel
- File upload for logo
- Team member cards with permissions
- Partnership tier showcase with benefits list
- Action buttons for management

## Design System

### Color Scheme
- **Primary Accent:** `#E40000` (Red) - Partner brand color
- **Background:** `#0F1112` (Dark)
- **Card Background:** `#181C1F` (Dark gray)
- **Card Secondary:** `#22272B` (Medium gray)
- **Borders:** `#22272B`, `#2A2F34` (Subtle grays)

### Status Colors
- **Success/Active/Excellent:** Green (`green-400`, `green-500`)
- **Warning/Pending/Needs Support:** Orange/Yellow (`orange-400`, `yellow-400`)
- **Error/Failed/Cancelled:** Red (`red-400`)
- **Info/Good:** Blue (`blue-400`)
- **Special:** Purple, Cyan variants

### Typography
- **Headings:** Bold, white text
- **Body:** White with 60-70% opacity
- **Labels:** 50% opacity, uppercase
- **Interactive:** Full white on hover

### Components
- **Cards:** Dark background with subtle borders, hover effects
- **Buttons:** Primary (red), secondary (dark gray), ghost variants
- **Badges:** Rounded with icon + text, color-coded by status
- **Progress Bars:** Gradient red (`#E40000` to `#FF4444`)
- **Forms:** Dark inputs with red focus states

## State Management

### usePartnerStore (Zustand)
Located: `/frontend/src/store/partnerStore.ts`

**Key State:**
```typescript
{
  sidebarCollapsed: boolean,
  globalSearch: string,
  activeSection: string,
  counters: {
    pendingConsents: number,
    activeSponsorships: number,
    openTickets: number,
    childAlerts: number,
    pendingPayments: number,
    unreadMessages: number,
  },
  partnerNotifications: PartnerNotification[],
  selectedProgramId: string | null,
  selectedChildId: string | null,
  childViewMode: 'individual' | 'cohort',
}
```

## Types

### Partner Types
Located: `/frontend/src/types/partner.ts`

**Key Types:**
```typescript
interface PartnerNotification {
  id: string;
  title: string;
  message: string;
  type: 'sponsorship' | 'billing' | 'consent' | 'milestone' | 'system';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
  created_at: string;
}
```

## Routing Integration

Add these routes to `App.tsx`:

```typescript
import {
  PartnerDashboardPage,
  SponsorshipsPage,
  SponsoredChildrenPage,
  ChildProgressPage,
  FundingPage,
  PartnerProfilePage,
} from './pages/partner';

// In Routes:
<Route path="/dashboard/partner" element={
  <ProtectedRoute role="partner">
    <PartnerDashboardPage />
  </ProtectedRoute>
} />
<Route path="/dashboard/partner/sponsorships" element={
  <ProtectedRoute role="partner">
    <SponsorshipsPage />
  </ProtectedRoute>
} />
<Route path="/dashboard/partner/sponsored-children" element={
  <ProtectedRoute role="partner">
    <SponsoredChildrenPage />
  </ProtectedRoute>
} />
<Route path="/dashboard/partner/sponsored-children/:id" element={
  <ProtectedRoute role="partner">
    <ChildProgressPage />
  </ProtectedRoute>
} />
<Route path="/dashboard/partner/funding" element={
  <ProtectedRoute role="partner">
    <FundingPage />
  </ProtectedRoute>
} />
<Route path="/dashboard/partner/profile" element={
  <ProtectedRoute role="partner">
    <PartnerProfilePage />
  </ProtectedRoute>
} />
```

## Navigation

Partner sidebar should include links to:
1. Dashboard (`/dashboard/partner`)
2. Sponsorships (`/dashboard/partner/sponsorships`)
3. Sponsored Children (`/dashboard/partner/sponsored-children`)
4. Funding & Billing (`/dashboard/partner/funding`)
5. Profile (`/dashboard/partner/profile`)

## Animations

All pages use Framer Motion for animations:
- **fadeUp:** Entry animation for sections
- **stagger:** Staggered children animations
- **whileHover:** Scale effect on interactive cards
- **Transitions:** Smooth 0.4s duration

## Responsive Design

All pages are fully responsive:
- **Mobile:** Single column, stacked cards
- **Tablet:** 2-column grid for cards
- **Desktop:** 3-4 column grid, full feature set

## Data Integration

Currently using mock data. Ready for API integration:
- Replace mock arrays with API calls
- Use React Query or SWR for data fetching
- Implement real-time updates via WebSocket
- Connect to partner store counters

## Future Enhancements

1. **Real-time Updates:** WebSocket integration for live counters
2. **Advanced Analytics:** Charts and graphs using Recharts
3. **Export Features:** PDF/Excel exports for reports
4. **Bulk Operations:** Multi-select actions for programs and children
5. **Advanced Filters:** Date ranges, custom filters, saved views
6. **Communication:** Direct messaging with coordinators
7. **Calendar Integration:** Meeting scheduling and reminders
8. **Document Management:** Upload/download program documents

## Testing Checklist

- [ ] All pages render without errors
- [ ] Navigation between pages works
- [ ] Forms validate and save correctly
- [ ] Filters and search work as expected
- [ ] Responsive design on all screen sizes
- [ ] Animations smooth and performant
- [ ] TypeScript types are correct
- [ ] State management works across pages
- [ ] Tab navigation functional
- [ ] Status badges display correctly

---

**Created:** February 14, 2026
**Last Updated:** February 14, 2026
**Version:** 1.0.0
