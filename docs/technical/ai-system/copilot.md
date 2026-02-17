# CoPilot Sidebar

> **Source files**: `frontend/src/components/co-pilot/`, `frontend/src/store/coPilotStore.ts`
> **Last updated**: 2026-02-15

## Overview

The CoPilot is an always-available AI assistant sidebar integrated into every dashboard across the Urban Home School platform. It provides role-aware conversational AI, quick actions, session management, and agent customization. The CoPilot connects to the backend AI Orchestrator via the `/api/v1/ai-tutor/chat` endpoint.

---

## Component Architecture

```
CoPilotSidebar.tsx          # Main sidebar container (expanded/collapsed states)
  |
  +-- AgentProfileSettings.tsx  # AI agent persona customization
  +-- ChatMessages.tsx          # Chat message display component
  +-- ChatInput.tsx             # Message input with send functionality
  +-- CoPilotContent.tsx        # Dashboard content panel (non-chat mode)
  +-- CoPilotPerformance.tsx    # Performance insights panel
  +-- CoPilotAccessibility.tsx  # Accessibility options panel
  +-- CoPilotMobileDrawer.tsx   # Mobile-responsive drawer variant
```

---

## CoPilotSidebar.tsx

The primary container component that manages the sidebar's expanded/collapsed state, role-specific theming, and content routing.

### Layout

- **Position**: Fixed to the right edge of the viewport, below the topbar
- **Collapsed width**: 48px (icon strip)
- **Expanded width**: 360px
- **Animation**: Framer Motion with 300ms ease-in-out transitions

### Collapsed View

When collapsed, the sidebar shows:
- A sparkle icon button to expand
- A role-switch button
- An online/offline status indicator (green/red dot)

### Expanded View

When expanded, the sidebar displays:
- **Header**: Role-specific icon, title, subtitle, online status, agent settings button, close button
- **Chat Toggle**: Button to switch between chat mode and dashboard mode
- **Content Area**: Either chat interface (ChatMessages + ChatInput), agent settings, or dashboard content (quick actions, sessions, tips)
- **Footer**: Version indicator ("AI Co-Pilot v1.0")

### Role-Specific Configuration

Each role has a unique visual identity:

| Role | Title | Icon | Color Gradient |
|---|---|---|---|
| `student` | AI Learning Assistant | BookOpen | blue to cyan |
| `parent` | Parent Assistant | User | green to emerald |
| `teacher` | Teaching Assistant | Play | purple to pink |
| `admin` | Admin Assistant | Settings | orange to red |
| `partner` | Partner Assistant | MessageCircle | teal to blue |
| `staff` | Staff Assistant | Brain | red to orange |
| `instructor` | Instructor Assistant | Star | purple to violet |

---

## State Management: `useCoPilotStore`

A Zustand store with `persist` middleware, saved to `localStorage` under the key `co-pilot-storage`.

### State Shape

```typescript
interface CoPilotState {
  // Core state
  isExpanded: boolean;           // Sidebar expanded/collapsed
  activeRole: UserRole;          // Current user role
  isOnline: boolean;             // Network connectivity status

  // Sessions
  sessions: CoPilotSession[];    // List of chat sessions
  currentSessionId: string | null;

  // UI state
  isMinimized: boolean;          // Minimized state
  hasUnreadMessages: boolean;    // Unread notification badge

  // Chat state
  isChatMode: boolean;           // Chat vs. dashboard view
  chatMessages: ChatMessage[];   // Current chat messages
  currentDashboardType: string;  // Detected dashboard type
  detectedRole: UserRole;        // Auto-detected role from URL
}
```

### Persisted Fields

Only the following fields survive page reloads (via `partialize`):
- `isExpanded`
- `activeRole`
- `sessions`
- `currentSessionId`

### Key Actions

| Action | Description |
|---|---|
| `toggleExpanded()` | Toggle sidebar open/closed; marks messages as read |
| `setActiveRole(role)` | Set active role; auto-creates new session if expanded |
| `createSession(role)` | Create a new chat session for the given role |
| `switchSession(id)` | Switch to a different session |
| `deleteSession(id)` | Remove a session; auto-select another if current was deleted |
| `activateChatMode()` | Switch to chat interface |
| `sendMessage(msg)` | Send a message to the AI backend and append responses |
| `detectDashboardType(path)` | Auto-detect role from URL pathname |
| `resetToNormalMode()` | Exit chat mode back to dashboard view |
| `clearChatMessages()` | Clear all messages in the current session |

### Chat Flow

When `sendMessage(message)` is called:

1. A `user` message is immediately appended to `chatMessages` with `status: 'sending'`
2. The store reads the auth token from `localStorage` (`auth-storage`)
3. The last 10 messages are formatted as conversation history
4. A role-specific system context is generated:
   ```
   "You are an AI assistant for the {activeRole} dashboard of Urban Home School, a Kenyan educational platform. Respond helpfully and concisely."
   ```
5. A `POST` request is sent to `{VITE_API_URL}/api/v1/ai-tutor/chat` with:
   ```json
   {
     "message": "user's message",
     "context": "role-specific system prompt",
     "conversation_history": [...],
     "response_mode": "text"
   }
   ```
6. On success, an `ai` message is appended from `data.message || data.response`
7. On failure, an error message is appended explaining the connection issue

### Dashboard Detection

The `detectDashboardType()` method parses the URL pathname to auto-detect the user's role:

| URL Pattern | Dashboard Type | Detected Role |
|---|---|---|
| `/dashboard/parent` | parent | parent |
| `/dashboard/teacher` or `/dashboard/instructor` | teacher | teacher |
| `/dashboard/admin` | admin | admin |
| `/dashboard/partner` | partner | partner |
| `/dashboard/staff` | staff | staff |
| Default | student | student |

---

## AgentProfileSettings

Accessible via the sliders icon in the sidebar header. Allows users to customize the AI agent's persona, including:

- Agent name
- Personality traits
- Response style preferences
- Subject specializations

The settings component receives an `onClose` callback and renders inline within the sidebar content area.

---

## Chat Components

### ChatMessages.tsx

Renders the list of chat messages with:
- User messages aligned right with a distinct background
- AI messages aligned left with the bot avatar
- Timestamp display
- Message status indicators (sending, sent, delivered, read)

### ChatInput.tsx

Provides the message input interface:
- Text input field
- Send button
- Disabled state when offline (`isDisabled` prop)
- Calls `onSendMessage` callback on submit

---

## CoPilotContent.tsx

The dashboard (non-chat) view within the sidebar, providing:
- Role-specific quick actions grid (2 columns, up to 4 actions)
- Session management (create, switch, delete)
- Tips and guidance cards

Quick actions are loaded from `getDashboardConfig(activeRole)` utility.

---

## CoPilotPerformance.tsx

Displays performance insights relevant to the active role:
- Students: Learning progress, quiz scores, study streaks
- Parents: Child performance summaries
- Instructors: Class-wide analytics
- Admins: Platform-wide metrics

---

## CoPilotAccessibility.tsx

Provides accessibility options:
- Font size adjustments
- High contrast mode toggle
- Screen reader optimizations
- Keyboard navigation hints

---

## CoPilotMobileDrawer.tsx

A mobile-optimized variant of the CoPilot sidebar that renders as a bottom drawer instead of a side panel. Features:
- Swipe-to-open/close gesture support
- Full-width layout on small screens
- Same functionality as the desktop sidebar
- Responsive breakpoint: below `lg` (1024px)

---

## Auto-Initialization

The `useCoPilotInit()` hook ensures a session exists when the CoPilot store is first used:

```typescript
export const useCoPilotInit = () => {
  const { activeRole, sessions, createSession } = useCoPilotStore();

  React.useEffect(() => {
    if (sessions.length === 0) {
      createSession(activeRole);
    }
  }, [activeRole, sessions.length, createSession]);
};
```

This hook should be called in the root layout component to ensure the CoPilot is always ready.

---

## Online/Offline Handling

The sidebar monitors network connectivity via browser events:

```typescript
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

When offline:
- A red status indicator is shown
- The chat input is disabled
- A temporary offline notification banner appears (auto-dismisses after 3 seconds)
- The `isOnline` state is updated in the store
