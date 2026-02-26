import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';
import {
  FileText,
  Award,
  Wallet,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Home,
  Play,
  BarChart3,
  MessageCircle,
  HelpCircle,
  Folder,
  Video,
  File,
  Clock,
  Eye,
  Plus,
  Search,
  Share2,
  CalendarPlus,
  MessageSquare,
  Bookmark,
  User,
  Bot,
  Brain,
  Mic,
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  GraduationCap,
  Puzzle,
  Users2,
  Handshake,
  Gift,
  CreditCard,
  Coins,
  Zap,
  Book,
  ClipboardList,
  FileCheck,
  FileSearch,
  FolderKanban,
  Trophy,
  Map,
  Goal,
  CalendarDays,
  CalendarClock,
  MessagesSquare,
  Send,
  ThumbsUp,
  HeartHandshake,
  ShieldCheck,
  Globe2,
  BellRing,
  Palette,
  Rocket,
  PartyPopper,
  BadgeCheck,
  BadgeDollarSign,
  BadgePlus,
  Upload,
  ShieldAlert,
  Inbox
} from 'lucide-react';

interface SidebarProps {
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAuthModal: _onOpenAuthModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebarSections, toggleSidebarSection } = useStudentStore();
  
  const navigationItems: NavItem[] = [
    {
      id: 'home',
      title: 'Home / Today',
      icon: null,
      children: [
        {
          id: 'dashboard',
          title: 'Today\'s Dashboard',
          icon: <Home className="w-5 h-5" />,
          children: [
            {
              id: 'ai-plan',
              title: 'Today\'s Plan by AI',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/student/today/ai-plan'
            },
            {
              id: 'streak',
              title: 'Current Streak',
              icon: <Rocket className="w-4 h-4" />,
              path: '/dashboard/student/today/streak'
            },
            {
              id: 'mood-check',
              title: 'Energy/Mood Check-in',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/student/today/mood'
            },
            {
              id: 'urgent',
              title: 'Urgent Items',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/student/today/urgent'
            },
            {
              id: 'daily-quote',
              title: 'Daily Quote/Micro-lesson',
              icon: <Book className="w-4 h-4" />,
              path: '/dashboard/student/today/quote'
            }
          ]
        }
      ]
    },
    {
      id: 'ai-tutor',
      title: 'My AI Tutor ★',
      icon: null,
      children: [
        {
          id: 'chat',
          title: 'Chat with my AI',
          icon: <Bot className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/chat'
        },
        {
          id: 'learning-path',
          title: 'Today\'s Learning Path',
          icon: <Brain className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/learning-path'
        },
        {
          id: 'voice-mode',
          title: 'Voice Mode',
          icon: <Mic className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/voice'
        },
        {
          id: 'journal',
          title: 'AI Journal & Reflections',
          icon: <ClipboardList className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/journal'
        },
        {
          id: 'help-understand',
          title: 'Help Me Understand',
          icon: <HelpCircle className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/explain'
        }
      ]
    },
    {
      id: 'learning',
      title: 'LEARNING',
      icon: null,
      children: [
        {
          id: 'courses-paths',
          title: 'My Courses & Paths',
          icon: <GraduationCap className="w-5 h-5" />,
          children: [
            {
              id: 'enrolled',
              title: 'Enrolled',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/courses/enrolled'
            },
            {
              id: 'ai-recommended',
              title: 'AI-recommended Learning Paths',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/student/courses/ai-recommended'
            },
            {
              id: 'progress',
              title: 'Progress Rings',
              icon: <Trophy className="w-4 h-4" />,
              path: '/dashboard/student/courses/progress'
            },
            {
              id: 'continue',
              title: 'Continue Buttons',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/courses/continue'
            }
          ]
        },
        {
          id: 'browse-discover',
          title: 'Browse & Discover',
          icon: <Search className="w-5 h-5" />,
          children: [
            {
              id: 'ai-recommendations',
              title: 'AI Recommendations',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/student/browse/ai-recommendations'
            },
            {
              id: 'topic-explorer',
              title: 'Topic Explorer',
              icon: <Puzzle className="w-4 h-4" />,
              path: '/dashboard/student/browse/topic-explorer'
            },
            {
              id: 'search',
              title: 'Search',
              icon: <Search className="w-4 h-4" />,
              path: '/dashboard/student/browse/search'
            },
            {
              id: 'preview',
              title: 'Preview Lessons',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/student/browse/preview'
            },
            {
              id: 'wishlist',
              title: 'Wishlist',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/student/browse/wishlist'
            }
          ]
        },
        {
          id: 'live-interactive',
          title: 'Live & Interactive',
          icon: <Video className="w-5 h-5" />,
          children: [
            {
              id: 'join-live',
              title: 'Join Live Now',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/live/join'
            },
            {
              id: 'upcoming',
              title: 'Upcoming Sessions',
              icon: <CalendarDays className="w-4 h-4" />,
              path: '/dashboard/student/live/upcoming'
            },
            {
              id: 'calendar',
              title: 'Class Calendar',
              icon: <CalendarClock className="w-4 h-4" />,
              path: '/dashboard/student/live/calendar'
            },
            {
              id: 'recordings',
              title: 'Recordings & Notes',
              icon: <FileSearch className="w-4 h-4" />,
              path: '/dashboard/student/live/recordings'
            }
          ]
        }
      ]
    },
    {
      id: 'practice',
      title: 'PRACTICE & ASSESSMENTS',
      icon: null,
      children: [
        {
          id: 'challenges',
          title: 'Today\'s Challenges',
          icon: <Target className="w-5 h-5" />,
          path: '/dashboard/student/practice/challenges'
        },
        {
          id: 'assignments',
          title: 'Assignments',
          icon: <FileText className="w-5 h-5" />,
          children: [
            {
              id: 'due-soon',
              title: 'Due Soon',
              icon: <Clock className="w-4 h-4" />,
              path: '/dashboard/student/assignments/due-soon'
            },
            {
              id: 'pending',
              title: 'Pending',
              icon: <FileSearch className="w-4 h-4" />,
              path: '/dashboard/student/assignments/pending'
            },
            {
              id: 'submitted',
              title: 'Submitted',
              icon: <FileCheck className="w-4 h-4" />,
              path: '/dashboard/student/assignments/submitted'
            },
            {
              id: 'feedback',
              title: 'Feedback',
              icon: <MessagesSquare className="w-4 h-4" />,
              path: '/dashboard/student/assignments/feedback'
            },
            {
              id: 'resubmit',
              title: 'Resubmit',
              icon: <Send className="w-4 h-4" />,
              path: '/dashboard/student/assignments/resubmit'
            }
          ]
        },
        {
          id: 'quizzes',
          title: 'Quizzes & Tests',
          icon: <File className="w-5 h-5" />,
          children: [
            {
              id: 'upcoming',
              title: 'Upcoming',
              icon: <CalendarPlus className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/upcoming'
            },
            {
              id: 'practice-mode',
              title: 'Practice Mode',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/practice'
            },
            {
              id: 'results',
              title: 'My Results',
              icon: <BarChart3 className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/results'
            },
            {
              id: 'skill-reports',
              title: 'Skill Reports',
              icon: <FileCheck className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/skill-reports'
            }
          ]
        },
        {
          id: 'projects',
          title: 'Projects & Creations',
          icon: <FolderKanban className="w-5 h-5" />,
          children: [
            {
              id: 'active',
              title: 'Active Projects',
              icon: <Folder className="w-4 h-4" />,
              path: '/dashboard/student/projects/active'
            },
            {
              id: 'upload',
              title: 'Upload',
              icon: <Upload className="w-4 h-4" />,
              path: '/dashboard/student/projects/upload'
            },
            {
              id: 'gallery',
              title: 'Peer Gallery',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/projects/gallery'
            },
            {
              id: 'feedback',
              title: 'Feedback',
              icon: <MessagesSquare className="w-4 h-4" />,
              path: '/dashboard/student/projects/feedback'
            }
          ]
        }
      ]
    },
    {
      id: 'progress',
      title: 'PROGRESS & GROWTH',
      icon: null,
      children: [
        {
          id: 'achievements',
          title: 'Achievements & Badges',
          icon: <Award className="w-5 h-5" />,
          children: [
            {
              id: 'gallery',
              title: 'Gallery',
              icon: <Trophy className="w-4 h-4" />,
              path: '/dashboard/student/achievements/gallery'
            },
            {
              id: 'recent',
              title: 'Recent Unlocks',
              icon: <Gift className="w-4 h-4" />,
              path: '/dashboard/student/achievements/recent'
            },
            {
              id: 'shareable',
              title: 'Shareable Cards',
              icon: <Share2 className="w-4 h-4" />,
              path: '/dashboard/student/achievements/shareable'
            }
          ]
        },
        {
          id: 'learning-map',
          title: 'My Learning Map',
          icon: <Map className="w-5 h-5" />,
          children: [
            {
              id: 'skill-tree',
              title: 'Skill Tree/Radar',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/student/learning-map/skill-tree'
            },
            {
              id: 'strengths',
              title: 'Strengths',
              icon: <Zap className="w-4 h-4" />,
              path: '/dashboard/student/learning-map/strengths'
            },
            {
              id: 'growing',
              title: 'Growing Areas',
              icon: <TrendingUp className="w-4 h-4" />,
              path: '/dashboard/student/learning-map/growing'
            }
          ]
        },
        {
          id: 'reports',
          title: 'Reports & Insights',
          icon: <BarChart3 className="w-5 h-5" />,
          children: [
            {
              id: 'weekly-story',
              title: 'Weekly Story from AI',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/student/reports/weekly-story'
            },
            {
              id: 'visual-trends',
              title: 'Visual Trends',
              icon: <TrendingUp className="w-4 h-4" />,
              path: '/dashboard/student/reports/visual-trends'
            },
            {
              id: 'parent-summary',
              title: 'Parent Summary',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/reports/parent-summary'
            }
          ]
        },
        {
          id: 'goals',
          title: 'Goals & Habits',
          icon: <Goal className="w-5 h-5" />,
          children: [
            {
              id: 'set-goals',
              title: 'Set Goals',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/student/goals/set'
            },
            {
              id: 'track-streaks',
              title: 'Track Streaks',
              icon: <Rocket className="w-4 h-4" />,
              path: '/dashboard/student/goals/streaks'
            },
            {
              id: 'ai-nudges',
              title: 'AI Nudges & Celebrations',
              icon: <PartyPopper className="w-4 h-4" />,
              path: '/dashboard/student/goals/nudges'
            }
          ]
        }
      ]
    },
    {
      id: 'community',
      title: 'COMMUNITY',
      icon: null,
      children: [
        {
          id: 'friends',
          title: 'Friends & Study Buddies',
          icon: <Users2 className="w-5 h-5" />,
          children: [
            {
              id: 'connect',
              title: 'Connect',
              icon: <Handshake className="w-4 h-4" />,
              path: '/dashboard/student/community/connect'
            },
            {
              id: 'study-groups',
              title: 'Study Groups',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/community/study-groups'
            },
            {
              id: 'collaborative',
              title: 'Collaborative Projects',
              icon: <FolderKanban className="w-4 h-4" />,
              path: '/dashboard/student/community/collaborative'
            }
          ]
        },
        {
          id: 'discussions',
          title: 'Discussions & Forums',
          icon: <MessageCircle className="w-5 h-5" />,
          children: [
            {
              id: 'recent',
              title: 'Recent',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/discussions/recent'
            },
            {
              id: 'my-posts',
              title: 'My Posts',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/discussions/my-posts'
            },
            {
              id: 'saved',
              title: 'Saved',
              icon: <Bookmark className="w-4 h-4" />,
              path: '/dashboard/student/discussions/saved'
            },
            {
              id: 'new-questions',
              title: 'New Questions',
              icon: <HelpCircle className="w-4 h-4" />,
              path: '/dashboard/student/discussions/new-questions'
            }
          ]
        },
        {
          id: 'shoutouts',
          title: 'Shoutouts & Kudos',
          icon: <ThumbsUp className="w-5 h-5" />,
          children: [
            {
              id: 'give',
              title: 'Give Encouragement',
              icon: <HeartHandshake className="w-4 h-4" />,
              path: '/dashboard/student/shoutouts/give'
            },
            {
              id: 'receive',
              title: 'Receive Encouragement',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/student/shoutouts/receive'
            },
            {
              id: 'class-wall',
              title: 'Class Wall',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/shoutouts/class-wall'
            }
          ]
        }
      ]
    },
    {
      id: 'wallet',
      title: 'WALLET & ACCESS',
      icon: null,
      children: [
        {
          id: 'balance',
          title: 'My Balance',
          icon: <Wallet className="w-5 h-5" />,
          children: [
            {
              id: 'summary',
              title: 'KES Summary',
              icon: <BadgeDollarSign className="w-4 h-4" />,
              path: '/dashboard/student/wallet/summary'
            },
            {
              id: 'recent',
              title: 'Recent Transactions',
              icon: <FileText className="w-4 h-4" />,
              path: '/dashboard/student/wallet/recent'
            }
          ]
        },
        {
          id: 'add-funds',
          title: 'Add Funds',
          icon: <Plus className="w-5 h-5" />,
          children: [
            {
              id: 'mpesa',
              title: 'M-Pesa',
              icon: <CreditCard className="w-4 h-4" />,
              path: '/dashboard/student/wallet/add/mpesa'
            },
            {
              id: 'card',
              title: 'Card',
              icon: <CreditCard className="w-4 h-4" />,
              path: '/dashboard/student/wallet/add/card'
            },
            {
              id: 'methods',
              title: 'Payment Methods',
              icon: <Coins className="w-4 h-4" />,
              path: '/dashboard/student/wallet/add/methods'
            }
          ]
        },
        {
          id: 'subscriptions',
          title: 'Subscriptions',
          icon: <Share2 className="w-5 h-5" />,
          children: [
            {
              id: 'current',
              title: 'Current Plan',
              icon: <BadgeCheck className="w-4 h-4" />,
              path: '/dashboard/student/subscriptions/current'
            },
            {
              id: 'upgrade',
              title: 'Upgrade',
              icon: <BadgePlus className="w-4 h-4" />,
              path: '/dashboard/student/subscriptions/upgrade'
            },
            {
              id: 'family',
              title: 'Family Plan Options',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/subscriptions/family'
            }
          ]
        },
        {
          id: 'receipts',
          title: 'Receipts & History',
          icon: <FileSearch className="w-5 h-5" />,
          path: '/dashboard/student/wallet/receipts'
        }
      ]
    },
    {
      id: 'support',
      title: 'SUPPORT & HELP',
      icon: null,
      children: [
        {
          id: 'guides',
          title: 'How-to Guides & Videos',
          icon: <HelpCircle className="w-5 h-5" />,
          path: '/dashboard/student/support/guides'
        },
        {
          id: 'community',
          title: 'Ask the Community',
          icon: <Users2 className="w-5 h-5" />,
          path: '/dashboard/student/support/community'
        },
        {
          id: 'contact',
          title: 'Contact Support',
          icon: <MessageCircle className="w-5 h-5" />,
          children: [
            {
              id: 'quick-ticket',
              title: 'Quick Ticket',
              icon: <FileText className="w-4 h-4" />,
              path: '/dashboard/student/support/ticket'
            },
            {
              id: 'class-teacher',
              title: 'Class Teacher Chat',
              icon: <MessageCircle className="w-4 h-4" />,
              path: '/dashboard/student/support/teacher'
            },
            {
              id: 'urgent',
              title: 'Urgent Flag',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/student/support/urgent'
            }
          ]
        },
        {
          id: 'report',
          title: 'Report a Problem',
          icon: <ShieldAlert className="w-5 h-5" />,
          path: '/dashboard/student/support/report'
        }
      ]
    },
    {
      id: 'you',
      title: 'YOU',
      icon: null,
      children: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell className="w-5 h-5" />,
          children: [
            {
              id: 'inbox',
              title: 'Smart Inbox',
              icon: <Inbox className="w-4 h-4" />,
              path: '/dashboard/student/notifications/inbox'
            },
            {
              id: 'priority',
              title: 'Priority Alerts',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/student/notifications/priority'
            },
            {
              id: 'settings',
              title: 'Settings',
              icon: <Settings className="w-4 h-4" />,
              path: '/dashboard/student/notifications/settings'
            }
          ]
        },
        {
          id: 'profile',
          title: 'Profile',
          icon: <User className="w-5 h-5" />,
          children: [
            {
              id: 'avatar',
              title: 'Avatar',
              icon: <User className="w-4 h-4" />,
              path: '/dashboard/student/profile/avatar'
            },
            {
              id: 'bio',
              title: 'Bio',
              icon: <FileText className="w-4 h-4" />,
              path: '/dashboard/student/profile/bio'
            },
            {
              id: 'learning-style',
              title: 'Learning Style',
              icon: <Brain className="w-4 h-4" />,
              path: '/dashboard/student/profile/learning-style'
            },
            {
              id: 'interests',
              title: 'Interests',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/student/profile/interests'
            }
          ]
        },
        {
          id: 'preferences',
          title: 'Preferences',
          icon: <Settings className="w-5 h-5" />,
          children: [
            {
              id: 'theme',
              title: 'Theme',
              icon: <Palette className="w-4 h-4" />,
              path: '/dashboard/student/preferences/theme'
            },
            {
              id: 'language',
              title: 'Language',
              icon: <Globe2 className="w-4 h-4" />,
              path: '/dashboard/student/preferences/language'
            },
            {
              id: 'notifications',
              title: 'Notifications',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/student/preferences/notifications'
            },
            {
              id: 'ai-personality',
              title: 'AI Personality',
              icon: <Bot className="w-4 h-4" />,
              path: '/dashboard/student/preferences/ai-personality'
            }
          ]
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          icon: <ShieldCheck className="w-5 h-5" />,
          path: '/dashboard/student/privacy'
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: <LogOut className="w-5 h-5" />,
          path: '/logout'
        }
      ]
    }
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard/student') return location.pathname === '/dashboard/student';
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
    useAuthStore.persist.clearStorage();
    window.location.href = '/';
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
        bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] border-r border-gray-200 dark:border-[#22272B]
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
                          ${isSectionActive(item) ? 'bg-[#E40000]/15 text-[#E40000]' : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-[#FF0000]/20 text-[#FF0000] rounded-full">
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
                          : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
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
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;