import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API call module before importing store
vi.mock('../../services/student/studentAIService', () => ({
  studentAIService: {
    chat: vi.fn().mockResolvedValue({ response: 'AI response' }),
  },
}));

// Dynamic import so mocks are in place
const { useCoPilotStore } = await import('../coPilotStore');

describe('coPilotStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset key state
    useCoPilotStore.setState({
      isExpanded: false,
      isMinimized: false,
      isChatMode: false,
      hasUnreadMessages: false,
      activeRole: 'student',
      sessions: [],
      currentSessionId: null,
      chatMessages: [],
    });
  });

  it('initializes with collapsed state', () => {
    const state = useCoPilotStore.getState();
    expect(state.isExpanded).toBe(false);
    expect(state.isMinimized).toBe(false);
    expect(state.isChatMode).toBe(false);
  });

  it('toggleExpanded flips isExpanded', () => {
    expect(useCoPilotStore.getState().isExpanded).toBe(false);

    useCoPilotStore.getState().toggleExpanded();
    expect(useCoPilotStore.getState().isExpanded).toBe(true);

    useCoPilotStore.getState().toggleExpanded();
    expect(useCoPilotStore.getState().isExpanded).toBe(false);
  });

  it('setExpanded sets explicit value', () => {
    useCoPilotStore.getState().setExpanded(true);
    expect(useCoPilotStore.getState().isExpanded).toBe(true);

    useCoPilotStore.getState().setExpanded(false);
    expect(useCoPilotStore.getState().isExpanded).toBe(false);
  });

  it('setActiveRole updates the active role', () => {
    useCoPilotStore.getState().setActiveRole('admin');
    expect(useCoPilotStore.getState().activeRole).toBe('admin');
  });

  it('setOnlineStatus updates online state', () => {
    useCoPilotStore.getState().setOnlineStatus(false);
    expect(useCoPilotStore.getState().isOnline).toBe(false);

    useCoPilotStore.getState().setOnlineStatus(true);
    expect(useCoPilotStore.getState().isOnline).toBe(true);
  });

  it('createSession adds a new session', () => {
    useCoPilotStore.getState().createSession('student');
    const state = useCoPilotStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].role).toBe('student');
    expect(state.currentSessionId).toBe(state.sessions[0].id);
  });

  it('deleteSession removes the session', () => {
    useCoPilotStore.getState().createSession('student');
    const sessionId = useCoPilotStore.getState().sessions[0].id;

    useCoPilotStore.getState().deleteSession(sessionId);
    expect(useCoPilotStore.getState().sessions).toHaveLength(0);
  });

  it('minimize and maximize update isMinimized', () => {
    useCoPilotStore.getState().minimize();
    expect(useCoPilotStore.getState().isMinimized).toBe(true);

    useCoPilotStore.getState().maximize();
    expect(useCoPilotStore.getState().isMinimized).toBe(false);
  });

  it('activateChatMode enables chat mode', () => {
    useCoPilotStore.getState().activateChatMode();
    expect(useCoPilotStore.getState().isChatMode).toBe(true);
  });

  it('resetToNormalMode disables chat mode', () => {
    useCoPilotStore.setState({ isChatMode: true });
    useCoPilotStore.getState().resetToNormalMode();
    expect(useCoPilotStore.getState().isChatMode).toBe(false);
  });

  it('markAsRead clears unread flag', () => {
    useCoPilotStore.setState({ hasUnreadMessages: true });
    useCoPilotStore.getState().markAsRead();
    expect(useCoPilotStore.getState().hasUnreadMessages).toBe(false);
  });

  it('detectDashboardType detects role from pathname', () => {
    useCoPilotStore.getState().detectDashboardType('/dashboard/admin/users');
    expect(useCoPilotStore.getState().detectedRole).toBe('admin');

    useCoPilotStore.getState().detectDashboardType('/dashboard/student/courses');
    expect(useCoPilotStore.getState().detectedRole).toBe('student');

    useCoPilotStore.getState().detectDashboardType('/dashboard/parent/children');
    expect(useCoPilotStore.getState().detectedRole).toBe('parent');
  });
});
