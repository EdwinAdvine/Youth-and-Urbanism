/**
 * Dashboard Detection Utility
 *
 * Provides type-safe dashboard configuration, role detection, and quick actions
 * for all six user roles in the Urban Home School platform.
 *
 * Role standardization: 'instructor' is the canonical role name (not 'teacher').
 * Quick actions now include real frontend routes and AI context prompts that
 * can be passed to the CoPilot for contextual assistance.
 */

export type DashboardType = 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
export type UserRole = 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';

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
  icon: string;
  color: string;
  /** Frontend route to navigate to */
  route: string;
  /** AI prompt for contextual assistance when this action is clicked */
  aiPrompt: string;
}

/**
 * Detects the dashboard type based on the current pathname.
 * Maps both /dashboard/teacher and /dashboard/instructor to 'instructor'
 * for backward compatibility.
 */
export function detectDashboardType(pathname: string): DashboardType {
  if (pathname.includes('/dashboard/parent')) {
    return 'parent';
  } else if (pathname.includes('/dashboard/teacher') || pathname.includes('/dashboard/instructor')) {
    return 'instructor';
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
 * Gets the configuration for a specific dashboard type with
 * real routes and AI prompts for quick actions.
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
            title: 'Due Soon',
            description: 'View upcoming assignment deadlines',
            icon: '📚',
            color: 'from-blue-500 to-cyan-500',
            route: '/dashboard/student/assignments/due-soon',
            aiPrompt: 'Summarize my upcoming assignment deadlines and help me prioritize my work.'
          },
          {
            id: 'progress',
            title: 'Grade Trends',
            description: 'Track learning progress and trends',
            icon: '📊',
            color: 'from-blue-500 to-cyan-500',
            route: '/dashboard/student/reports/trends',
            aiPrompt: 'Analyze my grade trends and identify areas where I need to improve.'
          },
          {
            id: 'quiz',
            title: 'Practice Quiz',
            description: 'Test your knowledge',
            icon: '🎯',
            color: 'from-blue-500 to-cyan-500',
            route: '/dashboard/student/quizzes/practice',
            aiPrompt: 'Create a personalized practice quiz based on my recent lessons and weak areas.'
          },
          {
            id: 'forum',
            title: 'Class Forum',
            description: 'Join discussions with classmates',
            icon: '🤝',
            color: 'from-blue-500 to-cyan-500',
            route: '/dashboard/student/forum',
            aiPrompt: 'Show me recent discussions in my classes and suggest topics I might contribute to.'
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
            id: 'children',
            title: 'My Children',
            description: 'Track all your children\'s progress',
            icon: '👨‍👩‍👧‍👦',
            color: 'from-green-500 to-emerald-500',
            route: '/dashboard/parent/children',
            aiPrompt: 'Give me a summary of how each of my children is performing academically this week.'
          },
          {
            id: 'highlights',
            title: 'AI Highlights',
            description: 'AI-generated insights and alerts',
            icon: '✨',
            color: 'from-green-500 to-emerald-500',
            route: '/dashboard/parent/highlights',
            aiPrompt: 'Show me the most important updates and alerts about my children\'s learning.'
          },
          {
            id: 'subscription',
            title: 'Subscription',
            description: 'Payment and subscription management',
            icon: '💰',
            color: 'from-green-500 to-emerald-500',
            route: '/dashboard/parent/subscription',
            aiPrompt: 'Help me understand my current subscription plan and payment options.'
          },
          {
            id: 'messages',
            title: 'Messages',
            description: 'Communicate with instructors and staff',
            icon: '📞',
            color: 'from-green-500 to-emerald-500',
            route: '/dashboard/parent/messages',
            aiPrompt: 'Draft a message to my child\'s instructor about their recent performance.'
          }
        ]
      };

    case 'instructor':
      return {
        type: 'instructor',
        role: 'instructor',
        title: "Teaching Assistant",
        subtitle: "Class insights & tools",
        quickActions: [
          {
            id: 'courses',
            title: 'My Courses',
            description: 'View and manage your courses',
            icon: '👥',
            color: 'from-purple-500 to-pink-500',
            route: '/dashboard/instructor/courses',
            aiPrompt: 'Give me an overview of my active courses and student enrollment numbers.'
          },
          {
            id: 'submissions',
            title: 'Pending Grading',
            description: 'Review and grade student submissions',
            icon: '📝',
            color: 'from-purple-500 to-pink-500',
            route: '/dashboard/instructor/submissions',
            aiPrompt: 'Summarize the submissions waiting for my review and help me prioritize grading.'
          },
          {
            id: 'performance',
            title: 'Class Performance',
            description: 'Class-wide analytics and trends',
            icon: '📈',
            color: 'from-purple-500 to-pink-500',
            route: '/dashboard/instructor/performance',
            aiPrompt: 'Analyze my class performance data and identify students who may need extra support.'
          },
          {
            id: 'modules',
            title: 'Course Content',
            description: 'Create and organize course modules',
            icon: '📋',
            color: 'from-purple-500 to-pink-500',
            route: '/dashboard/instructor/modules',
            aiPrompt: 'Help me plan my next lesson module with CBC-aligned learning objectives.'
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
            id: 'pulse',
            title: 'Platform Pulse',
            description: 'Real-time platform health and metrics',
            icon: '📊',
            color: 'from-orange-500 to-red-500',
            route: '/dashboard/admin/pulse',
            aiPrompt: 'Give me a high-level summary of platform health, active users, and critical alerts.'
          },
          {
            id: 'users',
            title: 'User Management',
            description: 'Manage users, roles, and permissions',
            icon: '👥',
            color: 'from-orange-500 to-red-500',
            route: '/dashboard/admin/users',
            aiPrompt: 'Show me recent user registration trends and any flagged accounts.'
          },
          {
            id: 'system',
            title: 'System Health',
            description: 'Infrastructure and service monitoring',
            icon: '🔧',
            color: 'from-orange-500 to-red-500',
            route: '/dashboard/admin/system-health',
            aiPrompt: 'Check system health metrics and identify any performance issues or bottlenecks.'
          },
          {
            id: 'reports',
            title: 'Analytics Reports',
            description: 'Generate platform-wide reports',
            icon: '📈',
            color: 'from-orange-500 to-red-500',
            route: '/dashboard/admin/reports',
            aiPrompt: 'Help me generate a comprehensive monthly analytics report for stakeholders.'
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
            id: 'ai-highlights',
            title: 'AI Highlights',
            description: 'AI-generated partnership insights',
            icon: '✨',
            color: 'from-teal-500 to-blue-500',
            route: '/dashboard/partner/ai-highlights',
            aiPrompt: 'Summarize key performance metrics and ROI for our partnership this month.'
          },
          {
            id: 'funding',
            title: 'Funding & Billing',
            description: 'Track financial transactions and invoices',
            icon: '💰',
            color: 'from-teal-500 to-blue-500',
            route: '/dashboard/partner/funding',
            aiPrompt: 'Break down my recent funding transactions and upcoming payment schedules.'
          },
          {
            id: 'children',
            title: 'Sponsored Children',
            description: 'Monitor sponsored students\' progress',
            icon: '👦',
            color: 'from-teal-500 to-blue-500',
            route: '/dashboard/partner/sponsored-children',
            aiPrompt: 'Give me progress updates on all the children I\'m currently sponsoring.'
          },
          {
            id: 'tickets',
            title: 'Support Tickets',
            description: 'Partner support and issue tracking',
            icon: '🎫',
            color: 'from-teal-500 to-blue-500',
            route: '/dashboard/partner/tickets',
            aiPrompt: 'Show me open support tickets and help me draft a response to the most urgent one.'
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
            id: 'progress',
            title: 'Student Progress',
            description: 'Track and monitor student learning journeys',
            icon: '📈',
            color: 'from-blue-500 to-indigo-500',
            route: '/dashboard/staff/learning/progress',
            aiPrompt: 'Identify students who may need intervention or additional support based on recent performance.'
          },
          {
            id: 'sessions',
            title: 'Live Sessions',
            description: 'Manage and schedule live learning sessions',
            icon: '🎥',
            color: 'from-blue-500 to-indigo-500',
            route: '/dashboard/staff/learning/sessions',
            aiPrompt: 'Show me upcoming live sessions and help me plan session content.'
          },
          {
            id: 'content',
            title: 'Content Studio',
            description: 'Create and manage learning materials',
            icon: '📚',
            color: 'from-blue-500 to-indigo-500',
            route: '/dashboard/staff/learning/content',
            aiPrompt: 'Help me organize and tag learning content for easier discovery by students.'
          },
          {
            id: 'tickets',
            title: 'Support Tickets',
            description: 'Handle user support requests',
            icon: '🎫',
            color: 'from-blue-500 to-indigo-500',
            route: '/dashboard/staff/support/tickets',
            aiPrompt: 'Prioritize my open support tickets and suggest responses for the most common issues.'
          }
        ]
      };

    default:
      return getDashboardConfig('student');
  }
}

/**
 * Gets the appropriate role based on dashboard type.
 */
export function getRoleForDashboard(type: DashboardType): UserRole {
  return type as UserRole;
}

/**
 * Checks if the current path is a dashboard path.
 */
export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/');
}
