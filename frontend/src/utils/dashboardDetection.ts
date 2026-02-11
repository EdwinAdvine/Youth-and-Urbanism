export type DashboardType = 'student' | 'parent' | 'teacher' | 'admin' | 'partner' | 'staff';
export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'partner' | 'staff';

export interface DashboardConfig {
  type: DashboardType;
  role: UserRole;
  title: string;
  subtitle: string;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

/**
 * Detects the dashboard type based on the current pathname
 */
export function detectDashboardType(pathname: string): DashboardType {
  if (pathname.includes('/dashboard/parent')) {
    return 'parent';
  } else if (pathname.includes('/dashboard/teacher') || pathname.includes('/dashboard/instructor')) {
    return 'teacher';
  } else if (pathname.includes('/dashboard/admin')) {
    return 'admin';
  } else if (pathname.includes('/dashboard/partner')) {
    return 'partner';
  } else if (pathname.includes('/dashboard/staff')) {
    return 'staff';
  } else {
    // Default to student for any other dashboard path
    return 'student';
  }
}

/**
 * Gets the configuration for a specific dashboard type
 */
export function getDashboardConfig(type: DashboardType): DashboardConfig {
  switch (type) {
    case 'student':
      return {
        type: 'student',
        role: 'student',
        title: "AI Learning Assistant",
        subtitle: "Your personal tutor",
        quickActions: [
          {
            id: 'assignments',
            title: 'My Assignments',
            description: 'View pending assignments and deadlines',
            icon: '📚',
            color: 'from-blue-500 to-cyan-500',
            onClick: () => console.log('View assignments')
          },
          {
            id: 'progress',
            title: 'Progress Analytics',
            description: 'Track learning progress and insights',
            icon: '📊',
            color: 'from-blue-500 to-cyan-500',
            onClick: () => console.log('View progress')
          },
          {
            id: 'goals',
            title: 'Study Goals',
            description: 'Set and track learning goals',
            icon: '🎯',
            color: 'from-blue-500 to-cyan-500',
            onClick: () => console.log('Manage goals')
          },
          {
            id: 'forum',
            title: 'Class Forum',
            description: 'Recent forum activity and discussions',
            icon: '🤝',
            color: 'from-blue-500 to-cyan-500',
            onClick: () => console.log('Open forum')
          }
        ]
      };

    case 'parent':
      return {
        type: 'parent',
        role: 'parent',
        title: "Parent Assistant",
        subtitle: "Track progress & get insights",
        quickActions: [
          {
            id: 'child-progress',
            title: 'Child Progress',
            description: 'Track your child\'s learning progress',
            icon: '👨‍👩‍👧‍👦',
            color: 'from-green-500 to-emerald-500',
            onClick: () => console.log('View child progress')
          },
          {
            id: 'events',
            title: 'Upcoming Events',
            description: 'School events and important deadlines',
            icon: '📅',
            color: 'from-green-500 to-emerald-500',
            onClick: () => console.log('View events')
          },
          {
            id: 'fees',
            title: 'Fee Management',
            description: 'Payment tracking and billing',
            icon: '💰',
            color: 'from-green-500 to-emerald-500',
            onClick: () => console.log('Manage fees')
          },
          {
            id: 'communication',
            title: 'Teacher Communication',
            description: 'Contact teachers and get updates',
            icon: '📞',
            color: 'from-green-500 to-emerald-500',
            onClick: () => console.log('Contact teachers')
          }
        ]
      };

    case 'teacher':
      return {
        type: 'teacher',
        role: 'teacher',
        title: "Teaching Assistant",
        subtitle: "Class insights & tools",
        quickActions: [
          {
            id: 'class-management',
            title: 'Class Management',
            description: 'Student roster and class management',
            icon: '👥',
            color: 'from-purple-500 to-pink-500',
            onClick: () => console.log('Manage class')
          },
          {
            id: 'assignments',
            title: 'Assignment Review',
            description: 'Grade assignments and provide feedback',
            icon: '📝',
            color: 'from-purple-500 to-pink-500',
            onClick: () => console.log('Review assignments')
          },
          {
            id: 'analytics',
            title: 'Class Analytics',
            description: 'Class performance insights',
            icon: '📈',
            color: 'from-purple-500 to-pink-500',
            onClick: () => console.log('View analytics')
          },
          {
            id: 'lesson-planning',
            title: 'Lesson Planning',
            description: 'Curriculum and lesson planning tools',
            icon: '📋',
            color: 'from-purple-500 to-pink-500',
            onClick: () => console.log('Plan lessons')
          }
        ]
      };

    case 'admin':
      return {
        type: 'admin',
        role: 'admin',
        title: "Admin Assistant",
        subtitle: "System insights",
        quickActions: [
          {
            id: 'system-analytics',
            title: 'System Analytics',
            description: 'Platform-wide statistics and insights',
            icon: '📊',
            color: 'from-orange-500 to-red-500',
            onClick: () => console.log('View system analytics')
          },
          {
            id: 'user-management',
            title: 'User Management',
            description: 'Manage users and permissions',
            icon: '👥',
            color: 'from-orange-500 to-red-500',
            onClick: () => console.log('Manage users')
          },
          {
            id: 'settings',
            title: 'System Settings',
            description: 'Configuration and system settings',
            icon: '🔧',
            color: 'from-orange-500 to-red-500',
            onClick: () => console.log('System settings')
          },
          {
            id: 'reports',
            title: 'Reports',
            description: 'Generate and view system reports',
            icon: '📈',
            color: 'from-orange-500 to-red-500',
            onClick: () => console.log('Generate reports')
          }
        ]
      };

    case 'partner':
      return {
        type: 'partner',
        role: 'partner',
        title: "Partner Assistant",
        subtitle: "Collaboration tools",
        quickActions: [
          {
            id: 'analytics',
            title: 'Partnership Analytics',
            description: 'Partnership performance metrics',
            icon: '🤝',
            color: 'from-teal-500 to-blue-500',
            onClick: () => console.log('View partnership analytics')
          },
          {
            id: 'revenue',
            title: 'Revenue Tracking',
            description: 'Commission and payment tracking',
            icon: '📈',
            color: 'from-teal-500 to-blue-500',
            onClick: () => console.log('Track revenue')
          },
          {
            id: 'referrals',
            title: 'Student Referrals',
            description: 'Track referred students and progress',
            icon: '📊',
            color: 'from-teal-500 to-blue-500',
            onClick: () => console.log('View referrals')
          },
          {
            id: 'support',
            title: 'Partner Support',
            description: 'Partner support and resources',
            icon: '📞',
            color: 'from-teal-500 to-blue-500',
            onClick: () => console.log('Partner support')
          }
        ]
      };

    case 'staff':
      return {
        type: 'staff',
        role: 'staff',
        title: "Staff Assistant",
        subtitle: "Management & coordination tools",
        quickActions: [
          {
            id: 'student-monitoring',
            title: 'Student Monitoring',
            description: 'Track student progress and attendance',
            icon: '👀',
            color: 'from-blue-500 to-indigo-500',
            onClick: () => console.log('View student monitoring')
          },
          {
            id: 'attendance',
            title: 'Attendance Tracking',
            description: 'Manage and review attendance records',
            icon: '📋',
            color: 'from-blue-500 to-indigo-500',
            onClick: () => console.log('View attendance')
          },
          {
            id: 'resources',
            title: 'Resource Management',
            description: 'Manage learning materials and resources',
            icon: '📚',
            color: 'from-blue-500 to-indigo-500',
            onClick: () => console.log('Manage resources')
          },
          {
            id: 'communication',
            title: 'Communication Hub',
            description: 'Coordinate with teachers and parents',
            icon: '💬',
            color: 'from-blue-500 to-indigo-500',
            onClick: () => console.log('Open communication hub')
          }
        ]
      };

    default:
      return getDashboardConfig('student');
  }
}

/**
 * Gets the appropriate role based on dashboard type
 */
export function getRoleForDashboard(type: DashboardType): UserRole {
  return type as UserRole;
}

/**
 * Checks if the current path is a dashboard path
 */
export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/');
}