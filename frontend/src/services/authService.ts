// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner';
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
  isActive: boolean;
  gradeLevel?: string;
  numberOfChildren?: string;
  subjects?: string;
  position?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner';
  additionalData?: {
    gradeLevel?: string;
    numberOfChildren?: string;
    subjects?: string;
    position?: string;
  };
}

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Handle CORS and network errors
    if (response.status === 0) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running on http://localhost:8000');
    }
    
    // Handle other HTTP errors
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      // If response is not JSON, use status text
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

export const authService = {
  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, remember_me: rememberMe })
    });

    const data = await handleResponse(response);
    
    // Store token and user data
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user || {}));
    
    return {
      success: true,
      user: data.user,
      token: data.access_token,
      message: 'Login successful'
    };
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        grade_level: data.additionalData?.gradeLevel,
        number_of_children: data.additionalData?.numberOfChildren,
        subjects: data.additionalData?.subjects,
        position: data.additionalData?.position
      })
    });

    const userData = await handleResponse(response);
    
    // Store token and user data
    localStorage.setItem('authToken', userData.access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return {
      success: true,
      user: userData,
      token: userData.access_token,
      message: 'Registration successful'
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  async refreshToken(): Promise<string> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authenticated user');
    }

    // For now, we'll just return the existing token
    // In a real implementation, you'd call a refresh endpoint
    return token;
  },

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const userData = await handleResponse(response);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });

    const userData = await handleResponse(response);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

  async resetPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    try {
      const data = await handleResponse(response);
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  }
};