# Frontend State Management

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Library**: Zustand v4 with `persist` middleware
**Last Updated**: 2026-02-15

---

## Overview

All global state is managed through Zustand stores. The project does not use Redux or React Context for global state management. Each store is a standalone module with its own state shape, actions, and optional persistence configuration.

**Store Files Location**: `frontend/src/store/`

### Store Index (`frontend/src/store/index.ts`)

The barrel export file re-exports all stores and also defines two shared stores inline: `useUserStore` and `useThemeStore`.

```typescript
export { useCoPilotStore, useCoPilotInit, useAuthStore, useInstructorStore };
export { useStaffStore } from './staffStore';
export { useAdminStore } from './adminStore';
export { useParentStore } from './parentStore';
export { usePartnerStore } from './partnerStore';
```

---

## Store Catalog

| Store | File | localStorage Key | Purpose |
|-------|------|-----------------|---------|
| `useAuthStore` | `authStore.ts` | `auth-storage` | Authentication state and tokens |
| `useUserStore` | `index.ts` | `user-storage` | User preferences, courses, assignments, etc. |
| `useThemeStore` | `index.ts` | Manual (`theme` key) | Theme management (light/dark/system) |
| `useCoPilotStore` | `coPilotStore.ts` | `co-pilot-storage` | AI CoPilot sidebar state and chat |
| `useChatStore` | `chatStore.ts` | (none - not persisted) | The Bird AI chat state |
| `useStudentStore` | `studentStore.ts` | `student-storage` | Student dashboard state |
| `useInstructorStore` | `instructorStore.ts` | `instructor-store` | Instructor dashboard state |
| `useAdminStore` | `adminStore.ts` | `admin-store` | Admin dashboard state |
| `useStaffStore` | `staffStore.ts` | `staff-store` | Staff dashboard state |
| `useParentStore` | `parentStore.ts` | `parent-storage` | Parent dashboard state |
| `usePartnerStore` | `partnerStore.ts` | `partner-store` | Partner dashboard state |
| `useCartStore` | `cartStore.ts` | `cart-storage` | Shopping cart state |

---

## Detailed Store Documentation

### useAuthStore (`frontend/src/store/authStore.ts`)

Manages authentication state with JWT token handling.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Current authenticated user object |
| `isAuthenticated` | `boolean` | Whether the user is logged in |
| `isLoading` | `boolean` | Loading state for auth operations |
| `error` | `string \| null` | Error message from last auth operation |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `login` | `credentials: LoginRequest` | Authenticate user with email/password |
| `register` | `data: RegisterRequest` | Register new user (auto-login after) |
| `logout` | (none) | Clear auth state, fire-and-forget server call |
| `checkAuth` | (none) | Validate current token and refresh user data |
| `clearError` | (none) | Clear error message |

**Persistence**: Persists `user` and `isAuthenticated` to `auth-storage` in localStorage.

**Notes**: Token storage is handled by `authService` (separate from the store). The store delegates actual API calls to `authService`.

---

### useUserStore (`frontend/src/store/index.ts`)

Manages user preferences, notifications, and educational data.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `preferences` | `UserPreferences` | Theme, language, notification settings, dashboard widgets |
| `notifications` | `Notification[]` | User notifications |
| `courses` | `Course[]` | Enrolled courses |
| `assignments` | `Assignment[]` | Assignments |
| `quizzes` | `Quiz[]` | Quizzes |
| `certificates` | `Certificate[]` | Earned certificates |
| `transactions` | `Transaction[]` | Payment transactions |
| `forumPosts` | `ForumPost[]` | Forum posts |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `updatePreferences` | `Partial<UserPreferences>` | Update user preferences |
| `addNotification` | notification data | Add a notification |
| `markNotificationAsRead` | `notificationId: string` | Mark single notification read |
| `markAllNotificationsAsRead` | (none) | Mark all notifications read |
| `removeNotification` | `notificationId: string` | Remove a notification |
| `updateCourseProgress` | `courseId, progress` | Update course progress percentage |
| `updateAssignment` | `assignmentId, updates` | Update assignment data |
| `addQuizResult` | `quizId, result` | Add a quiz result |
| `addCertificate` | certificate data | Add a certificate |
| `addTransaction` | transaction data | Add a transaction |
| `addForumPost` | post data | Create a forum post |
| `addForumReply` | `postId, reply` | Add reply to a forum post |

**Persistence**: All state fields are persisted to `user-storage` in localStorage.

---

### useThemeStore (`frontend/src/store/index.ts`)

Manages theme preferences with system theme detection.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | Current theme preference |
| `isDarkMode` | `boolean` | Computed dark mode status |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `setTheme` | `'light' \| 'dark' \| 'system'` | Set theme and update DOM class |
| `toggleTheme` | (none) | Toggle between light and dark |

**Persistence**: Manually persists to `localStorage.theme`. Default is `'dark'` if no saved preference.

**Side Effects**:
- `setTheme` modifies `document.documentElement.classList` (adds/removes `'light'` and `'dark'` classes)
- Listens for `prefers-color-scheme` media query changes when in `'system'` mode
- `initializeTheme()` function should be called on app start

---

### useCoPilotStore (`frontend/src/store/coPilotStore.ts`)

Manages the AI CoPilot sidebar that appears on all dashboard pages.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `isExpanded` | `boolean` | Whether the CoPilot sidebar is open |
| `activeRole` | `UserRole` | Current active role context |
| `isOnline` | `boolean` | Online/offline status |
| `sessions` | `CoPilotSession[]` | CoPilot chat sessions |
| `currentSessionId` | `string \| null` | Current active session ID |
| `isMinimized` | `boolean` | Whether CoPilot is minimized |
| `hasUnreadMessages` | `boolean` | Whether there are unread messages |
| `isChatMode` | `boolean` | Whether in active chat mode |
| `chatMessages` | `ChatMessage[]` | Chat message history |
| `currentDashboardType` | Role string | Detected dashboard type |
| `detectedRole` | `UserRole` | Auto-detected role from URL |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `toggleExpanded` | (none) | Toggle sidebar open/closed |
| `setExpanded` | `boolean` | Set sidebar expansion state |
| `setActiveRole` | `UserRole` | Set active role context |
| `setOnlineStatus` | `boolean` | Update online status |
| `createSession` | `UserRole` | Create new chat session |
| `switchSession` | `sessionId` | Switch to a different session |
| `deleteSession` | `sessionId` | Delete a chat session |
| `markAsRead` | (none) | Mark messages as read |
| `minimize` / `maximize` | (none) | Minimize/maximize CoPilot |
| `activateChatMode` | (none) | Activate chat mode |
| `sendMessage` | `message: string` | Send message to AI backend |
| `detectDashboardType` | `pathname: string` | Detect role from URL path |
| `resetToNormalMode` | (none) | Exit chat mode |
| `addChatMessage` | `ChatMessage` | Add a message |
| `updateMessageStatus` | `messageId, status` | Update message delivery status |
| `clearChatMessages` | (none) | Clear all messages |

**Persistence**: Persists `isExpanded`, `activeRole`, `sessions`, and `currentSessionId` to `co-pilot-storage`.

**AI Integration**: The `sendMessage` action makes a direct `fetch` call to `POST /api/v1/ai-tutor/chat` with conversation history and role context. It uses the JWT token from `auth-storage` in localStorage.

**Initialization**: `useCoPilotInit()` hook auto-creates an initial session when no sessions exist.

---

### useChatStore (`frontend/src/store/chatStore.ts`)

Manages The Bird AI full-screen chat interface state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `messages` | `ChatMessage[]` | Chat message history |
| `isRecording` | `boolean` | Voice recording state |
| `isTyping` | `boolean` | AI typing indicator |
| `birdExpression` | `BirdExpression` | Current bird avatar expression |
| `currentInput` | `string` | Current input field value |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `addMessage` | message data | Add a chat message (auto-generates ID and timestamp) |
| `updateCurrentInput` | `string` | Update input field value |
| `setIsRecording` | `boolean` | Set voice recording state |
| `setIsTyping` | `boolean` | Set AI typing indicator |
| `setBirdExpression` | `BirdExpression` | Change bird avatar expression |
| `clearChat` | (none) | Clear all messages and reset state |
| `loadChatHistory` | `ChatMessage[]` | Load existing chat history |

**Persistence**: Not persisted (ephemeral chat state).

---

### useStudentStore (`frontend/src/store/studentStore.ts`)

Manages student-specific dashboard state with gamification support.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `activeSection` | `string` | Active sidebar section |
| `openSidebarSections` | `string[]` | Currently expanded sidebar sections |
| `counters` | `StudentRealtimeCounters` | Real-time badge counters (unreadNotifications, pendingAssignments, upcomingQuizzes, dueSoonCount, unreadMessages, friendRequests, newShoutouts, activeLiveSessions) |
| `currentMood` | `MoodEntry \| undefined` | Current mood check-in |
| `lastMoodCheckIn` | `Date \| undefined` | Last mood check-in timestamp |
| `showMoodModal` | `boolean` | Whether to show mood modal |
| `currentStreak` | `number` | Current learning streak |
| `longestStreak` | `number` | Longest streak achieved |
| `xp` | `number` | Experience points |
| `level` | `number` | Current level |
| `recentBadges` | `Badge[]` | Recently earned badges (max 5) |
| `dailyPlan` | `DailyPlan \| undefined` | AI-generated daily plan |
| `dailyPlanLoaded` | `boolean` | Whether daily plan has been loaded |
| `notifications` | `NotificationItem[]` | Student notifications |
| `unreadNotificationCount` | `number` | Unread notification count |

**Actions**: UI actions, mood actions, streak actions, gamification actions (XP, level, badges), daily plan actions, real-time counter actions (update, increment, decrement), notification actions.

**Persistence**: Persists sidebar state, mood, streak, XP, and level to `student-storage`.

---

### useInstructorStore (`frontend/src/store/instructorStore.ts`)

Manages instructor-specific dashboard state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `globalSearch` | `string` | Global search query |
| `activeSection` | `string` | Active sidebar section |
| `openSidebarSections` | `string[]` | Expanded sidebar sections |
| `viewMode` | `ViewMode` | Dashboard view mode (`teaching_focus`, `earnings_focus`, `custom`) |
| `counters` | `InstructorRealtimeCounters` | Real-time counters (pendingSubmissions, unreadMessages, upcomingSessions, aiFlaggedStudents, unreadNotifications, pendingPayouts) |
| `instructorNotifications` | `InstructorNotification[]` | Instructor notifications |
| `unreadCount` | `number` | Unread notification count |

**Actions**: UI actions, view mode switching, real-time counter actions, notification actions.

**Persistence**: Persists sidebar state, expanded sections, and view mode to `instructor-store`.

---

### useAdminStore (`frontend/src/store/adminStore.ts`)

Manages admin-specific dashboard state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `globalSearch` | `string` | Global search query |
| `activeSection` | `string` | Active sidebar section |
| `openSidebarSections` | `string[]` | Expanded sidebar sections |
| `counters` | `RealtimeCounters` | Real-time counters (pendingApprovals, activeAlerts, openTickets, activeUsers, moderationQueue, pendingEnrollments) |
| `adminNotifications` | `AdminNotification[]` | Admin notifications |
| `unreadCount` | `number` | Unread notification count |

**Actions**: UI actions, real-time counter actions, notification actions.

**Persistence**: Persists sidebar collapse state and expanded sections to `admin-store`.

---

### useStaffStore (`frontend/src/store/staffStore.ts`)

Manages staff-specific dashboard state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `globalSearch` | `string` | Global search query |
| `activeSection` | `string` | Active sidebar section |
| `openSidebarSections` | `string[]` | Expanded sidebar sections |
| `viewMode` | `'teacher_focus' \| 'operations_focus' \| 'custom'` | Dashboard view mode |
| `counters` | `StaffRealtimeCounters` | Real-time counters (openTickets, moderationQueue, pendingApprovals, activeSessions, unreadNotifications, slaAtRisk) |
| `staffNotifications` | `StaffNotification[]` | Staff notifications |
| `unreadCount` | `number` | Unread notification count |

**Actions**: UI actions, view mode switching, real-time counter actions, notification actions.

**Persistence**: Persists sidebar state, expanded sections, and view mode to `staff-store`.

---

### useParentStore (`frontend/src/store/parentStore.ts`)

Manages parent-specific dashboard state with child context.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `selectedChildId` | `string \| null` | Currently selected child ID |
| `children` | `ChildSummary[]` | List of children |
| `counters` | `ParentRealtimeCounters` | Real-time counters (unreadMessages, unreadAlerts, pendingConsents, upcomingDeadlines, newAchievements, newReports) |
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `globalSearch` | `string` | Global search query |
| `openSidebarSections` | `string[]` | Expanded sidebar sections |
| `parentNotifications` | `ParentNotification[]` | Parent notifications |
| `unreadCount` | `number` | Unread notification count |

**Actions**: Child context actions (select, add, remove), counter actions, UI actions, notification actions.

**Persistence**: Persists sidebar state, expanded sections, and selected child ID to `parent-storage`.

---

### usePartnerStore (`frontend/src/store/partnerStore.ts`)

Manages partner-specific dashboard state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `sidebarCollapsed` | `boolean` | Sidebar collapse state |
| `globalSearch` | `string` | Global search query |
| `activeSection` | `string` | Active sidebar section |
| `openSidebarSections` | `string[]` | Expanded sidebar sections |
| `counters` | `PartnerRealtimeCounters` | Real-time counters (pendingConsents, activeSponsorships, openTickets, childAlerts, pendingPayments, unreadMessages) |
| `partnerNotifications` | `PartnerNotification[]` | Partner notifications |
| `unreadCount` | `number` | Unread notification count |
| `selectedProgramId` | `string \| null` | Selected sponsorship program |
| `selectedChildId` | `string \| null` | Selected child |
| `childViewMode` | `'individual' \| 'cohort'` | Child view mode |

**Actions**: UI actions, counter actions, notification actions, partner-specific actions (program selection, child selection, view mode).

**Persistence**: Persists sidebar state, expanded sections, and child view mode to `partner-store`.

---

### useCartStore (`frontend/src/store/cartStore.ts`)

Manages e-commerce shopping cart state.

**State**:
| Field | Type | Description |
|-------|------|-------------|
| `items` | `CartItem[]` | Cart items |
| `cartId` | `string \| null` | Cart ID from backend |
| `total` | `number` | Cart total price |
| `itemCount` | `number` | Total item count |
| `isCartOpen` | `boolean` | Cart drawer open state |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |

**Actions**:
| Action | Parameters | Description |
|--------|-----------|-------------|
| `openCart` | (none) | Open cart drawer |
| `closeCart` | (none) | Close cart drawer |
| `toggleCart` | (none) | Toggle cart drawer |
| `fetchCart` | (none) | Fetch cart from backend API |
| `addItem` | `productId, quantity` | Add item to cart |
| `updateQuantity` | `itemId, quantity` | Update item quantity |
| `removeItem` | `itemId` | Remove item from cart |
| `clearCart` | (none) | Clear entire cart |
| `clearError` | (none) | Clear error message |

**Persistence**: Persists items, cartId, total, and itemCount to `cart-storage`.

**API Integration**: Uses `storeService` for backend cart operations.

---

## Common Patterns Across Stores

### 1. Persist Middleware with Partialize

All persisted stores use `partialize` to select which fields to persist:

```typescript
export const useXStore = create<XState>()(
  persist(
    (set) => ({ /* state and actions */ }),
    {
      name: 'x-storage',
      partialize: (state) => ({
        // Only persist these fields
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
      }),
    }
  )
);
```

### 2. Real-Time Counter Pattern

Role-specific stores share a common counter pattern for WebSocket-updated badge counts:

```typescript
counters: { openTickets: 0, moderationQueue: 0, /* ... */ },
updateCounters: (counters) => set((state) => ({ counters: { ...state.counters, ...counters } })),
incrementCounter: (key, amount = 1) => set((state) => ({ counters: { ...state.counters, [key]: state.counters[key] + amount } })),
decrementCounter: (key, amount = 1) => set((state) => ({ counters: { ...state.counters, [key]: Math.max(0, state.counters[key] - amount) } })),
```

### 3. Notification Pattern

All role-specific stores include a standard notification management interface:

```typescript
addNotification: (notification) => /* prepend to array, increment unread */
markNotificationRead: (id) => /* mark as read, decrement unread */
markAllNotificationsRead: () => /* mark all read, reset count */
removeNotification: (id) => /* remove from array, adjust count */
clearNotifications: () => /* empty array and reset count */
```

### 4. Sidebar State Pattern

All role-specific stores manage sidebar UI state:

```typescript
sidebarCollapsed: boolean;
activeSection: string;
openSidebarSections: string[];
setSidebarCollapsed: (collapsed: boolean) => void;
setActiveSection: (section: string) => void;
toggleSidebarSection: (sectionId: string) => void;
setOpenSidebarSections: (sections: string[]) => void;
```
