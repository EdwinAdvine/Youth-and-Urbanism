import apiClient from './api';

// Type Definitions (match backend Pydantic schemas)
export interface RegisterRequest {
  email: string;
  password: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  full_name: string;
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  full_name: string;
  phone_number?: string;
  is_active: boolean;
  profile_data: Record<string, any>;
  created_at: string;
  last_login?: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    // Transform to backend UserCreate format: {email, password, role, profile_data}
    const payload = {
      email: data.email,
      password: data.password,
      role: data.role,
      profile_data: {
        full_name: data.full_name,
        ...(data.phone_number && { phone: data.phone_number }),
      },
    };
    const response = await apiClient.post<User>('/api/v1/auth/register', payload);
    return response.data;
  }

  async login(credentials: LoginRequest): Promise<{ user: User; tokens: TokenResponse }> {
    // Login sets httpOnly cookies automatically via Set-Cookie header
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', credentials);
    const tokens = response.data;

    // Get user info (cookie is sent automatically with withCredentials: true)
    const userResponse = await apiClient.get<User>('/api/v1/auth/me');

    // CRITICAL FIX (H-08): Create a new object instead of mutating the response
    // Spread creates a shallow copy, preventing shared reference corruption
    const user: User = {
      ...userResponse.data,
      // Extract full_name from profile_data if not at top level
      full_name: userResponse.data.full_name || userResponse.data.profile_data?.full_name || '',
    };

    // REMOVED (H-07): Don't store in separate 'user' localStorage key
    // Zustand authStore with persist middleware is now the single source of truth
    // The calling code should use authStore.setUser(user) instead

    return { user, tokens };
  }

  async logout(): Promise<void> {
    // Server call clears httpOnly cookies and blacklists the token
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Ignore errors – cookies are cleared server-side
    }
    // REMOVED (H-07): Don't manage separate 'user' localStorage key
    // Zustand authStore.logout() handles all state clearing
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    // CRITICAL FIX (H-08): Create new object instead of mutating response
    const user: User = {
      ...response.data,
      full_name: response.data.full_name || response.data.profile_data?.full_name || '',
    };
    return user;
  }

  async refreshToken(): Promise<TokenResponse> {
    // Refresh token is sent via httpOnly cookie automatically
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/refresh', {});
    return response.data;
  }

  // REMOVED (H-07): getStoredUser() and isAuthenticated() deprecated
  // Use authStore.user and authStore.isAuthenticated instead
  // These methods relied on separate 'user' localStorage key which is no longer used
}

export default new AuthService();
