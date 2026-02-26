import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstructorStore } from '../../../store/instructorStore';
import { useAuthStore } from '../../../store/authStore';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Trophy,
  DollarSign,
  BookOpen,
  User,
  Sparkles,
  BookText,
  Folder,
  CheckSquare,
  Inbox,
  FileText,
  Video,
  MessageSquare,
  Bot,
  TrendingUp,
  Flag,
  MessageCircle,
  ThumbsUp,
  Star,
  BarChart3,
  Medal,
  Heart,
  Wallet,
  Receipt,
  CreditCard,
  BookMarked,
  Lightbulb,
  MessagesSquare,
  Wrench,
  HelpCircle,
  Bell,
  UserCircle,
  Globe,
  Calendar,
  Lock,
  LogOut,
  ChevronDown,
  Search,
  ToggleLeft,
  ChevronsLeft,
  ChevronsRight,
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
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
  isNew?: boolean; // Mark AI-powered features
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    counters,
    openSidebarSections,
    toggleSidebarSection,
    globalSearch,
    setGlobalSearch,
    viewMode,
    setViewMode,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useInstructorStore();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const navigationItems: NavItem[] = [
    // 1. DASHBOARD
    {
      id: 'dashboard',
      title: 'DASHBOARD',
      icon: <LayoutDashboard className="w-5 h-5" />,
      children: [
        {
          id: 'my-focus',
          title: 'My Focus',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/dashboard/instructor',
        },
        {
          id: 'ai-insights',
          title: 'AI Daily Insights',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/instructor/insights',
          isNew: true,
        },
      ],
    },
    // 2. MY TEACHING SPACE
    {
      id: 'teaching',
      title: 'MY TEACHING SPACE',
      icon: <GraduationCap className="w-5 h-5" />,
      children: [
        {
          id: 'courses',
          title: 'My Courses',
          icon: <BookText className="w-4 h-4" />,
          path: '/dashboard/instructor/courses',
        },
        {
          id: 'modules',
          title: 'Modules Editor',
          icon: <Folder className="w-4 h-4" />,
          path: '/dashboard/instructor/modules',
        },
        {
          id: 'cbc-alignment',
          title: 'CBC Alignment (AI)',
          icon: <CheckSquare className="w-4 h-4" />,
          path: '/dashboard/instructor/cbc-alignment',
          isNew: true,
        },
        {
          id: 'assessments',
          title: 'Assessments',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/instructor/assessments',
        },
        {
          id: 'submissions',
          title: 'Submissions',
          icon: <Inbox className="w-4 h-4" />,
          path: '/dashboard/instructor/submissions',
          badge: counters.pendingSubmissions || undefined,
        },
        {
          id: 'resources',
          title: 'Resources & Materials',
          icon: <BookMarked className="w-4 h-4" />,
          path: '/dashboard/instructor/resources',
        },
      ],
    },
    // 3. STUDENTS & ENGAGEMENT
    {
      id: 'students',
      title: 'STUDENTS & ENGAGEMENT',
      icon: <Users className="w-5 h-5" />,
      children: [
        {
          id: 'sessions',
          title: 'Live Sessions',
          icon: <Video className="w-4 h-4" />,
          path: '/dashboard/instructor/sessions',
          badge: counters.upcomingSessions || undefined,
        },
        {
          id: 'messages',
          title: 'Student Messages',
          icon: <MessageSquare className="w-4 h-4" />,
          path: '/dashboard/instructor/messages',
          badge: counters.unreadMessages || undefined,
        },
        {
          id: 'ai-handoff',
          title: 'AI Tutor Handoff',
          icon: <Bot className="w-4 h-4" />,
          path: '/dashboard/instructor/ai-handoff',
          isNew: true,
        },
        {
          id: 'progress',
          title: 'Progress Pulse',
          icon: <TrendingUp className="w-4 h-4" />,
          path: '/dashboard/instructor/progress-pulse',
        },
        {
          id: 'interventions',
          title: 'Flag / Celebrate',
          icon: <Flag className="w-4 h-4" />,
          path: '/dashboard/instructor/interventions',
          badge: counters.aiFlaggedStudents || undefined,
        },
        {
          id: 'discussions',
          title: 'Discussions',
          icon: <MessageCircle className="w-4 h-4" />,
          path: '/dashboard/instructor/discussions',
        },
      ],
    },
    // 4. IMPACT & RECOGNITION
    {
      id: 'impact',
      title: 'IMPACT & RECOGNITION',
      icon: <Trophy className="w-5 h-5" />,
      children: [
        {
          id: 'feedback',
          title: 'Feedback & Ratings',
          icon: <ThumbsUp className="w-4 h-4" />,
          path: '/dashboard/instructor/feedback',
        },
        {
          id: 'sentiment',
          title: 'Sentiment Analysis',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/dashboard/instructor/feedback/sentiment',
          isNew: true,
        },
        {
          id: 'performance',
          title: 'Performance & Growth',
          icon: <Star className="w-4 h-4" />,
          path: '/dashboard/instructor/performance',
        },
        {
          id: 'badges',
          title: 'Badges & Milestones',
          icon: <Medal className="w-4 h-4" />,
          path: '/dashboard/instructor/badges',
        },
        {
          id: 'recognition',
          title: 'Peer Recognition',
          icon: <Heart className="w-4 h-4" />,
          path: '/dashboard/instructor/recognition',
        },
      ],
    },
    // 5. EARNINGS & FINANCES
    {
      id: 'earnings',
      title: 'EARNINGS & FINANCES',
      icon: <DollarSign className="w-5 h-5" />,
      children: [
        {
          id: 'earnings-dashboard',
          title: 'Earnings Dashboard',
          icon: <Wallet className="w-4 h-4" />,
          path: '/dashboard/instructor/earnings',
        },
        {
          id: 'earnings-breakdown',
          title: 'Detailed Breakdown',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/dashboard/instructor/earnings/breakdown',
        },
        {
          id: 'payouts',
          title: 'Payouts & History',
          icon: <Receipt className="w-4 h-4" />,
          path: '/dashboard/instructor/earnings/payouts',
          badge: counters.pendingPayouts || undefined,
        },
        {
          id: 'rates',
          title: 'Rates & Billing',
          icon: <CreditCard className="w-4 h-4" />,
          path: '/dashboard/instructor/earnings/rates',
        },
        {
          id: 'documents',
          title: 'Tax & Invoices',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/instructor/earnings/documents',
        },
      ],
    },
    // 6. INSTRUCTOR HUB
    {
      id: 'hub',
      title: 'INSTRUCTOR HUB',
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        {
          id: 'cbc-references',
          title: 'CBC References',
          icon: <BookMarked className="w-4 h-4" />,
          path: '/dashboard/instructor/hub/cbc-references',
        },
        {
          id: 'ai-prompts',
          title: 'AI Prompts & Templates',
          icon: <Lightbulb className="w-4 h-4" />,
          path: '/dashboard/instructor/hub/ai-prompts',
          isNew: true,
        },
        {
          id: 'community',
          title: 'Community Lounge',
          icon: <MessagesSquare className="w-4 h-4" />,
          path: '/dashboard/instructor/hub/community',
        },
        {
          id: 'co-create',
          title: 'Co-Create (Yjs)',
          icon: <Wrench className="w-4 h-4" />,
          path: '/dashboard/instructor/hub/co-create',
          isNew: true,
        },
        {
          id: 'support',
          title: 'Support Tickets',
          icon: <HelpCircle className="w-4 h-4" />,
          path: '/dashboard/instructor/hub/support',
        },
      ],
    },
    // 7. ACCOUNT
    {
      id: 'account',
      title: 'ACCOUNT',
      icon: <User className="w-5 h-5" />,
      children: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/instructor/notifications',
          badge: counters.unreadNotifications || undefined,
        },
        {
          id: 'profile',
          title: 'Profile & Portfolio',
          icon: <UserCircle className="w-4 h-4" />,
          path: '/dashboard/instructor/profile',
        },
        {
          id: 'public-page',
          title: 'Public Page Settings',
          icon: <Globe className="w-4 h-4" />,
          path: '/dashboard/instructor/profile/public',
        },
        {
          id: 'availability',
          title: 'Availability',
          icon: <Calendar className="w-4 h-4" />,
          path: '/dashboard/instructor/availability',
        },
        {
          id: 'security',
          title: 'Security & 2FA',
          icon: <Lock className="w-4 h-4" />,
          path: '/dashboard/instructor/security',
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: <LogOut className="w-4 h-4" />,
          path: '/logout',
        },
      ],
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard/instructor') {
      return location.pathname === '/dashboard/instructor';
    }
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
      if (window.innerWidth < 1024) onClose();
      return;
    }
    if (path) {
      if (path === '/logout') {
        handleLogout();
      } else {
        navigate(path);
      }
      if (window.innerWidth < 1024) onClose();
    }
  };

  const cycleViewMode = () => {
    const modes: Array<'teaching_focus' | 'earnings_focus' | 'custom'> = [
      'teaching_focus',
      'earnings_focus',
      'custom',
    ];
    const currentIndex = modes.indexOf(viewMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setViewMode(nextMode);
  };

  const viewModeLabel = {
    teaching_focus: 'Teaching Focus',
    earnings_focus: 'Earnings Focus',
    custom: 'Custom',
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 lg:hidden z-30"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
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
        {/* Search bar + View Mode - hidden when collapsed */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-gray-200 dark:border-[#22272B]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search... (Ctrl+K)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/30
                  transition-colors"
              />
            </div>
            {/* View Mode Toggle */}
            <button
              onClick={cycleViewMode}
              className="mt-2 w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md
                bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-500 dark:text-white/60 hover:text-gray-600 dark:text-white/80 hover:border-gray-300 dark:hover:border-[#444] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <ToggleLeft className="w-3.5 h-3.5" />
                <span>{viewModeLabel[viewMode]}</span>
              </div>
              <span className="text-gray-400 dark:text-white/30 text-[10px]">Click to switch</span>
            </button>
          </div>
        )}

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
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-1.5' : 'p-3'} space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333] scrollbar-track-transparent`}>
          {navigationItems.map((section) => (
            <div key={section.id} className="space-y-0.5">
              {sidebarCollapsed ? (
                /* Collapsed: icon-only with flyout */
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <button
                    className={`
                      w-full flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200
                      ${isSectionActive(section) ? 'text-[#8B5CF6] bg-[#8B5CF6]/10' : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                    title={section.title}
                  >
                    {section.icon}
                  </button>

                  {/* Flyout panel */}
                  {hoveredSection === section.id && section.children && (
                    <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-[#1A1D20] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-50 py-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">
                        {section.title}
                      </div>
                      {section.children.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { handleNavigation(item.path, item.onClick); setHoveredSection(null); }}
                          disabled={item.disabled}
                          className={`
                            w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-colors
                            ${isActive(item.path) ? 'bg-[#8B5CF6]/15 text-[#A78BFA]' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.title}</span>
                            {item.isNew && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-[#8B5CF6]/20 text-[#A78BFA] rounded-full uppercase">
                                AI
                              </span>
                            )}
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] rounded-full min-w-[1.25rem] text-center">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Expanded: full rendering */
                <>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSidebarSection(section.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg
                      transition-colors duration-200 group
                      ${isSectionActive(section) ? 'text-[#8B5CF6]' : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openSidebarSections.includes(section.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Section Children */}
                  {openSidebarSections.includes(section.id) && section.children && (
                    <div className="ml-3 space-y-0.5 border-l border-gray-200 dark:border-[#22272B] pl-3">
                      {section.children.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.path, item.onClick)}
                          disabled={item.disabled}
                          className={`
                            w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg
                            transition-all duration-200 group
                            ${
                              isActive(item.path)
                                ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border-l-2 border-[#8B5CF6] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem+0.75rem-1px)]'
                                : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                            }
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.title}</span>
                            {item.isNew && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-[#8B5CF6]/20 text-[#A78BFA] rounded-full uppercase">
                                AI
                              </span>
                            )}
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#8B5CF6]/20 text-[#A78BFA] rounded-full min-w-[1.25rem] text-center">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
          {!sidebarCollapsed && (
            <div className="text-xs text-gray-400 dark:text-white/40">
              <span>Instructor Dashboard v1.0</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InstructorSidebar;
