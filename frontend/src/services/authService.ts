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
    console.log('[Auth] authService.login: POST /api/v1/auth/login');
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', credentials);
    const tokens = response.data;
    console.log('[Auth] authService.login: got tokens, storing in localStorage');

    // Store tokens in localStorage
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    // Get user info (backend returns flat User object from /auth/me)
    console.log('[Auth] authService.login: GET /api/v1/auth/me');
    const userResponse = await apiClient.get<User>('/api/v1/auth/me');
    const user = userResponse.data;
    console.log('[Auth] authService.login: got user:', user);

    // Extract full_name from profile_data if not at top level
    if (!user.full_name && user.profile_data?.full_name) {
      user.full_name = user.profile_data.full_name;
    }

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    });
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

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
