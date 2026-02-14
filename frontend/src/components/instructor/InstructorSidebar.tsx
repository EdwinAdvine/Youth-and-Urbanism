import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useInstructorStore } from '../../store/instructorStore';
import {
  Home, 
  Users, 
  Book, 
  Calendar, 
  MessageSquare, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  GraduationCap,
  Puzzle,
  MessageCircle,
  Send,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Coins,
  FileText,
  Download,
  Share2,
  Settings,
  Bell,
  User,
  UserPlus,
  UserCheck,
  UserX,
  CalendarDays,
  CalendarClock,
  CalendarHeart,
  FileSearch,
  FileCheck,
  FolderKanban,
  Trophy,
  Medal,
  Map,
  Goal,
  Rocket,
  PartyPopper,
  BadgeCheck,
  BadgeHelp,
  BadgeInfo,
  BadgeAlert,
  BadgeX,
  BadgePercent,
  BadgeIndianRupee,
  BadgeEuro,
  BadgePoundSterling,
  BadgeDollarSign,
  BadgePlus,
  BadgeMinus,
  Upload,
  ShieldAlert,
  Inbox,
  Brain,
  Heart,
  Zap,
  ClipboardList,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Plus,
  Search,
  Filter,
  SortAsc,
  Trash2,
  LogOut,
  BellRing,
  HelpCircle,
  Minus,
  Pause,
  Video,
  Gift,
  Globe,
  Key,
  History,
  ShieldCheck,
  BarChart3,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingDown,
  Users as UsersIcon,
  DollarSign,
  PieChart,
  Wallet,
  Receipt,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Play,
  StopCircle,
  Mic,
  Headphones,
  BookOpen,
  FilePlus,
  Folder,
  Share,
  Users2,
  Reply,
  // Additional icons needed
  CalendarClock as CalendarClockIcon,
  Inbox as InboxIcon,
  ShieldAlert as ShieldAlertIcon,
  Edit3 as Edit3Icon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Share2 as Share2Icon,
  Video as VideoIcon,
  ClipboardList as ClipboardListIcon,
  MessageCircle as MessageCircleIcon,
  MessageSquare as MessageSquareIcon,
  Brain as BrainIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  TrendingUp as TrendingUpChart,
  TrendingUp as TrendingUpIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  PartyPopper as PartyPopperIcon,
  History as HistoryIcon,
  FileText as FileTextIcon,
  FileCheck as FileCheckIcon,
  CreditCard as CreditCardIcon,
  UserCheck as UserCheckIcon,
  Gift as GiftIcon,
  HelpCircle as HelpCircleIcon,
  Bell as BellIcon,
  Clock as ClockIcon,
  Globe as GlobeIcon,
  Filter as FilterIcon,
  Key as KeyIcon,
  LogOut as LogOutIcon,
  // Missing icons
  Coins as CoinsIcon,
  BellRing as BellRingIcon,
  Download as DownloadIcon,
  BadgeDollarSign as BadgeDollarSignIcon,
  FileSearch as FileSearchIcon,
  CalendarDays as CalendarDaysIcon,
  ShieldCheck as ShieldCheckIcon,
  User as UserIcon
} from 'lucide-react';

interface InstructorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebarSections, toggleSidebarSection } = useInstructorStore();
  
  const navigationItems: NavItem[] = [
    {
      id: 'today-overview',
      title: 'Today / Overview',
      icon: null,
      children: [
        {
          id: 'heartbeat-view',
          title: 'Quick Heartbeat View',
          icon: <Home className="w-5 h-5" />,
          children: [
            {
              id: 'active-students',
              title: 'Students Active Today',
              icon: <UsersIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/today/active-students'
            },
            {
              id: 'upcoming-sessions',
              title: 'Upcoming Live Sessions & Deadlines',
              icon: <CalendarClockIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/today/upcoming-sessions'
            },
            {
              id: 'submissions-inbox',
              title: 'New Submissions Needing Attention',
              icon: <InboxIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/today/submissions-inbox'
            },
            {
              id: 'earnings-snapshot',
              title: 'Earnings Snapshot & Streak',
              icon: <CoinsIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/today/earnings-snapshot'
            },
            {
              id: 'ai-flagged-students',
              title: 'AI-Flagged Students Who Need Attention',
              icon: <ShieldAlertIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/today/ai-flagged-students'
            }
          ]
        }
      ]
    },
    {
      id: 'my-teaching-space',
      title: 'My Teaching Space',
      icon: null,
      children: [
        {
          id: 'courses-learning-paths',
          title: 'Courses & Learning Paths',
          icon: <Book className="w-5 h-5" />,
          children: [
            {
              id: 'my-created-courses',
              title: 'My Created Courses',
              icon: <BookOpen className="w-4 h-4" />,
              path: '/dashboard/instructor/teaching/courses'
            },
            {
              id: 'modules-lessons-editor',
              title: 'Modules & Lessons Editor',
              icon: <Edit3Icon className="w-4 h-4" />,
              path: '/dashboard/instructor/teaching/modules'
            },
            {
              id: 'cbc-alignment-checker',
              title: 'CBC Alignment Checker & Suggestions',
              icon: <MapIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/teaching/cbc-alignment'
            },
            {
              id: 'preview-as-student',
              title: 'Preview as Student / AI View',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/instructor/teaching/preview'
            },
            {
              id: 'usage-analytics',
              title: 'Usage & Completion Analytics',
              icon: <BarChart3 className="w-4 h-4" />,
              path: '/dashboard/instructor/teaching/analytics'
            }
          ]
        }
      ]
    },
    {
      id: 'assessments-activities',
      title: 'Assessments & Activities',
      icon: null,
      children: [
        {
          id: 'create-assessments',
          title: 'Create Assignments / Quizzes / Projects',
          icon: <FilePlus className="w-5 h-5" />,
          path: '/dashboard/instructor/assessments/create'
        },
        {
          id: 'submissions-inbox',
          title: 'Submissions Inbox (Needs Grading)',
          icon: <InboxIcon className="w-5 h-5" />,
          path: '/dashboard/instructor/assessments/submissions'
        },
        {
          id: 'batch-grading',
          title: 'Batch Grading & AI-Assisted Feedback Suggestions',
          icon: <Sparkles className="w-5 h-5" />,
          path: '/dashboard/instructor/assessments/batch-grading'
        },
        {
          id: 'rubrics-settings',
          title: 'Rubrics & Auto-Scoring Settings',
          icon: <SettingsIcon className="w-5 h-5" />,
          path: '/dashboard/instructor/assessments/rubrics'
        }
      ]
    },
    {
      id: 'resources-materials',
      title: 'Resources & Materials',
      icon: null,
      children: [
        {
          id: 'my-uploaded-resources',
          title: 'My Uploaded Resources',
          icon: <Folder className="w-5 h-5" />,
          path: '/dashboard/instructor/resources/my-uploads'
        },
        {
          id: 'ai-suggested-improvements',
          title: 'AI-Suggested Improvements & Adaptations',
          icon: <Sparkles className="w-5 h-5" />,
          path: '/dashboard/instructor/resources/ai-suggestions'
        },
        {
          id: 'resource-usage',
          title: 'Resource Usage by Students/Cohorts',
          icon: <BarChart3 className="w-5 h-5" />,
          path: '/dashboard/instructor/resources/usage-analytics'
        },
        {
          id: 'share-with-instructors',
          title: 'Share with Other Instructors',
          icon: <Share2Icon className="w-5 h-5" />,
          path: '/dashboard/instructor/resources/share'
        }
      ]
    },
    {
      id: 'students-engagement',
      title: 'Students & Engagement',
      icon: null,
      children: [
        {
          id: 'live-sessions-workshops',
          title: 'Live Sessions & Workshops',
          icon: <VideoIcon className="w-5 h-5" />,
          children: [
            {
              id: 'schedule-host-sessions',
              title: 'Schedule & Host Sessions',
              icon: <CalendarPlus className="w-4 h-4" />,
              path: '/dashboard/instructor/sessions/schedule'
            },
            {
              id: 'attendance-heatmap',
              title: 'Attendance + Engagement Heatmap',
              icon: <UsersIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/sessions/attendance'
            },
            {
              id: 'recordings-summaries',
              title: 'Recordings & AI-Generated Summaries',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/instructor/sessions/recordings'
            },
            {
              id: 'follow-up-tasks',
              title: 'Session Follow-up Tasks',
              icon: <ClipboardListIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/sessions/follow-up'
            }
          ]
        },
        {
          id: 'student-interactions',
          title: 'Student Interactions',
          icon: <MessageCircleIcon className="w-5 h-5" />,
          children: [
            {
              id: 'direct-messages',
              title: 'Direct Messages & Replies',
              icon: <MessageSquareIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/interactions/messages'
            },
            {
              id: 'ai-tutor-handoff',
              title: 'AI Tutor Handoff Notes',
              icon: <BrainIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/interactions/ai-handoff'
            },
            {
              id: 'progress-pulse',
              title: 'Progress Pulse per Student/Group',
              icon: <HeartIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/interactions/progress'
            },
            {
              id: 'flag-celebrate-intervene',
              title: 'Flag / Celebrate / Intervene',
              icon: <ZapIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/interactions/interventions'
            }
          ]
        },
        {
          id: 'discussions-community',
          title: 'Discussions & Community',
          icon: <Users2 className="w-5 h-5" />,
          children: [
            {
              id: 'forum-topics',
              title: 'My Forum Topics & Moderated Spaces',
              icon: <MessageCircleIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/community/forum'
            },
            {
              id: 'student-posts-response',
              title: 'Recent Student Posts Needing Response',
              icon: <MessageSquareIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/community/posts'
            },
            {
              id: 'class-announcements',
              title: 'Class Announcements & Pinned Content',
              icon: <BellRingIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/community/announcements'
            }
          ]
        }
      ]
    },
    {
      id: 'impact-recognition',
      title: 'Impact & Recognition',
      icon: null,
      children: [
        {
          id: 'student-feedback-ratings',
          title: 'Student Feedback & Ratings',
          icon: <Star className="w-5 h-5" />,
          children: [
            {
              id: 'recent-reviews',
              title: 'Recent Reviews & Comments',
              icon: <MessageSquareIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/impact/reviews'
            },
            {
              id: 'sentiment-trends',
              title: 'Sentiment Trends & AI Summaries',
              icon: <TrendingUpChart className="w-4 h-4" />,
              path: '/dashboard/instructor/impact/sentiment'
            },
            {
              id: 'reply-students-parents',
              title: 'Reply to Students/Parents',
              icon: <Reply className="w-4 h-4" />,
              path: '/dashboard/instructor/impact/replies'
            },
            {
              id: 'feedback-improvement-tracker',
              title: 'Feedback Improvement Tracker',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/instructor/impact/improvement'
            }
          ]
        },
        {
          id: 'performance-growth',
          title: 'Performance & Growth',
          icon: <TrendingUpIcon className="w-5 h-5" />,
          children: [
            {
              id: 'engagement-retention-stats',
              title: 'Student Engagement & Retention Stats',
              icon: <UsersIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/growth/engagement'
            },
            {
              id: 'helpful-content-ranking',
              title: 'Most Helpful Content Ranking',
              icon: <TrophyIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/growth/content-ranking'
            },
            {
              id: 'instructor-badges-milestones',
              title: 'Instructor Badges & Milestones',
              icon: <MedalIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/growth/badges'
            },
            {
              id: 'peer-shoutouts-kudos',
              title: 'Peer Shoutouts & Kudos Received',
              icon: <PartyPopperIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/growth/kudos'
            }
          ]
        }
      ]
    },
    {
      id: 'earnings-finance',
      title: 'Earnings & Finances',
      icon: null,
      children: [
        {
          id: 'earnings-dashboard',
          title: 'Earnings Dashboard',
          icon: <DollarSign className="w-5 h-5" />,
          children: [
            {
              id: 'this-month-total-earned',
              title: 'This Month / Total Earned',
              icon: <CoinsIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/earnings/summary'
            },
            {
              id: 'breakdown-course-session-bonus',
              title: 'Breakdown by Course / Session / Bonus',
              icon: <PieChart className="w-4 h-4" />,
              path: '/dashboard/instructor/earnings/breakdown'
            },
            {
              id: 'projected-next-payout',
              title: 'Projected Next Payout',
              icon: <Wallet className="w-4 h-4" />,
              path: '/dashboard/instructor/earnings/projection'
            }
          ]
        },
        {
          id: 'payouts-history',
          title: 'Payouts & History',
          icon: <HistoryIcon className="w-5 h-5" />,
          children: [
            {
              id: 'request-withdrawal',
              title: 'Request Withdrawal',
              icon: <DownloadIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/payouts/withdraw'
            },
            {
              id: 'payment-history-receipts',
              title: 'Payment History & Receipts',
              icon: <FileTextIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/payouts/history'
            },
            {
              id: 'tax-invoice-documents',
              title: 'Tax & Invoice Documents',
              icon: <FileCheckIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/payouts/documents'
            }
          ]
        },
        {
          id: 'rates-billing',
          title: 'Rates & Billing',
          icon: <CreditCardIcon className="w-5 h-5" />,
          children: [
            {
              id: 'set-session-course-rates',
              title: 'Set Session/Course Rates',
              icon: <BadgeDollarSignIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/rates/session-rates'
            },
            {
              id: 'bonus-incentive-rules',
              title: 'Bonus & Incentive Rules',
              icon: <GiftIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/rates/bonuses'
            },
            {
              id: 'payment-method-profile',
              title: 'Payment Method & Profile',
              icon: <UserCheckIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/rates/payment-method'
            }
          ]
        }
      ]
    },
    {
      id: 'instructor-hub',
      title: 'Instructor Hub',
      icon: null,
      children: [
        {
          id: 'resources-guides',
          title: 'Resources & Guides',
          icon: <BookOpen className="w-5 h-5" />,
          children: [
            {
              id: 'cbc-curriculum-references',
              title: 'CBC Curriculum References',
              icon: <MapIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/hub/cbc-references'
            },
            {
              id: 'ai-collaboration-prompts',
              title: 'Effective AI-Collaboration Prompts',
              icon: <BrainIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/hub/ai-prompts'
            },
            {
              id: 'teaching-templates-examples',
              title: 'Teaching Templates & Examples',
              icon: <FilePlus className="w-4 h-4" />,
              path: '/dashboard/instructor/hub/templates'
            },
            {
              id: 'video-walkthroughs',
              title: 'Video Walkthroughs',
              icon: <VideoIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/hub/videos'
            }
          ]
        },
        {
          id: 'community-collaboration',
          title: 'Community & Collaboration',
          icon: <Users2 className="w-5 h-5" />,
          children: [
            {
              id: 'instructors-lounge-forums',
              title: 'Instructors Lounge / Forums',
              icon: <MessageCircleIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/community/lounge'
            },
            {
              id: 'share-best-practices',
              title: 'Share Best Practices & Materials',
              icon: <Share2Icon className="w-4 h-4" />,
              path: '/dashboard/instructor/community/best-practices'
            },
            {
              id: 'co-create-content',
              title: 'Co-Create Content with Others',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/instructor/community/co-creation'
            }
          ]
        },
        {
          id: 'support',
          title: 'Support',
          icon: <HelpCircleIcon className="w-5 h-5" />,
          children: [
            {
              id: 'submit-ticket-urgent-flag',
              title: 'Submit Ticket / Urgent Flag',
              icon: <ShieldAlertIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/support/ticket'
            },
            {
              id: 'view-open-cases',
              title: 'View Open Support Cases',
              icon: <FileSearchIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/support/cases'
            },
            {
              id: 'platform-status-updates',
              title: 'Platform Status & Updates',
              icon: <GlobeIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/support/status'
            }
          ]
        }
      ]
    },
    {
      id: 'you',
      title: 'You',
      icon: null,
      children: [
        {
          id: 'notifications',
          title: 'Notifications (Smart Inbox)',
          icon: <BellIcon className="w-5 h-5" />,
          children: [
            {
              id: 'new-submissions',
              title: 'New Submissions',
              icon: <FileTextIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/notifications/submissions'
            },
            {
              id: 'messages',
              title: 'Messages',
              icon: <MessageSquareIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/notifications/messages'
            },
            {
              id: 'feedback',
              title: 'Feedback',
              icon: <Star className="w-4 h-4" />,
              path: '/dashboard/instructor/you/notifications/feedback'
            },
            {
              id: 'payouts',
              title: 'Payouts',
              icon: <Wallet className="w-4 h-4" />,
              path: '/dashboard/instructor/you/notifications/payouts'
            },
            {
              id: 'reminders',
              title: 'Reminders',
              icon: <ClockIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/notifications/reminders'
            }
          ]
        },
        {
          id: 'profile-portfolio',
          title: 'Profile & Portfolio',
          icon: <UserIcon className="w-5 h-5" />,
          children: [
            {
              id: 'bio-credentials-photo',
              title: 'Bio, Credentials, Photo',
              icon: <UserCheckIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/profile/bio'
            },
            {
              id: 'teaching-showcase',
              title: 'Teaching Showcase & Featured Content',
              icon: <TrophyIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/profile/showcase'
            },
            {
              id: 'public-instructor-page',
              title: 'Public Instructor Page Settings',
              icon: <GlobeIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/profile/public-page'
            }
          ]
        },
        {
          id: 'availability-preferences',
          title: 'Availability & Preferences',
          icon: <CalendarDaysIcon className="w-5 h-5" />,
          children: [
            {
              id: 'calendar-booking-rules',
              title: 'Calendar & Booking Rules',
              icon: <CalendarCheck className="w-4 h-4" />,
              path: '/dashboard/instructor/you/availability/calendar'
            },
            {
              id: 'notification-filters',
              title: 'Notification Filters & Quiet Hours',
              icon: <FilterIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/availability/filters'
            },
            {
              id: 'ai-assistant-personality',
              title: 'AI Assistant Personality (for your interactions)',
              icon: <BrainIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/availability/ai-personality'
            }
          ]
        },
        {
          id: 'security-logout',
          title: 'Security & Logout',
          icon: <ShieldCheckIcon className="w-5 h-5" />,
          children: [
            {
              id: 'change-password',
              title: 'Change Password',
              icon: <KeyIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/security/password'
            },
            {
              id: 'two-factor-auth',
              title: 'Two-Factor Authentication',
              icon: <ShieldCheckIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/security/2fa'
            },
            {
              id: 'login-history',
              title: 'Login History',
              icon: <HistoryIcon className="w-4 h-4" />,
              path: '/dashboard/instructor/you/security/history'
            },
            {
              id: 'logout',
              title: 'Logout',
              icon: <LogOutIcon className="w-4 h-4" />,
              path: '/logout'
            }
          ]
        }
      ]
    }
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard/instructor') return location.pathname === '/dashboard/instructor';
    return location.pathname.startsWith(path);
  };

  const isSectionActive = (item: NavItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) return item.children.some(isSectionActive);
    return false;
  };

  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    if (window.innerWidth < 768) {
      onClose();
    }
    navigate('/');
  };

  const handleNavigation = (path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
      if (window.innerWidth < 768) {
        onClose();
      }
      return;
    }
    
    if (path) {
      if (path === '/logout') {
        handleLogout();
      } else {
        navigate(path);
      }
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile overlay - only covers content area, not topbar */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-16 lg:hidden z-30"
          style={{ 
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky lg:static top-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] border border-gray-200 dark:border-[#22272B]
        shadow-xl lg:shadow-none lg:border-r-0 lg:rounded-r-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Navigation */}
        <nav className="p-4 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {navigationItems.map((section) => (
            <div key={section.id} className="space-y-1">
              {section.title !== 'MAIN' && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              
              {section.children?.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleSidebarSection(item.id)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
                          transition-colors duration-200
                          ${isSectionActive(item) ? 'bg-[#E40000]/15 text-[#E40000]' : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full">
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              openSidebarSections.includes(item.id) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </button>
                      
                      {openSidebarSections.includes(item.id) && (
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-[#22272B] pl-4">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigation(child.path, child.onClick)}
                              disabled={child.disabled}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
                                transition-colors duration-200
                                ${isActive(child.path) 
                                  ? 'bg-[#E40000]/15 text-[#FF4444] border-l-2 border-[#E40000]' 
                                  : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }
                                ${child.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              {child.icon}
                              <span>{child.title}</span>
                              {child.badge && (
                                <span className="ml-auto px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                                  {child.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.path, item.onClick)}
                      disabled={item.disabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
                        transition-colors duration-200
                        ${isActive(item.path) 
                          ? 'bg-[#E40000]/15 text-[#FF4444] border-l-2 border-[#E40000]' 
                          : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                        }
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
            <span>Instructor Dashboard v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorSidebar;