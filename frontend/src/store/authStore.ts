import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { User, LoginRequest, RegisterRequest } from '../services/authService';

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
          console.log('[Auth] store.login: calling authService.login');
          const { user, tokens } = await authService.login(credentials);
          console.log('[Auth] store.login: setting isAuthenticated=true, user:', user?.role);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('[Auth] store.login: FAILED:', error?.message || error);
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
          const response = await authService.register(data);
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
        if (!authService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Token invalid, logout
          authService.logout();
          set({ user: null, isAuthenticated: false });
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
