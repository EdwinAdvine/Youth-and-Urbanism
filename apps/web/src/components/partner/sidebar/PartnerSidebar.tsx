import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePartnerStore } from '../../../store/partnerStore';
import { useAuthStore } from '../../../store/authStore';
import {
  LayoutDashboard,
  Sparkles,
  Link2,
  Handshake,
  Users,
  Eye,
  BookOpen,
  Target,
  TrendingUp,
  Bot,
  BookMarked,
  Upload,
  FolderPlus,
  DollarSign,
  Wallet,
  CreditCard,
  Award,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  FileText,
  Brain,
  Headset,
  LifeBuoy,
  GraduationCap,
  Video,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PartnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { counters, openSidebarSections, toggleSidebarSection, globalSearch, setGlobalSearch, sidebarCollapsed, setSidebarCollapsed } = usePartnerStore();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const navigationItems: NavItem[] = [
    // 1. DASHBOARD
    {
      id: 'dashboard',
      title: 'DASHBOARD',
      icon: <LayoutDashboard className="w-5 h-5" />,
      children: [
        {
          id: 'partnership-overview',
          title: 'Partnership Overview',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/dashboard/partner',
        },
        {
          id: 'quick-links',
          title: 'Quick Links',
          icon: <Link2 className="w-4 h-4" />,
          path: '/dashboard/partner/quick-links',
        },
        {
          id: 'ai-highlights',
          title: 'AI Highlights',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/partner/ai-highlights',
        },
      ],
    },
    // 2. PARTNERSHIPS
    {
      id: 'partnerships',
      title: 'PARTNERSHIPS',
      icon: <Handshake className="w-5 h-5" />,
      children: [
        {
          id: 'sponsorships',
          title: 'Sponsorships',
          icon: <Handshake className="w-4 h-4" />,
          path: '/dashboard/partner/sponsorships',
        },
        {
          id: 'sponsored-children',
          title: 'Sponsored Children',
          icon: <Users className="w-4 h-4" />,
          children: [
            {
              id: 'children-overview',
              title: 'Overview',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/partner/children/overview',
            },
            {
              id: 'learning-journey',
              title: 'Learning Journey',
              icon: <BookOpen className="w-4 h-4" />,
              path: '/dashboard/partner/children/journey',
            },
            {
              id: 'activity',
              title: 'Activity',
              icon: <TrendingUp className="w-4 h-4" />,
              path: '/dashboard/partner/children/activity',
            },
            {
              id: 'achievements',
              title: 'Achievements',
              icon: <Award className="w-4 h-4" />,
              path: '/dashboard/partner/children/achievements',
            },
            {
              id: 'goals',
              title: 'Goals',
              icon: <Target className="w-4 h-4" />,
              path: '/dashboard/partner/children/goals',
            },
            {
              id: 'ai-insights',
              title: 'AI Insights',
              icon: <Bot className="w-4 h-4" />,
              path: '/dashboard/partner/children/ai-insights',
            },
          ],
        },
        {
          id: 'enrollments',
          title: 'Enrollments',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/partner/enrollments',
          badge: counters.pendingConsents || undefined,
        },
        {
          id: 'impact-reports',
          title: 'Impact Reports',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/partner/impact-reports',
        },
        {
          id: 'collaboration',
          title: 'Collaboration',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/partner/collaboration',
          badge: counters.unreadMessages || undefined,
        },
      ],
    },
    // 3. CONTENT
    {
      id: 'content',
      title: 'CONTENT',
      icon: <BookMarked className="w-5 h-5" />,
      children: [
        {
          id: 'sponsored-courses',
          title: 'Sponsored Courses',
          icon: <BookMarked className="w-4 h-4" />,
          path: '/dashboard/partner/courses',
        },
        {
          id: 'resource-contributions',
          title: 'Resource Contributions',
          icon: <Upload className="w-4 h-4" />,
          path: '/dashboard/partner/resources',
        },
        {
          id: 'ai-generated-resources',
          title: 'AI-Generated Resources',
          icon: <FolderPlus className="w-4 h-4" />,
          path: '/dashboard/partner/ai-resources',
        },
      ],
    },
    // 4. FINANCE
    {
      id: 'finance',
      title: 'FINANCE',
      icon: <DollarSign className="w-5 h-5" />,
      children: [
        {
          id: 'funding-subscriptions',
          title: 'Funding/Subscriptions',
          icon: <Wallet className="w-4 h-4" />,
          path: '/dashboard/partner/finance/funding',
          badge: counters.pendingPayments || undefined,
        },
        {
          id: 'budget-management',
          title: 'Budget Management',
          icon: <CreditCard className="w-4 h-4" />,
          path: '/dashboard/partner/finance/budget',
        },
        {
          id: 'grant-tracking',
          title: 'Grant Tracking',
          icon: <Award className="w-4 h-4" />,
          path: '/dashboard/partner/finance/grants',
        },
      ],
    },
    // 5. ANALYTICS
    {
      id: 'analytics',
      title: 'ANALYTICS',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        {
          id: 'roi-metrics',
          title: 'ROI Metrics',
          icon: <TrendingUpIcon className="w-4 h-4" />,
          path: '/dashboard/partner/analytics/roi',
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/partner/analytics/reports',
        },
        {
          id: 'student-ai-insights',
          title: 'Student AI Insights',
          icon: <Brain className="w-4 h-4" />,
          path: '/dashboard/partner/analytics/student-insights',
        },
      ],
    },
    // 6. SUPPORT
    {
      id: 'support',
      title: 'SUPPORT',
      icon: <Headset className="w-5 h-5" />,
      children: [
        {
          id: 'tickets',
          title: 'Tickets',
          icon: <LifeBuoy className="w-4 h-4" />,
          path: '/dashboard/partner/support/tickets',
          badge: counters.openTickets || undefined,
        },
        {
          id: 'resources',
          title: 'Resources',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/partner/support/resources',
        },
        {
          id: 'training-hub',
          title: 'Training Hub',
          icon: <GraduationCap className="w-4 h-4" />,
          children: [
            {
              id: 'webinars',
              title: 'On-demand Webinars',
              icon: <Video className="w-4 h-4" />,
              path: '/dashboard/partner/support/training/webinars',
            },
            {
              id: 'certification',
              title: 'Certification Program',
              icon: <Award className="w-4 h-4" />,
              path: '/dashboard/partner/support/training/certification',
            },
          ],
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
          path: '/dashboard/partner/notifications',
        },
        {
          id: 'profile',
          title: 'Profile',
          icon: <User className="w-4 h-4" />,
          path: '/dashboard/partner/profile',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: <Settings className="w-4 h-4" />,
          path: '/dashboard/partner/settings',
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
    if (path === '/dashboard/partner') {
      return location.pathname === '/dashboard/partner';
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
        {/* Search bar - hidden when collapsed */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-gray-200 dark:border-[#22272B]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search partner... (Ctrl+K)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30
                  transition-colors"
              />
            </div>
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

                  {/* Flyout panel - flattens nested children */}
                  {hoveredSection === section.id && section.children && (
                    <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-[#1A1D20] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">
                        {section.title}
                      </div>
                      {section.children.map((item) => (
                        <React.Fragment key={item.id}>
                          {item.children ? (
                            <>
                              <div className="px-3 py-1 text-[10px] font-semibold text-gray-300 dark:text-white/30 uppercase mt-1">
                                {item.title}
                              </div>
                              {item.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => { handleNavigation(child.path, child.onClick); setHoveredSection(null); }}
                                  disabled={child.disabled}
                                  className={`
                                    w-full flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors
                                    ${isActive(child.path) ? 'bg-[#E40000]/15 text-[#FF4444]' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                                    ${child.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  `}
                                >
                                  <span className="flex-shrink-0">{child.icon}</span>
                                  <span className="truncate">{child.title}</span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <button
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
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Expanded: full rendering with nested children support */
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
                        <div key={item.id}>
                          {item.children ? (
                            <div className="space-y-0.5">
                              <button
                                onClick={() => toggleSidebarSection(item.id)}
                                className={`
                                  w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg
                                  transition-all duration-200
                                  ${isSectionActive(item) ? 'bg-[#E40000]/15 text-[#FF4444]' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                                `}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex-shrink-0">{item.icon}</span>
                                  <span className="truncate">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {item.badge && item.badge > 0 && (
                                    <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#E40000]/20 text-[#FF4444] rounded-full min-w-[1.25rem] text-center">
                                      {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                  )}
                                  <ChevronDown
                                    className={`w-3 h-3 transition-transform duration-200 ${
                                      openSidebarSections.includes(item.id) ? 'rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </button>
                              {openSidebarSections.includes(item.id) && (
                                <div className="ml-3 space-y-0.5 border-l border-gray-200 dark:border-[#22272B] pl-3">
                                  {item.children.map((child) => (
                                    <button
                                      key={child.id}
                                      onClick={() => handleNavigation(child.path, child.onClick)}
                                      disabled={child.disabled}
                                      className={`
                                        w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                                        transition-all duration-200
                                        ${isActive(child.path) ? 'bg-[#E40000]/15 text-[#FF4444] border-l-2 border-[#E40000] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem+0.75rem-1px)]' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
                                        ${child.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                      `}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex-shrink-0 text-xs">{child.icon}</span>
                                        <span className="truncate text-xs">{child.title}</span>
                                      </div>
                                      {child.badge && child.badge > 0 && (
                                        <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-[#E40000]/20 text-[#FF4444] rounded-full min-w-[1.25rem] text-center">
                                          {child.badge > 99 ? '99+' : child.badge}
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
                                w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium rounded-lg
                                transition-all duration-200
                                ${isActive(item.path) ? 'bg-[#E40000]/15 text-[#FF4444] border-l-2 border-[#E40000] -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem+0.75rem-1px)]' : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}
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
                          )}
                        </div>
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
              <span>Partner Dashboard v1.0</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PartnerSidebar;
