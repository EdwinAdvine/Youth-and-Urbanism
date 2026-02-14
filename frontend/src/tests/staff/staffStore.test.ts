/**
 * Vitest tests for staffStore (Zustand)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useStaffStore } from '../../store/staffStore';

describe('staffStore', () => {
  beforeEach(() => {
    const { reset } = useStaffStore.getState();
    reset();
  });

  it('initializes with default values', () => {
    const state = useStaffStore.getState();
    expect(state.viewMode).toBe('teacher_focus');
    expect(state.counters.openTickets).toBe(0);
    expect(state.counters.pendingModeration).toBe(0);
  });

  it('updates counters', () => {
    const { setCounters } = useStaffStore.getState();
    setCounters({
      openTickets: 10,
      pendingModeration: 5,
      atRiskStudents: 3,
    });
    
    const state = useStaffStore.getState();
    expect(state.counters.openTickets).toBe(10);
    expect(state.counters.pendingModeration).toBe(5);
  });

  it('toggles view mode', () => {
    const { setViewMode } = useStaffStore.getState();
    
    setViewMode('operations_focus');
    expect(useStaffStore.getState().viewMode).toBe('operations_focus');
    
    setViewMode('custom');
    expect(useStaffStore.getState().viewMode).toBe('custom');
  });

  it('manages AI agenda items', () => {
    const { setAIAgenda } = useStaffStore.getState();
    
    const agenda = [
      { id: '1', title: 'Review ticket #123', priority: 1, rationale: 'Urgent', estimated_minutes: 15 },
      { id: '2', title: 'Moderate content', priority: 2, rationale: 'Important', estimated_minutes: 10 },
    ];
    
    setAIAgenda(agenda);
    expect(useStaffStore.getState().aiAgenda).toHaveLength(2);
  });
});
