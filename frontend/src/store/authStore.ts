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
import { persist } from 'zustand/middleware';
import authService, { User, LoginRequest, RegisterRequest } from '../services/authService';

/** Shape of the authentication store state and actions. */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: authService.getStoredUser(),
      isAuthenticated: authService.isAuthenticated(),
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.login(credentials);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
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
            email: data.email,
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
          error: null
        });
      },

      checkAuth: async () => {
        // Verify auth by calling /auth/me — cookie is sent automatically
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch {
          // Token invalid or expired — clear local state
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem('user');
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
