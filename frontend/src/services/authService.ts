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

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

// Mock user database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@urbanhomeschool.com',
    name: 'Student User',
    role: 'student',
    gradeLevel: 'Grade 4'
  },
  {
    id: '2',
    email: 'parent@urbanhomeschool.com',
    name: 'Parent User',
    role: 'parent',
    numberOfChildren: '2'
  },
  {
    id: '3',
    email: 'instructor@urbanhomeschool.com',
    name: 'Instructor User',
    role: 'instructor',
    subjects: 'Mathematics, Science'
  },
  {
    id: '4',
    email: 'admin@urbanhomeschool.com',
    name: 'Admin User',
    role: 'admin',
    position: 'School Administrator'
  },
  {
    id: '5',
    email: 'partner@urbanhomeschool.com',
    name: 'Partner User',
    role: 'partner',
    position: 'Community Partner'
  }
];

// Mock signup users storage
let signupUsers: User[] = [];

export const login = async (
  email: string, 
  password: string, 
  rememberMe: boolean
): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check mock users
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password === 'password123') {
    return {
      success: true,
      user: { ...user }
    };
  }

  // Check signup users
  const signupUser = signupUsers.find(u => u.email === email);
  if (signupUser && password === signupUser.email.split('@')[0] + '123') {
    return {
      success: true,
      user: { ...signupUser }
    };
  }

  return {
    success: false,
    error: 'Invalid email or password'
  };
};

export const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'parent' | 'instructor' | 'partner';
  gradeLevel?: string;
  numberOfChildren?: string;
  subjects?: string;
  position?: string;
}): Promise<SignupResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Validation
  if (!userData.name || !userData.email || !userData.password) {
    return {
      success: false,
      error: 'All required fields must be filled'
    };
  }

  if (userData.password.length < 8) {
    return {
      success: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  // Check if email already exists in mock users
  const existingMockUser = mockUsers.find(u => u.email === userData.email);
  if (existingMockUser) {
    return {
      success: false,
      error: 'An account with this email already exists'
    };
  }

  // Check if email already exists in signup users
  const existingSignupUser = signupUsers.find(u => u.email === userData.email);
  if (existingSignupUser) {
    return {
      success: false,
      error: 'An account with this email already exists'
    };
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    gradeLevel: userData.gradeLevel,
    numberOfChildren: userData.numberOfChildren,
    subjects: userData.subjects,
    position: userData.position
  };

  signupUsers.push(newUser);

  return {
    success: true,
    user: newUser
  };
};

export const resetPassword = async (email: string): Promise<ResetPasswordResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if user exists
  const user = mockUsers.find(u => u.email === email) || signupUsers.find(u => u.email === email);
  
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email address'
    };
  }

  // Mock success - in real implementation, this would send an email
  return {
    success: true
  };
};

// Utility function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id) || signupUsers.find(u => u.id === id);
};