/**
 * Parent Dashboard Sidebar
 *
 * Redesigned following AdminSidebar pattern with:
 * - Store-driven counters for badges
 * - Global child selector at top
 * - UPPERCASE section headers
 * - Collapsible sections
 * - Active route highlighting
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useParentStore } from '../../store/parentStore';
import { useAuthStore } from '../../store/authStore';
import {
  Home,
  Users,
  Target,
  BarChart3,
  Award,
  Goal,
  Brain,
  MessageCircle,
  Bell,
  HelpCircle,
  DollarSign,
  FileText,
  Settings,
  Shield,
  UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Heart,
  Book,
  MessageSquare,
  CreditCard,
  BarChart,
  ShieldAlert,
  Key,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import ChildSelector from './ChildSelector';

interface ParentSidebarProps {
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

const ParentSidebar: React.FC<ParentSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { counters, openSidebarSections, toggleSidebarSection, sidebarCollapsed, setSidebarCollapsed } = useParentStore();
  const { logout } = useAuthStore();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const navigationItems: NavItem[] = [
    // 1. DASHBOARD (HOME)
    {
      id: 'dashboard',
      title: 'DASHBOARD',
      icon: <Home className="w-5 h-5" />,
      children: [
        {
          id: 'family-overview',
          title: 'Today / Family Overview',
          icon: <Home className="w-4 h-4" />,
          path: '/dashboard/parent',
        },
        {
          id: 'highlights',
          title: "Today's Highlights",
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/parent/highlights',
        },
        {
          id: 'urgent-items',
          title: 'Urgent Items',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/parent/urgent',
          badge: counters.upcomingDeadlines,
        },
        {
          id: 'family-mood',
          title: 'Family Mood Snapshot',
          icon: <Heart className="w-4 h-4" />,
          path: '/dashboard/parent/mood',
        },
      ],
    },

    // 2. MY CHILDREN
    {
      id: 'children',
      title: 'MY CHILDREN',
      icon: <Users className="w-5 h-5" />,
      children: [
        {
          id: 'children-overview',
          title: 'Overview Cards',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/parent/children',
        },
        {
          id: 'learning-journey',
          title: 'Learning Journey',
          icon: <Book className="w-4 h-4" />,
          path: '/dashboard/parent/learning-journey',
        },
        {
          id: 'cbc-competencies',
          title: 'CBC Competency Snapshot',
          icon: <Target className="w-4 h-4" />,
          path: '/dashboard/parent/cbc-competencies',
        },
        {
          id: 'daily-activity',
          title: 'Daily & Weekly Activity',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/dashboard/parent/activity',
        },
        {
          id: 'achievements',
          title: 'Achievements & Milestones',
          icon: <Award className="w-4 h-4" />,
          path: '/dashboard/parent/achievements',
          badge: counters.newAchievements,
        },
        {
          id: 'goals',
          title: 'Goals & Expectations',
          icon: <Goal className="w-4 h-4" />,
          path: '/dashboard/parent/goals',
        },
      ],
    },

    // 3. AI COMPANION INSIGHTS
    {
      id: 'ai-companion',
      title: 'AI COMPANION INSIGHTS',
      icon: <Brain className="w-5 h-5" />,
      children: [
        {
          id: 'ai-summary',
          title: "My Child's AI Tutor",
          icon: <Brain className="w-4 h-4" />,
          path: '/dashboard/parent/ai/summary',
        },
        {
          id: 'learning-style',
          title: 'Learning Style',
          icon: <Target className="w-4 h-4" />,
          path: '/dashboard/parent/ai/learning-style',
        },
        {
          id: 'support-tips',
          title: 'How to Support at Home',
          icon: <Heart className="w-4 h-4" />,
          path: '/dashboard/parent/ai/support-tips',
        },
        {
          id: 'ai-planning',
          title: 'Topics AI is Planning',
          icon: <Book className="w-4 h-4" />,
          path: '/dashboard/parent/ai/planning',
        },
        {
          id: 'curiosity-patterns',
          title: 'Curiosity Patterns',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/parent/ai/patterns',
        },
        {
          id: 'early-warnings',
          title: 'Early Warning Signs',
          icon: <ShieldAlert className="w-4 h-4" />,
          path: '/dashboard/parent/ai/warnings',
          badge: counters.unreadAlerts,
        },
      ],
    },

    // 4. COMMUNICATIONS
    {
      id: 'communications',
      title: 'COMMUNICATIONS',
      icon: <MessageCircle className="w-5 h-5" />,
      children: [
        {
          id: 'notifications',
          title: 'Notifications & Alerts',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/parent/communications/inbox',
          badge: counters.unreadAlerts,
        },
        {
          id: 'messages',
          title: 'Messages',
          icon: <MessageSquare className="w-4 h-4" />,
          path: '/dashboard/parent/messages',
          badge: counters.unreadMessages,
        },
        {
          id: 'support',
          title: 'Support & Questions',
          icon: <HelpCircle className="w-4 h-4" />,
          path: '/dashboard/parent/support',
        },
      ],
    },

    // 5. FINANCE & PLANS
    {
      id: 'finance',
      title: 'FINANCE & PLANS',
      icon: <DollarSign className="w-5 h-5" />,
      children: [
        {
          id: 'subscription',
          title: 'Current Plan',
          icon: <CreditCard className="w-4 h-4" />,
          path: '/dashboard/parent/finance/subscription',
        },
        {
          id: 'payment-history',
          title: 'Payment History',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/parent/finance/history',
        },
        {
          id: 'manage-subscription',
          title: 'Manage Subscription',
          icon: <Settings className="w-4 h-4" />,
          path: '/dashboard/parent/finance/manage',
        },
        {
          id: 'addons',
          title: 'Add-ons & Extras',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/parent/finance/addons',
        },
      ],
    },

    // 6. REPORTS & DOCUMENTS
    {
      id: 'reports',
      title: 'REPORTS & DOCUMENTS',
      icon: <FileText className="w-5 h-5" />,
      children: [
        {
          id: 'reports-list',
          title: 'Weekly / Monthly Reports',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/parent/reports',
          badge: counters.newReports,
        },
        {
          id: 'term-summary',
          title: 'Term Progress Summary',
          icon: <BarChart className="w-4 h-4" />,
          path: '/dashboard/parent/reports/term-summary',
        },
        {
          id: 'transcripts',
          title: 'Official Transcripts',
          icon: <Award className="w-4 h-4" />,
          path: '/dashboard/parent/reports/transcripts',
        },
        {
          id: 'portfolio-export',
          title: 'Export Portfolio',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/parent/reports/portfolio',
        },
      ],
    },

    // 7. SETTINGS & CONTROLS
    {
      id: 'settings',
      title: 'SETTINGS & CONTROLS',
      icon: <Settings className="w-5 h-5" />,
      children: [
        {
          id: 'notifications-prefs',
          title: 'Notification Preferences',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/parent/settings/notifications',
        },
        {
          id: 'consent',
          title: 'Consent & Permissions',
          icon: <Shield className="w-4 h-4" />,
          path: '/dashboard/parent/settings/consent',
          badge: counters.pendingConsents,
        },
        {
          id: 'privacy',
          title: 'Privacy & Data',
          icon: <ShieldAlert className="w-4 h-4" />,
          path: '/dashboard/parent/settings/privacy',
        },
        {
          id: 'family-members',
          title: 'Family Members',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/parent/settings/family',
        },
        {
          id: 'profile',
          title: 'Profile & Preferences',
          icon: <UserIcon className="w-4 h-4" />,
          path: '/dashboard/parent/settings/profile',
        },
        {
          id: 'security',
          title: 'Security',
          icon: <Key className="w-4 h-4" />,
          path: '/dashboard/parent/settings/security',
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: <LogOut className="w-4 h-4" />,
          onClick: () => {
            logout();
            useAuthStore.persist.clearStorage();
            window.location.href = '/';
          },
        },
      ],
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard/parent') return location.pathname === '/dashboard/parent';
    return location.pathname.startsWith(path);
  };

  const isSectionOpen = (sectionId: string) => {
    return openSidebarSections.includes(sectionId);
  };

  const handleNavigate = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const isSectionActive = (item: NavItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) return item.children.some(isSectionActive);
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] border-r border-gray-200 dark:border-[#22272B] z-50 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarCollapsed ? 'w-72 lg:w-16' : 'w-72'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0`}
      >
        {/* Header - hidden when collapsed, show Users icon instead */}
        {sidebarCollapsed ? (
          <div className="hidden lg:flex items-center justify-center p-3 border-b border-gray-200 dark:border-[#22272B]">
            <Users className="w-5 h-5 text-gray-400 dark:text-white/50" />
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Parent Dashboard
            </h2>
            <ChildSelector />
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
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-1.5' : 'p-4'} space-y-1 overflow-y-auto`}>
          {navigationItems.map((section) => (
            <div key={section.id} className={sidebarCollapsed ? '' : 'mb-2'}>
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
                          onClick={() => { handleNavigate(item); setHoveredSection(null); }}
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
                  <button
                    onClick={() => toggleSidebarSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isSectionOpen(section.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSectionOpen(section.id) && section.children && (
                    <div className="mt-1 space-y-0.5">
                      {section.children.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item)}
                          disabled={item.disabled}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all ${
                            isActive(item.path)
                              ? 'bg-[#E40000]/10 text-[#E40000] border-l-2 border-[#E40000]'
                              : 'text-gray-600 dark:text-white/80 hover:bg-gray-100 dark:bg-[#22272B] hover:text-gray-900 dark:hover:text-white'
                          } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-[#E40000] text-gray-900 dark:text-white rounded-full">
                              {item.badge}
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#22272B] mt-auto">
          {!sidebarCollapsed && (
            <div className="text-xs text-gray-400 dark:text-white/40 text-center">
              Parent Dashboard v1.0.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
