# Partner Shared Components

A collection of reusable UI components for the Partner Dashboard with red accent (#E40000) theme and dark backgrounds.

## Components Overview

### 1. PartnerStatsCard
KPI display card with trend indicators.

**Props:**
- `title`: Card title
- `value`: Main metric value (string or number)
- `icon`: React node for icon display
- `trend?`: Trend object with value, label, and direction ('up' | 'down' | 'neutral')
- `subtitle?`: Additional context text
- `className?`: Additional CSS classes
- `onClick?`: Click handler for interactive cards

**Example:**
```tsx
import { PartnerStatsCard } from '@/components/partner/shared';
import { Users } from 'lucide-react';

<PartnerStatsCard
  title="Active Sponsorships"
  value={42}
  icon={<Users className="w-5 h-5" />}
  trend={{ value: 12.5, label: 'vs last month', direction: 'up' }}
  subtitle="Currently active"
/>
```

---

### 2. PartnerPageHeader
Page header with breadcrumbs and action buttons.

**Props:**
- `title`: Page title
- `subtitle?`: Page subtitle
- `breadcrumbs?`: Array of breadcrumb objects
- `actions?`: React node for action buttons

**Example:**
```tsx
import { PartnerPageHeader } from '@/components/partner/shared';
import { Plus } from 'lucide-react';

<PartnerPageHeader
  title="Sponsorships"
  subtitle="Manage your student sponsorships"
  breadcrumbs={[{ label: 'Sponsorships' }]}
  actions={
    <button className="btn-primary">
      <Plus className="w-4 h-4" />
      New Sponsorship
    </button>
  }
/>
```

---

### 3. PartnerBentoCard
Flexible card layout for dashboard BentoGrid.

**Props:**
- `title`: Card title
- `children`: Card content
- `icon?`: Optional icon
- `action?`: Action buttons/elements
- `colSpan?`: Grid column span (1-4)
- `rowSpan?`: Grid row span (1-2)
- `className?`: Additional CSS classes
- `headerClassName?`: Header-specific CSS classes
- `noPadding?`: Remove default padding

**Example:**
```tsx
import { PartnerBentoCard } from '@/components/partner/shared';
import { Heart } from 'lucide-react';

<PartnerBentoCard
  title="Impact Summary"
  icon={<Heart className="w-4 h-4" />}
  colSpan={2}
  rowSpan={1}
>
  <div>Your sponsorship content...</div>
</PartnerBentoCard>
```

---

### 4. PartnerDataTable
Advanced data table with sorting, filtering, pagination, and bulk actions.

**Props:**
- `data`: Array of data objects
- `columns`: TanStack Table column definitions
- `totalCount`: Total number of records
- `page`: Current page number
- `pageSize`: Items per page
- `onPageChange`: Page change handler
- `onPageSizeChange`: Page size change handler
- `onSortChange?`: Sort change handler
- `onSearchChange?`: Search change handler
- `isLoading?`: Loading state
- `searchPlaceholder?`: Search input placeholder
- `enableSearch?`: Enable search functionality
- `enableExport?`: Enable export functionality
- `onExport?`: Export handler
- `bulkActions?`: Array of bulk action configs
- `emptyTitle?`: Empty state title
- `emptyDescription?`: Empty state description
- `getRowId?`: Row ID getter function

**Example:**
```tsx
import { PartnerDataTable } from '@/components/partner/shared';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'grade', header: 'Grade' },
  { accessorKey: 'amount', header: 'Amount' },
];

<PartnerDataTable
  data={sponsorships}
  columns={columns}
  totalCount={100}
  page={1}
  pageSize={10}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  enableSearch
  enableExport
  onExport={(format) => handleExport(format)}
/>
```

---

### 5. PartnerFilterBar
Search and filter controls with clear all functionality.

**Props:**
- `filters`: Array of filter configurations
- `onFilterChange`: Filter change handler
- `onClearAll?`: Clear all filters handler
- `className?`: Additional CSS classes

**Example:**
```tsx
import { PartnerFilterBar } from '@/components/partner/shared';

const filters = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
    ],
    value: selectedStatus,
  },
];

<PartnerFilterBar
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearAll={handleClearAll}
/>
```

---

### 6. PartnerChart
Chart visualizations using Recharts (area, bar, line, pie).

**Props:**
- `type`: Chart type ('area' | 'bar' | 'line' | 'pie')
- `data`: Array of data objects
- `dataKeys`: Array of data key configs
- `xAxisKey?`: X-axis data key
- `height?`: Chart height in pixels
- `showGrid?`: Show grid lines
- `showLegend?`: Show legend
- `showTooltip?`: Show tooltip
- `className?`: Additional CSS classes
- `stacked?`: Enable stacked mode

**Example:**
```tsx
import { PartnerChart } from '@/components/partner/shared';

const data = [
  { month: 'Jan', amount: 5000 },
  { month: 'Feb', amount: 7000 },
];

<PartnerChart
  type="bar"
  data={data}
  dataKeys={[{ key: 'amount', name: 'Sponsorship Amount', color: '#E40000' }]}
  xAxisKey="month"
  height={300}
  showGrid
/>
```

---

### 7. PartnerModal
Modal dialog wrapper with animations.

**Props:**
- `isOpen`: Modal open state
- `onClose`: Close handler
- `title`: Modal title
- `subtitle?`: Modal subtitle
- `children`: Modal content
- `footer?`: Footer content
- `size?`: Modal size ('sm' | 'md' | 'lg' | 'xl')
- `closeOnOverlay?`: Close on overlay click

**Example:**
```tsx
import { PartnerModal } from '@/components/partner/shared';

<PartnerModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Sponsorship"
  subtitle="Create a new student sponsorship"
  size="lg"
  footer={
    <div className="flex gap-2">
      <button onClick={() => setIsOpen(false)}>Cancel</button>
      <button className="btn-primary">Save</button>
    </div>
  }
>
  <div>Modal content...</div>
</PartnerModal>
```

---

### 8. PartnerBadge
Status badges with color variants.

**Props:**
- `variant?`: Badge variant ('critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'warning' | 'default' | 'active' | 'pending' | 'inactive')
- `children`: Badge content
- `className?`: Additional CSS classes
- `dot?`: Show status dot
- `size?`: Badge size ('sm' | 'md')

**Example:**
```tsx
import { PartnerBadge } from '@/components/partner/shared';

<PartnerBadge variant="active" dot>Active</PartnerBadge>
<PartnerBadge variant="pending">Pending Approval</PartnerBadge>
<PartnerBadge variant="success" size="md">Completed</PartnerBadge>
```

---

### 9. PartnerEmptyState
Empty state handler with illustration.

**Props:**
- `title`: Empty state title
- `description?`: Empty state description
- `icon?`: Custom icon (defaults to Inbox)
- `action?`: Action button/element
- `className?`: Additional CSS classes

**Example:**
```tsx
import { PartnerEmptyState } from '@/components/partner/shared';
import { Heart } from 'lucide-react';

<PartnerEmptyState
  icon={<Heart className="w-10 h-10" />}
  title="No sponsorships yet"
  description="Start making a difference by sponsoring a student today."
  action={
    <button className="btn-primary">Create Sponsorship</button>
  }
/>
```

---

### 10. PartnerLoadingSkeleton
Loading skeleton placeholders.

**Props:**
- `variant?`: Skeleton variant ('card' | 'table' | 'chart' | 'text' | 'stats-row')
- `count?`: Number of skeleton items
- `className?`: Additional CSS classes

**Example:**
```tsx
import { PartnerLoadingSkeleton } from '@/components/partner/shared';

// Loading stats cards
<PartnerLoadingSkeleton variant="stats-row" count={4} />

// Loading table
<PartnerLoadingSkeleton variant="table" count={5} />

// Loading chart
<PartnerLoadingSkeleton variant="chart" />
```

---

## Theme Colors

All components use the Partner Dashboard theme:

- **Primary Accent**: `#E40000` (Red)
- **Dark Backgrounds**: `#0F1112` → `#181C1F`
- **Borders**: `#22272B` → `#333`
- **Hover States**: Red accent with opacity variations

## Design Patterns

1. **Mobile-First**: All components are responsive with mobile breakpoints
2. **Framer Motion**: Smooth animations on mount/unmount
3. **TypeScript**: Full type safety with proper interfaces
4. **Accessibility**: ARIA labels, keyboard navigation, focus management
5. **Dark Theme**: Optimized for dark backgrounds with proper contrast

## Import Methods

### Named Imports (Recommended)
```tsx
import { PartnerStatsCard, PartnerDataTable } from '@/components/partner/shared';
```

### Individual Imports
```tsx
import PartnerStatsCard from '@/components/partner/shared/PartnerStatsCard';
```

## Dependencies

- `react`: ^18.0.0
- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `recharts`: Chart library
- `@tanstack/react-table`: Table library
- `react-router-dom`: Routing

## Notes

- All components follow the existing admin/staff patterns
- Red accent color (#E40000) is consistently applied across hover states, icons, and interactive elements
- Components are designed to work within the BentoGrid layout system
- Loading states and empty states are handled gracefully
- All interactive elements have proper focus/hover states for accessibility
