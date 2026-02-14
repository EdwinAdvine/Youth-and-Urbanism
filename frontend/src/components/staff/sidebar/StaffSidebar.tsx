import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStaffStore } from '../../../store/staffStore';
import { useAuthStore } from '../../../store/authStore';
import {
  LayoutDashboard,
  Shield,
  Heart,
  Wrench,
  BarChart3,
  UsersRound,
  User,
  Eye,
  FileCheck,
  GraduationCap,
  ShieldAlert,
  Headset,
  MessageSquare,
  Users,
  BookOpen,
  BookOpenCheck,
  PenTool,
  ClipboardCheck,
  Video,
  Activity,
  TrendingUp,
  PieChart,
  FileBarChart,
  LineChart,
  Star,
  Compass,
  Library,
  Bell,
  UserCircle,
  Palette,
  Lock,
  LogOut,
  ChevronDown,
  Search,
  ToggleLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface StaffSidebarProps {
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
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { counters, openSidebarSections, toggleSidebarSection, globalSearch, setGlobalSearch, viewMode, setViewMode, sidebarCollapsed, setSidebarCollapsed } = useStaffStore();
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
          path: '/dashboard/staff',
        },
      ],
    },
    // 2. MODERATION & QUALITY
    {
      id: 'moderation',
      title: 'MODERATION & QUALITY',
      icon: <Shield className="w-5 h-5" />,
      children: [
        {
          id: 'content-review',
          title: 'Content Review',
          icon: <Eye className="w-4 h-4" />,
          path: '/dashboard/staff/moderation/review',
          badge: counters.moderationQueue || undefined,
        },
        {
          id: 'approval-feedback',
          title: 'Approval & Feedback',
          icon: <FileCheck className="w-4 h-4" />,
          path: '/dashboard/staff/moderation/approvals',
        },
        {
          id: 'cbc-standards',
          title: 'CBC & Standards',
          icon: <GraduationCap className="w-4 h-4" />,
          path: '/dashboard/staff/moderation/cbc',
        },
        {
          id: 'safety-policy',
          title: 'Safety & Policy',
          icon: <ShieldAlert className="w-4 h-4" />,
          path: '/dashboard/staff/moderation/safety',
        },
      ],
    },
    // 3. SUPPORT & CARE
    {
      id: 'support',
      title: 'SUPPORT & CARE',
      icon: <Heart className="w-5 h-5" />,
      children: [
        {
          id: 'tickets',
          title: 'Tickets & Conversations',
          icon: <Headset className="w-4 h-4" />,
          path: '/dashboard/staff/support/tickets',
          badge: counters.openTickets || undefined,
        },
        {
          id: 'live-support',
          title: 'Live Support',
          icon: <MessageSquare className="w-4 h-4" />,
          path: '/dashboard/staff/support/live',
        },
        {
          id: 'student-journeys',
          title: 'Student Journeys',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/staff/support/journeys',
        },
        {
          id: 'knowledge-base',
          title: 'Knowledge Base',
          icon: <BookOpen className="w-4 h-4" />,
          path: '/dashboard/staff/support/kb',
        },
      ],
    },
    // 4. LEARNING EXPERIENCE TOOLS
    {
      id: 'learning-tools',
      title: 'LEARNING EXPERIENCE',
      icon: <Wrench className="w-5 h-5" />,
      children: [
        {
          id: 'content-studio',
          title: 'Content Studio',
          icon: <PenTool className="w-4 h-4" />,
          path: '/dashboard/staff/learning/content',
        },
        {
          id: 'assessment-builder',
          title: 'Assessment Builder',
          icon: <ClipboardCheck className="w-4 h-4" />,
          path: '/dashboard/staff/learning/assessments',
        },
        {
          id: 'sessions',
          title: 'Sessions & Live Delivery',
          icon: <Video className="w-4 h-4" />,
          path: '/dashboard/staff/learning/sessions',
        },
        {
          id: 'student-progress',
          title: 'Student Progress',
          icon: <BookOpenCheck className="w-4 h-4" />,
          path: '/dashboard/staff/learning/progress',
        },
      ],
    },
    // 5. INSIGHTS & IMPACT
    {
      id: 'insights',
      title: 'INSIGHTS & IMPACT',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        {
          id: 'platform-health',
          title: 'Platform Health',
          icon: <Activity className="w-4 h-4" />,
          path: '/dashboard/staff/insights/health',
        },
        {
          id: 'content-performance',
          title: 'Content Performance',
          icon: <TrendingUp className="w-4 h-4" />,
          path: '/dashboard/staff/insights/content',
        },
        {
          id: 'support-metrics',
          title: 'Support Metrics',
          icon: <PieChart className="w-4 h-4" />,
          path: '/dashboard/staff/insights/support',
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          icon: <FileBarChart className="w-4 h-4" />,
          path: '/dashboard/staff/insights/reports',
        },
      ],
    },
    // 6. TEAM & GROWTH
    {
      id: 'team',
      title: 'TEAM & GROWTH',
      icon: <UsersRound className="w-5 h-5" />,
      children: [
        {
          id: 'my-performance',
          title: 'My Performance',
          icon: <Star className="w-4 h-4" />,
          path: '/dashboard/staff/team/performance',
        },
        {
          id: 'team-pulse',
          title: 'Team Pulse',
          icon: <LineChart className="w-4 h-4" />,
          path: '/dashboard/staff/team/pulse',
        },
        {
          id: 'learning-resources',
          title: 'Learning & Resources',
          icon: <Library className="w-4 h-4" />,
          path: '/dashboard/staff/team/resources',
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
          id: 'staff-notifications',
          title: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/staff/account/notifications',
          badge: counters.unreadNotifications || undefined,
        },
        {
          id: 'staff-profile',
          title: 'Profile & Presence',
          icon: <UserCircle className="w-4 h-4" />,
          path: '/dashboard/staff/account/profile',
        },
        {
          id: 'staff-preferences',
          title: 'Preferences',
          icon: <Palette className="w-4 h-4" />,
          path: '/dashboard/staff/account/preferences',
        },
        {
          id: 'staff-security',
          title: 'Security & Access',
          icon: <Lock className="w-4 h-4" />,
          path: '/dashboard/staff/account/security',
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
    if (path === '/dashboard/staff') {
      return location.pathname === '/dashboard/staff';
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
    const modes: Array<'teacher_focus' | 'operations_focus' | 'custom'> = ['teacher_focus', 'operations_focus', 'custom'];
    const currentIndex = modes.indexOf(viewMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setViewMode(nextMode);
  };

  const viewModeLabel = {
    teacher_focus: 'Teacher Focus',
    operations_focus: 'Ops Focus',
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
          bg-gradient-to-b from-white to-gray-50 dark:from-[#0F1112] dark:to-[#181C1F] border-r border-gray-200 dark:border-[#22272B]
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
                placeholder="Search staff... (Ctrl+K)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30
                  transition-colors"
              />
            </div>
            {/* View Mode Toggle */}
            <button
              onClick={cycleViewMode}
              className="mt-2 w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md
                bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80 hover:border-gray-400 dark:hover:border-[#444] transition-colors"
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
                      ${isSectionActive(section) ? 'text-[#E40000] bg-[#E40000]/10' : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5'}
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
                            ${isActive(item.path) ? 'bg-[#E40000]/15 text-[#FF4444]' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#E40000]/20 text-[#FF4444] rounded-full min-w-[1.25rem] text-center">
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
                      ${isSectionActive(section) ? 'text-[#E40000]' : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70'}
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
                            transition-all duration-200
                            ${
                              isActive(item.path)
                                ? 'bg-[#E40000]/15 text-[#FF4444] border-l-2 border-[#E40000] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem+0.75rem-1px)]'
                                : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                            }
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#E40000]/20 text-[#FF4444] rounded-full min-w-[1.25rem] text-center">
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
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40">
              <span>Staff Dashboard v1.0</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StaffSidebar;
