import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserStore } from '../store';
import { mockCourses, mockAssignments, mockCertificates, mockTransactions } from '../services/mockData';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'instructor' | 'partner' | 'admin';
  gradeLevel?: string;
  numberOfChildren?: string;
  subjects?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'parent' | 'instructor' | 'partner';
    gradeLevel?: string;
    numberOfChildren?: string;
    subjects?: string;
    position?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Import and use the authService object
      const { authService } = await import('../services/authService');
      const response = await authService.login(email, password, rememberMe);

      if (response.success && response.user) {
        setUser(response.user);
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Populate user store with mock data for demonstration
        if (response.user.role === 'student') {
          const userStore = useUserStore.getState();
          userStore.courses = mockCourses;
          userStore.assignments = mockAssignments;
          userStore.certificates = mockCertificates;
          userStore.transactions = mockTransactions;
        }
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'parent' | 'instructor' | 'partner';
    gradeLevel?: string;
    numberOfChildren?: string;
    subjects?: string;
    position?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { authService } = await import('../services/authService');
      const response = await authService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        additionalData: {
          gradeLevel: userData.gradeLevel,
          numberOfChildren: userData.numberOfChildren,
          subjects: userData.subjects,
          position: userData.position
        }
      });

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { authService } = await import('../services/authService');
      const response = await authService.resetPassword(email);

      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};