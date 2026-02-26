/**
 * Authentication store for the Urban Home School platform.
 *
 * Manages JWT-based authentication state including user object, loading
 * and error flags, and persistence to localStorage under "auth-storage".
 *
 * Actions:
 *  - login     -- authenticates via authService and stores user + tokens.
 *  - register  -- creates account, auto-logs in, and fetches the user profile.
 *  - logout    -- clears local state and fires a fire-and-forget server call.
 *  - checkAuth -- validates the current token; logs out if expired.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService, { User, LoginRequest, RegisterRequest } from '../services/authService';
import apiClient from '../services/api';

/** Shape of the authentication store state and actions. */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
  login: (credentials: LoginRequest & { rememberMe?: boolean }) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,

      login: async (credentials: LoginRequest & { rememberMe?: boolean }) => {
        // Step 1: Clear ALL stale auth state immediately to prevent wrong dashboard routing
        set({ user: null, isAuthenticated: false, isLoading: true, error: null, rememberMe: credentials.rememberMe ?? false });
        // Flush stale state to localStorage synchronously
        localStorage.removeItem('user');

        // Step 2: Clear old server session (fire-and-forget) to invalidate stale cookies
        try { await apiClient.post('/api/v1/auth/logout'); } catch { /* ignore */ }

        try {
          // Step 3: Login with fresh credentials
          const { user } = await authService.login({ identifier: credentials.identifier, password: credentials.password });
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Step 4: If rememberMe is unchecked, don't persist to localStorage
          if (!credentials.rememberMe) {
            // Store in sessionStorage instead — cleared when browser closes
            sessionStorage.setItem('auth-session', JSON.stringify({ user, isAuthenticated: true }));
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          // After registration, automatically login
          await authService.login({
            identifier: data.email,
            password: data.password
          });
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        // Fire-and-forget the async server call; state is cleared immediately
        authService.logout().catch(() => {});
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          rememberMe: false
        });
        // Also clear session storage
        sessionStorage.removeItem('auth-session');
      },

      checkAuth: async () => {
        // First check if there's a session-only login (rememberMe was unchecked)
        const sessionAuth = sessionStorage.getItem('auth-session');
        if (sessionAuth) {
          try {
            const { user, isAuthenticated } = JSON.parse(sessionAuth);
            if (user && isAuthenticated) {
              // Verify the session is still valid server-side
              const freshUser = await authService.getCurrentUser();
              set({ user: freshUser, isAuthenticated: true });
              return;
            }
          } catch { /* fall through */ }
        }

        // Verify auth by calling /auth/me — cookie is sent automatically
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch {
          // Token invalid or expired — clear local state
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem('user');
          sessionStorage.removeItem('auth-session');
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe
      }),
      storage: createJSONStorage(() => localStorage)
    }
  )
);
