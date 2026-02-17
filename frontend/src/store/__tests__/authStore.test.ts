import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock authService
vi.mock('../../services/authService', () => ({
  default: {
    getStoredUser: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

import authService from '../../services/authService';

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login sets user and isAuthenticated on success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'student' };
    vi.mocked(authService.login).mockResolvedValueOnce({
      user: mockUser as any,
      tokens: { access_token: 'tok', refresh_token: 'ref', token_type: 'bearer', expires_in: 3600 },
    });

    await useAuthStore.getState().login({ email: 'test@example.com', password: 'pass' });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login sets error on failure', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );

    await expect(
      useAuthStore.getState().login({ email: 'bad@example.com', password: 'wrong' })
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeTruthy();
  });

  it('login sets isLoading during request', async () => {
    let resolveLogin: (value: any) => void;
    vi.mocked(authService.login).mockReturnValueOnce(
      new Promise((resolve) => { resolveLogin = resolve; })
    );

    const loginPromise = useAuthStore.getState().login({ email: 'a@b.com', password: 'p' });

    // isLoading should be true while waiting
    expect(useAuthStore.getState().isLoading).toBe(true);

    resolveLogin!({ user: { id: '1' }, tokens: { access_token: 'x' } });
    await loginPromise;

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('logout clears user and authentication state', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'x@y.com', role: 'student' } as any,
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('clearError resets error to null', () => {
    useAuthStore.setState({ error: 'Some error' });

    useAuthStore.getState().clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });
});
