import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../../store';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import {
  LayoutDashboard,
  Activity,
  Users,
  ShieldCheck,
  UserX,
  BookOpen,
  ClipboardCheck,
  Award,
  FolderOpen,
  Brain,
  Sparkles,
  Sliders,
  Gauge,
  GraduationCap,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  Wallet,
  CreditCard,
  Handshake,
  FileText,
  Headset,
  Scale,
  Settings,
  ScrollText,
  Bell,
  User,
  Palette,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react';

interface AdminSidebarProps {
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useThemeStore();
  const { counters, openSidebarSections, toggleSidebarSection, globalSearch, setGlobalSearch } = useAdminStore();

  const navigationItems: NavItem[] = [
    // 1. TODAY / AT A GLANCE
    {
      id: 'today',
      title: 'TODAY',
      icon: <LayoutDashboard className="w-5 h-5" />,
      children: [
        {
          id: 'at-a-glance',
          title: 'At a Glance',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: '/dashboard/admin',
        },
      ],
    },
    // 2. PLATFORM PULSE
    {
      id: 'platform-pulse',
      title: 'PLATFORM PULSE',
      icon: <Activity className="w-5 h-5" />,
      children: [
        {
          id: 'realtime-overview',
          title: 'Real-time Overview',
          icon: <Activity className="w-4 h-4" />,
          path: '/dashboard/admin/pulse',
        },
      ],
    },
    // 3. PEOPLE & ACCESS
    {
      id: 'people-access',
      title: 'PEOPLE & ACCESS',
      icon: <Users className="w-5 h-5" />,
      children: [
        {
          id: 'users',
          title: 'Users',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/admin/users',
        },
        {
          id: 'roles-permissions',
          title: 'Roles & Permissions',
          icon: <ShieldCheck className="w-4 h-4" />,
          path: '/dashboard/admin/roles-permissions',
        },
        {
          id: 'families-enrollments',
          title: 'Families & Enrollments',
          icon: <Users className="w-4 h-4" />,
          path: '/dashboard/admin/families',
          badge: counters.pendingEnrollments || undefined,
        },
        {
          id: 'bans-restrictions',
          title: 'Bans & Restrictions',
          icon: <UserX className="w-4 h-4" />,
          path: '/dashboard/admin/restrictions',
        },
      ],
    },
    // 4. CONTENT & LEARNING INTEGRITY
    {
      id: 'content-learning',
      title: 'CONTENT & LEARNING',
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        {
          id: 'courses-curriculum',
          title: 'Courses & Curriculum',
          icon: <BookOpen className="w-4 h-4" />,
          path: '/dashboard/admin/courses',
          badge: counters.pendingApprovals || undefined,
        },
        {
          id: 'cbc-alignment',
          title: 'CBC Alignment',
          icon: <GraduationCap className="w-4 h-4" />,
          path: '/dashboard/admin/cbc-alignment',
        },
        {
          id: 'assessments-grading',
          title: 'Assessments & Grading',
          icon: <ClipboardCheck className="w-4 h-4" />,
          path: '/dashboard/admin/assessments',
        },
        {
          id: 'certificates',
          title: 'Certificates & Credentials',
          icon: <Award className="w-4 h-4" />,
          path: '/dashboard/admin/certificates',
        },
        {
          id: 'resource-library',
          title: 'Resource Library',
          icon: <FolderOpen className="w-4 h-4" />,
          path: '/dashboard/admin/resources',
        },
      ],
    },
    // 5. AI SYSTEMS
    {
      id: 'ai-systems',
      title: 'AI SYSTEMS',
      icon: <Brain className="w-5 h-5" />,
      children: [
        {
          id: 'ai-monitoring',
          title: 'AI Tutor Monitoring',
          icon: <Brain className="w-4 h-4" />,
          path: '/dashboard/admin/ai-monitoring',
        },
        {
          id: 'ai-content',
          title: 'AI Content Generation',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/dashboard/admin/ai-content',
        },
        {
          id: 'ai-personalization',
          title: 'Personalization & Adaptation',
          icon: <Sliders className="w-4 h-4" />,
          path: '/dashboard/admin/ai-personalization',
        },
        {
          id: 'ai-performance',
          title: 'AI Performance',
          icon: <Gauge className="w-4 h-4" />,
          path: '/dashboard/admin/ai-performance',
        },
        {
          id: 'ai-providers',
          title: 'AI Providers',
          icon: <Settings className="w-4 h-4" />,
          path: '/dashboard/admin/ai-providers',
        },
      ],
    },
    // 6. ANALYTICS & INTELLIGENCE
    {
      id: 'analytics',
      title: 'ANALYTICS & INTELLIGENCE',
      icon: <TrendingUp className="w-5 h-5" />,
      children: [
        {
          id: 'learning-impact',
          title: 'Learning Impact',
          icon: <GraduationCap className="w-4 h-4" />,
          path: '/dashboard/admin/analytics/learning',
        },
        {
          id: 'business-growth',
          title: 'Business & Growth',
          icon: <TrendingUp className="w-4 h-4" />,
          path: '/dashboard/admin/analytics/business',
        },
        {
          id: 'compliance-risk',
          title: 'Compliance & Risk',
          icon: <ShieldAlert className="w-4 h-4" />,
          path: '/dashboard/admin/analytics/compliance',
        },
        {
          id: 'custom-insights',
          title: 'Custom Insights',
          icon: <Lightbulb className="w-4 h-4" />,
          path: '/dashboard/admin/analytics/custom',
        },
      ],
    },
    // 7. FINANCE & PARTNERSHIPS
    {
      id: 'finance',
      title: 'FINANCE & PARTNERSHIPS',
      icon: <Wallet className="w-5 h-5" />,
      children: [
        {
          id: 'money-flow',
          title: 'Money Flow',
          icon: <Wallet className="w-4 h-4" />,
          path: '/dashboard/admin/finance/transactions',
        },
        {
          id: 'plans-billing',
          title: 'Plans & Billing',
          icon: <CreditCard className="w-4 h-4" />,
          path: '/dashboard/admin/finance/plans',
        },
        {
          id: 'partner-dashboard',
          title: 'Partner Dashboard',
          icon: <Handshake className="w-4 h-4" />,
          path: '/dashboard/admin/partners',
        },
        {
          id: 'invoices',
          title: 'Invoices & Documents',
          icon: <FileText className="w-4 h-4" />,
          path: '/dashboard/admin/invoices',
        },
      ],
    },
    // 8. OPERATIONS & CONTROL
    {
      id: 'operations',
      title: 'OPERATIONS & CONTROL',
      icon: <Settings className="w-5 h-5" />,
      children: [
        {
          id: 'support-oversight',
          title: 'Support Oversight',
          icon: <Headset className="w-4 h-4" />,
          path: '/dashboard/admin/tickets',
          badge: counters.openTickets || undefined,
        },
        {
          id: 'moderation-center',
          title: 'Moderation Center',
          icon: <Scale className="w-4 h-4" />,
          path: '/dashboard/admin/moderation',
          badge: counters.moderationQueue || undefined,
        },
        {
          id: 'system-config',
          title: 'System Configuration',
          icon: <Settings className="w-4 h-4" />,
          path: '/dashboard/admin/config',
        },
        {
          id: 'logs-audit',
          title: 'Logs & Audit',
          icon: <ScrollText className="w-4 h-4" />,
          path: '/dashboard/admin/audit-logs',
        },
      ],
    },
    // 9. ADMIN ACCOUNT
    {
      id: 'admin-account',
      title: 'ADMIN ACCOUNT',
      icon: <User className="w-5 h-5" />,
      children: [
        {
          id: 'admin-notifications',
          title: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
          path: '/dashboard/admin/notifications',
        },
        {
          id: 'admin-profile',
          title: 'My Profile & Security',
          icon: <User className="w-4 h-4" />,
          path: '/dashboard/admin/profile',
        },
        {
          id: 'admin-preferences',
          title: 'Preferences',
          icon: <Palette className="w-4 h-4" />,
          path: '/dashboard/admin/preferences',
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
    if (path === '/dashboard/admin') {
      return location.pathname === '/dashboard/admin';
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
    if (window.innerWidth < 1024) {
      onClose();
    }
    navigate('/');
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
          fixed lg:sticky lg:static top-0 left-0 z-40 w-72 h-screen transform transition-transform duration-300 ease-in-out
          bg-gradient-to-b from-[#0F1112] to-[#181C1F] border-r border-[#22272B]
          shadow-xl lg:shadow-none flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Search bar */}
        <div className="p-3 border-b border-[#22272B]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search admin... (Ctrl+K)"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg
                text-white placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30
                transition-colors"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          {navigationItems.map((section) => (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header */}
              <button
                onClick={() => toggleSidebarSection(section.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg
                  transition-colors duration-200 group
                  ${isSectionActive(section) ? 'text-[#E40000]' : 'text-white/50 hover:text-white/70'}
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
                <div className="ml-3 space-y-0.5 border-l border-[#22272B] pl-3">
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
                            : 'text-white/70 hover:text-white hover:bg-white/5'
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
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#22272B] bg-gradient-to-t from-[#0F1112] to-transparent">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Admin Dashboard v1.0</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-yellow-400'}`} />
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
