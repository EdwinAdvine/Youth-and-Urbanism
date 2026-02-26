import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudentStore } from '../../../store/studentStore';
import { useAuthStore } from '../../../store/authStore';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import {
  Home, Bot, BookOpen, Puzzle, BarChart3, Users2, Wallet,
  HelpCircle, User, ChevronDown, LogOut, Bell, Sparkles,
  Mic, ClipboardList, Brain, GraduationCap, Search, Video,
  Target, Trophy, Map, Goal, Handshake, MessageCircle,
  CreditCard, Heart, ThumbsUp, Settings, BellRing,
  Plus, Play, Clock, FileText, File, Folder, Upload,
  CalendarDays, FileSearch, MessagesSquare, Send,
  Gift, TrendingUp, Zap, Rocket, Inbox,
  Globe2, ShieldCheck, Share2, Eye, Edit3,
  Download, CalendarCheck, MessageSquare,
  Bookmark, FolderKanban, CalendarClock,
  ShieldAlert, BellOff, Smile,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';

interface StudentSidebarProps {
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
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
  isNew?: boolean; // For teacher collaboration features
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { openSidebarSections, toggleSidebarSection, counters, currentStreak, sidebarCollapsed, setSidebarCollapsed } = useStudentStore();
  const { ageGroup, borderRadius, useEmojis } = useAgeAdaptiveUI();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [showJournalReminder, setShowJournalReminder] = useState(false);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSectionMouseEnter = useCallback((sectionId: string) => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setHoveredSection(sectionId);
    if (!openSidebarSections.includes(sectionId)) {
      toggleSidebarSection(sectionId);
    }
  }, [openSidebarSections, toggleSidebarSection]);

  const handleSectionMouseLeave = useCallback((sectionId: string) => {
    hoverCloseTimer.current = setTimeout(() => {
      setHoveredSection(null);
      if (openSidebarSections.includes(sectionId)) {
        toggleSidebarSection(sectionId);
      }
    }, 250);
  }, [openSidebarSections, toggleSidebarSection]);

  // Navigation structure
  const navigationItems: NavItem[] = [
    {
      id: 'home',
      title: 'Home / Today',
      icon: <Home className="w-5 h-5" />,
      children: [
        {
          id: 'dashboard',
          title: "Today's Dashboard",
          icon: <Home className="w-5 h-5" />,
          path: '/dashboard/student'
        },
        {
          id: 'ai-plan',
          title: "Today's Plan by AI",
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/student/today/ai-plan'
        },
        {
          id: 'streak',
          title: 'Current Streak',
          icon: <Rocket className="w-4 h-4" />,
          path: '/dashboard/student/today/streak',
          badge: currentStreak
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
          path: '/dashboard/student/today/urgent',
          badge: counters.dueSoonCount
        },
        {
          id: 'daily-quote',
          title: 'Daily Quote/Micro-lesson',
          icon: <BookOpen className="w-4 h-4" />,
          path: '/dashboard/student/today/quote'
        }
      ]
    },
    {
      id: 'ai-tutor',
      title: 'My AI Tutor ★',
      icon: <Bot className="w-5 h-5" />,
      children: [
        {
          id: 'chat',
          title: 'Chat with my AI',
          icon: <Bot className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/chat'
        },
        {
          id: 'learning-path',
          title: "Today's Learning Path",
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
        },
        {
          id: 'teacher-collab',
          title: 'Teacher Collaboration',
          icon: <Handshake className="w-5 h-5" />,
          path: '/dashboard/student/ai-tutor/teacher-collab',
          isNew: true,
          badge: counters.unreadMessages
        }
      ]
    },
    {
      id: 'learning',
      title: 'LEARNING',
      icon: <GraduationCap className="w-5 h-5" />,
      children: [
        {
          id: 'courses',
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
              title: 'AI-recommended Paths',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/student/courses/ai-recommended'
            }
          ]
        },
        {
          id: 'browse',
          title: 'Browse & Discover',
          icon: <Search className="w-5 h-5" />,
          children: [
            {
              id: 'marketplace',
              title: 'Course Marketplace',
              icon: <Search className="w-4 h-4" />,
              path: '/dashboard/student/browse/marketplace'
            },
            {
              id: 'wishlist',
              title: 'Wishlist',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/student/browse/wishlist'
            },
            {
              id: 'topics',
              title: 'Topic Explorer',
              icon: <Globe2 className="w-4 h-4" />,
              path: '/dashboard/student/browse/topics'
            }
          ]
        },
        {
          id: 'live',
          title: 'Live & Interactive',
          icon: <Video className="w-5 h-5" />,
          children: [
            {
              id: 'join-live',
              title: 'Join Live Now',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/live/join',
              badge: counters.activeLiveSessions
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
      icon: <Puzzle className="w-5 h-5" />,
      children: [
        {
          id: 'challenges',
          title: "Today's Challenges",
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
              path: '/dashboard/student/assignments/due-soon',
              badge: counters.dueSoonCount
            },
            {
              id: 'pending',
              title: 'Pending',
              icon: <FileSearch className="w-4 h-4" />,
              path: '/dashboard/student/assignments/pending',
              badge: counters.pendingAssignments
            },
            {
              id: 'submitted',
              title: 'Submitted',
              icon: <CalendarCheck className="w-4 h-4" />,
              path: '/dashboard/student/assignments/submitted'
            },
            {
              id: 'feedback',
              title: 'Feedback',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/assignments/feedback'
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
              icon: <CalendarDays className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/upcoming',
              badge: counters.upcomingQuizzes
            },
            {
              id: 'practice',
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
              icon: <Brain className="w-4 h-4" />,
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
              id: 'project-feedback',
              title: 'Feedback',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/projects/feedback'
            }
          ]
        }
      ]
    },
    {
      id: 'progress',
      title: 'PROGRESS & GROWTH',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        {
          id: 'achievements',
          title: 'Achievements & Badges',
          icon: <Trophy className="w-5 h-5" />,
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
              id: 'share',
              title: 'Shareable Cards',
              icon: <Share2 className="w-4 h-4" />,
              path: '/dashboard/student/achievements/share'
            }
          ]
        },
        {
          id: 'learning-map',
          title: 'My Learning Map',
          icon: <Map className="w-5 h-5" />,
          children: [
            {
              id: 'map-overview',
              title: 'Overview',
              icon: <Map className="w-4 h-4" />,
              path: '/dashboard/student/learning-map'
            },
            {
              id: 'strengths',
              title: 'My Strengths',
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
              id: 'weekly',
              title: 'Weekly Story from AI',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/student/reports/weekly'
            },
            {
              id: 'trends',
              title: 'Visual Trends',
              icon: <TrendingUp className="w-4 h-4" />,
              path: '/dashboard/student/reports/trends'
            },
            {
              id: 'parent-summary',
              title: 'Parent Summary',
              icon: <FileText className="w-4 h-4" />,
              path: '/dashboard/student/reports/parent'
            },
            {
              id: 'nudges',
              title: 'AI Nudges',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/student/reports/nudges'
            },
            {
              id: 'teacher-insights',
              title: 'Teacher Insights',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/student/reports/teacher'
            }
          ]
        },
        {
          id: 'goals',
          title: 'Goals & Habits',
          icon: <Goal className="w-5 h-5" />,
          children: [
            {
              id: 'set',
              title: 'Set Goals',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/student/goals/set'
            },
            {
              id: 'streaks',
              title: 'Track Streaks',
              icon: <Rocket className="w-4 h-4" />,
              path: '/dashboard/student/goals/streaks'
            }
          ]
        }
      ]
    },
    {
      id: 'community',
      title: 'COMMUNITY',
      icon: <Users2 className="w-5 h-5" />,
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
              path: '/dashboard/student/community/connect',
              badge: counters.friendRequests
            },
            {
              id: 'study-groups',
              title: 'Study Groups',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/community/study-groups'
            },
            {
              id: 'collab-projects',
              title: 'Collab Projects',
              icon: <FolderKanban className="w-4 h-4" />,
              path: '/dashboard/student/community/projects'
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
              id: 'new-question',
              title: 'Ask Question',
              icon: <Send className="w-4 h-4" />,
              path: '/dashboard/student/community/questions/new'
            }
          ]
        },
        {
          id: 'teacher-qa',
          title: 'Teacher Q&A',
          icon: <MessagesSquare className="w-5 h-5" />,
          path: '/dashboard/student/community/teacher-qa'
        },
        {
          id: 'shoutouts',
          title: 'Shoutouts & Kudos',
          icon: <ThumbsUp className="w-5 h-5" />,
          children: [
            {
              id: 'wall',
              title: 'Class Wall',
              icon: <Users2 className="w-4 h-4" />,
              path: '/dashboard/student/shoutouts/wall',
              badge: counters.newShoutouts
            },
            {
              id: 'give',
              title: 'Give Shoutout',
              icon: <Send className="w-4 h-4" />,
              path: '/dashboard/student/community/shoutouts/give'
            },
            {
              id: 'received',
              title: 'Received',
              icon: <Inbox className="w-4 h-4" />,
              path: '/dashboard/student/community/shoutouts/received'
            }
          ]
        }
      ]
    },
    {
      id: 'wallet',
      title: 'WALLET & ACCESS',
      icon: <Wallet className="w-5 h-5" />,
      children: [
        {
          id: 'balance',
          title: 'My Balance',
          icon: <Wallet className="w-5 h-5" />,
          path: '/dashboard/student/wallet/balance'
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
              title: 'Card Payment',
              icon: <CreditCard className="w-4 h-4" />,
              path: '/dashboard/student/wallet/add/card'
            }
          ]
        },
        {
          id: 'transactions',
          title: 'Transactions',
          icon: <FileText className="w-5 h-5" />,
          path: '/dashboard/student/wallet/transactions'
        },
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          icon: <CreditCard className="w-5 h-5" />,
          path: '/dashboard/student/wallet/methods'
        },
        {
          id: 'subscriptions',
          title: 'Subscriptions',
          icon: <Share2 className="w-5 h-5" />,
          path: '/dashboard/student/subscriptions'
        },
        {
          id: 'upgrade',
          title: 'Upgrade Plan',
          icon: <Rocket className="w-5 h-5" />,
          path: '/dashboard/student/wallet/upgrade'
        },
        {
          id: 'receipts',
          title: 'Receipts',
          icon: <Download className="w-5 h-5" />,
          path: '/dashboard/student/wallet/receipts'
        },
        {
          id: 'fund-advisor',
          title: 'AI Fund Advisor',
          icon: <Sparkles className="w-5 h-5" />,
          path: '/dashboard/student/wallet/advisor'
        }
      ]
    },
    {
      id: 'support',
      title: 'SUPPORT & HELP',
      icon: <HelpCircle className="w-5 h-5" />,
      children: [
        {
          id: 'guides',
          title: 'How-to Guides & Videos',
          icon: <HelpCircle className="w-5 h-5" />,
          path: '/dashboard/student/support/guides'
        },
        {
          id: 'contact',
          title: 'Contact Support',
          icon: <MessageCircle className="w-5 h-5" />,
          path: '/dashboard/student/support/contact'
        },
        {
          id: 'ai-help',
          title: 'AI Instant Help',
          icon: <Bot className="w-5 h-5" />,
          path: '/dashboard/student/support/ai-help'
        },
        {
          id: 'teacher-chat',
          title: 'Chat with Teacher',
          icon: <MessagesSquare className="w-5 h-5" />,
          path: '/dashboard/student/support/teacher-chat'
        },
        {
          id: 'community-help',
          title: 'Ask Community',
          icon: <Users2 className="w-5 h-5" />,
          path: '/dashboard/student/support/community'
        },
        {
          id: 'report-problem',
          title: 'Report a Problem',
          icon: <ShieldAlert className="w-5 h-5" />,
          path: '/dashboard/student/support/report'
        },
        {
          id: 'urgent-flag',
          title: 'Urgent Help',
          icon: <BellRing className="w-5 h-5" />,
          path: '/dashboard/student/support/urgent'
        }
      ]
    },
    {
      id: 'you',
      title: 'YOU',
      icon: <User className="w-5 h-5" />,
      children: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell className="w-5 h-5" />,
          children: [
            {
              id: 'all-notifications',
              title: 'All Notifications',
              icon: <Bell className="w-4 h-4" />,
              path: '/dashboard/student/notifications',
              badge: counters.unreadNotifications
            },
            {
              id: 'priority-alerts',
              title: 'Priority Alerts',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/student/notifications/priority'
            },
            {
              id: 'notif-settings',
              title: 'Settings',
              icon: <BellOff className="w-4 h-4" />,
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
              id: 'profile-overview',
              title: 'Overview',
              icon: <User className="w-4 h-4" />,
              path: '/dashboard/student/profile'
            },
            {
              id: 'avatar',
              title: 'Avatar',
              icon: <Smile className="w-4 h-4" />,
              path: '/dashboard/student/profile/avatar'
            },
            {
              id: 'bio',
              title: 'Bio',
              icon: <Edit3 className="w-4 h-4" />,
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
              id: 'prefs-general',
              title: 'General',
              icon: <Settings className="w-4 h-4" />,
              path: '/dashboard/student/preferences'
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
          children: [
            {
              id: 'privacy-overview',
              title: 'Overview',
              icon: <ShieldCheck className="w-4 h-4" />,
              path: '/dashboard/student/privacy'
            },
            {
              id: 'teacher-access',
              title: 'Teacher Access',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/student/privacy/teacher-access'
            }
          ]
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: <LogOut className="w-5 h-5" />,
          onClick: handleLogout
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

  // Flatten nested children for flyout (collect all leaf paths)
  const getFlyoutItems = (items: NavItem[]): NavItem[] => {
    const result: NavItem[] = [];
    for (const item of items) {
      if (item.children) {
        result.push(...getFlyoutItems(item.children));
      } else {
        result.push(item);
      }
    }
    return result;
  };

  function doLogout() {
    logout();
    useAuthStore.persist.clearStorage();
    window.location.href = '/';
  }

  function handleLogout() {
    const today = new Date().toDateString();
    const journaledToday = localStorage.getItem('journal_written_today') === today;
    if (!journaledToday) {
      setShowJournalReminder(true);
    } else {
      doLogout();
    }
  }

  const handleNavigation = (path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
      if (window.innerWidth < 768) {
        onClose();
      }
      return;
    }

    if (path) {
      navigate(path);
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div
          key={item.id}
          onMouseEnter={() => handleSectionMouseEnter(item.id)}
          onMouseLeave={() => handleSectionMouseLeave(item.id)}
        >
          <button
            onClick={() => toggleSidebarSection(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm font-medium ${borderRadius}
              transition-colors duration-200
              ${
                isActive(item.children?.[0]?.path)
                  ? 'bg-[#FF0000]/20 text-[#FF0000]'
                  : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.title}</span>
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                  New
                </span>
              )}
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
              {item.children.map((child) => renderNavItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path, item.onClick)}
        disabled={item.disabled}
        className={`
          w-full flex items-center gap-3 px-3 py-2 text-sm font-medium ${borderRadius}
          transition-colors duration-200
          ${
            isActive(item.path)
              ? 'bg-[#FF0000]/20 text-[#FF0000] border-l-2 border-[#FF0000]'
              : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
          }
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {item.icon}
        <span>{item.title}</span>
        {item.isNew && (
          <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
            New
          </span>
        )}
        {item.badge && (
          <span className="ml-auto px-2 py-1 text-xs bg-[#FF0000]/20 text-[#FF0000] rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Journal reminder modal — shown before logout if student hasn't journaled today */}
      {showJournalReminder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#181C1F] rounded-2xl border border-gray-200 dark:border-[#22272B] p-6 shadow-2xl">
            <div className="text-4xl mb-3 text-center">📖</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
              Before you go…
            </h3>
            <p className="text-gray-600 dark:text-white/70 text-sm text-center mb-6">
              You haven't written in your learning journal today. Take a moment to reflect — it only takes a minute!
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowJournalReminder(false);
                  navigate('/dashboard/student/ai-journal');
                  onClose();
                }}
                className="w-full py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white rounded-xl font-medium transition-colors"
              >
                Write in Journal
              </button>
              <button
                onClick={() => { setShowJournalReminder(false); doLogout(); }}
                className="w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white/70 rounded-xl text-sm transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
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
      <div
        className={`
        fixed lg:sticky lg:static top-0 left-0 z-40 h-screen transform transition-all duration-300 ease-in-out
        bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] border-r border-gray-200 dark:border-[#22272B]
        shadow-xl lg:shadow-none flex flex-col
        ${sidebarCollapsed ? 'w-72 lg:w-16' : 'w-72'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:flex items-center justify-end px-3 py-1 border-b border-gray-200 dark:border-[#22272B]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-1.5' : 'p-4'} space-y-2 overflow-y-auto`}>
          {sidebarCollapsed ? (
            /* Collapsed: icon-only with flyout */
            navigationItems.map((section) => (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <button
                  className={`
                    w-full flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200
                    ${isSectionActive(section) ? 'text-[#E40000] bg-[#E40000]/10' : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5'}
                  `}
                  title={section.title}
                >
                  {section.icon}
                </button>

                {/* Flyout panel - flattened leaf items */}
                {hoveredSection === section.id && section.children && (
                  <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-[#1A1D20] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">
                      {section.title}
                    </div>
                    {getFlyoutItems(section.children).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { handleNavigation(item.path, item.onClick); setHoveredSection(null); }}
                        disabled={item.disabled}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium transition-colors
                          ${isActive(item.path) ? 'bg-[#E40000]/15 text-[#FF4444]' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#E40000]/20 text-[#FF4444] rounded-full min-w-[1.25rem] text-center">
                            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Expanded: full rendering with renderNavItem */
            navigationItems.map((section) => (
              <div key={section.id} className="space-y-1">
                {section.title && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {section.children?.map((item) => renderNavItem(item))}
              </div>
            ))
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
              <span>Version 1.0.0</span>
              <div className="flex items-center gap-2">
                {useEmojis && ageGroup === 'young' && <span>✨</span>}
                <span className={`px-2 py-1 ${borderRadius} bg-gray-50 dark:bg-white/5`}>
                  {ageGroup === 'young' ? '🎨 Playful' : ageGroup === 'tween' ? '🌟 Balanced' : '🎯 Clean'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
