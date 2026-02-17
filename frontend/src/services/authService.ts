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
    const user = userResponse.data;

    // Extract full_name from profile_data if not at top level
    if (!user.full_name && user.profile_data?.full_name) {
      user.full_name = user.profile_data.full_name;
    }

    // Store non-sensitive user display data only (NO tokens in localStorage)
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens };
  }

  async logout(): Promise<void> {
    // Server call clears httpOnly cookies and blacklists the token
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Ignore errors – cookies are cleared server-side
    }
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    const user = response.data;
    if (!user.full_name && user.profile_data?.full_name) {
      user.full_name = user.profile_data.full_name;
    }
    return user;
  }

  async refreshToken(): Promise<TokenResponse> {
    // Refresh token is sent via httpOnly cookie automatically
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/refresh', {});
    return response.data;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    // Check if user data exists in localStorage.
    // The actual token validity is verified server-side via httpOnly cookie.
    return !!this.getStoredUser();
  }
}

export default new AuthService();
