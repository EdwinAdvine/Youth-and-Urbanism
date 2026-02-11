import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store';
import { 
  Home, 
  Handshake, 
  Book, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Bell, 
  User,
  ChevronDown,
  ChevronRight,
  Upload,
  Users,
  FileText,
  Video,
  Bot,
  Calendar,
  MessageCircle,
  CreditCard,
  Shield,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  FilePlus,
  FolderPlus,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Download,
  Share2,
  TrendingUp,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Key,
  ShieldCheck,
  Filter,
  Clock
} from 'lucide-react';

interface PartnerSidebarProps {
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

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useThemeStore();
  
  const [openSections, setOpenSections] = useState<string[]>(['dashboard', 'partnerships', 'content', 'finance', 'analytics', 'support', 'account']);
  
  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      children: [
        {
          id: 'partnership-stats',
          title: 'Partnership Stats',
          icon: <BarChart3 className="w-4 h-4" />,
          children: [
            {
              id: 'real-time-metrics',
              title: 'Real-time Impact Metrics',
              icon: <Eye className="w-3 h-3" />,
              path: '/dashboard/partner/stats/real-time'
            },
            {
              id: 'ai-forecasts',
              title: 'AI-powered Enrollment Forecasts',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/stats/forecasts'
            },
            {
              id: 'quick-reports',
              title: 'Quick Links to Key Reports',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/stats/reports'
            }
          ]
        }
      ]
    },
    {
      id: 'partnerships',
      title: 'PARTNERSHIPS',
      icon: <Handshake className="w-5 h-5" />,
      children: [
        {
          id: 'enrollments',
          title: 'Enrollments',
          icon: <Users className="w-4 h-4" />,
          children: [
            {
              id: 'bulk-upload',
              title: 'Bulk Upload via CSV/Excel',
              icon: <Upload className="w-3 h-3" />,
              path: '/dashboard/partner/enrollments/upload'
            },
            {
              id: 'ai-tracking',
              title: 'AI-assisted Cohort Tracking',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/enrollments/tracking'
            },
            {
              id: 'automated-consent',
              title: 'Automated Consent Batch Processing with e-signatures',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/enrollments/consent'
            }
          ]
        },
        {
          id: 'impact-reports',
          title: 'Impact Reports',
          icon: <FileText className="w-4 h-4" />,
          children: [
            {
              id: 'ai-summarized',
              title: 'AI-summarized Student Outcomes',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/reports/outcomes'
            },
            {
              id: 'cbc-progress',
              title: 'CBC Progress by Group/Individual',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/reports/cbc'
            },
            {
              id: 'export-reports',
              title: 'Export PDFs/CSV',
              icon: <Download className="w-3 h-3" />,
              path: '/dashboard/partner/reports/export'
            },
            {
              id: 'visual-dashboards',
              title: 'Visual Dashboards with Charts',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/reports/dashboards'
            }
          ]
        },
        {
          id: 'collaboration-tools',
          title: 'Collaboration Tools',
          icon: <MessageCircle className="w-4 h-4" />,
          children: [
            {
              id: 'shared-dashboards',
              title: 'Shared Real-time Dashboards',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/collaboration/dashboards'
            },
            {
              id: 'ai-scheduler',
              title: 'AI-suggested Meeting Scheduler',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/collaboration/scheduler'
            },
            {
              id: 'chat-integration',
              title: 'Chat Integration for Partner-School Communication',
              icon: <MessageCircle className="w-3 h-3" />,
              path: '/dashboard/partner/collaboration/chat'
            }
          ]
        },
        {
          id: 'ai-customization',
          title: 'AI Customization',
          icon: <Bot className="w-4 h-4" />,
          children: [
            {
              id: 'tailor-tutors',
              title: 'Tailor AI Tutors for Cohorts',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/ai/tutors'
            },
            {
              id: 'learning-paths',
              title: 'Set Learning Paths Based on Partner Goals',
              icon: <Target className="w-3 h-3" />,
              path: '/dashboard/partner/ai/paths'
            },
            {
              id: 'ai-engagement',
              title: 'Monitor AI Engagement per Child',
              icon: <Eye className="w-3 h-3" />,
              path: '/dashboard/partner/ai/engagement'
            }
          ]
        }
      ]
    },
    {
      id: 'content',
      title: 'CONTENT',
      icon: <Book className="w-5 h-5" />,
      children: [
        {
          id: 'sponsored-courses',
          title: 'Sponsored Courses',
          icon: <GraduationCap className="w-4 h-4" />,
          children: [
            {
              id: 'create-customize',
              title: 'Create/Customize with AI Content Generators',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/content/courses/create'
            },
            {
              id: 'monitor-analytics',
              title: 'Monitor Usage Analytics',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/content/courses/analytics'
            },
            {
              id: 'feedback-collection',
              title: 'Automated Feedback Collection and Sentiment Analysis',
              icon: <MessageCircle className="w-3 h-3" />,
              path: '/dashboard/partner/content/courses/feedback'
            }
          ]
        },
        {
          id: 'resource-contributions',
          title: 'Resource Contributions',
          icon: <FolderPlus className="w-4 h-4" />,
          children: [
            {
              id: 'upload-materials',
              title: 'Upload Branded Materials/Videos',
              icon: <Upload className="w-3 h-3" />,
              path: '/dashboard/partner/content/resources/upload'
            },
            {
              id: 'ai-moderated',
              title: 'AI-moderated Approval Status',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/content/resources/moderation'
            },
            {
              id: 'branding-integration',
              title: 'Integration with Partner Branding Tools',
              icon: <Globe className="w-3 h-3" />,
              path: '/dashboard/partner/content/resources/branding'
            }
          ]
        },
        {
          id: 'ai-generated-resources',
          title: 'AI-Generated Resources',
          icon: <Bot className="w-4 h-4" />,
          children: [
            {
              id: 'generate-lessons',
              title: 'Generate Custom Lessons Using School AI',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/content/ai/lessons'
            },
            {
              id: 'adaptive-content',
              title: 'Collaborate on Adaptive Content',
              icon: <Users className="w-3 h-3" />,
              path: '/dashboard/partner/content/ai/adaptive'
            },
            {
              id: 'adoption-rates',
              title: 'Track Adoption Rates',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/content/ai/adoption'
            }
          ]
        }
      ]
    },
    {
      id: 'finance',
      title: 'FINANCE',
      icon: <DollarSign className="w-5 h-5" />,
      children: [
        {
          id: 'funding-donations',
          title: 'Funding/Donations',
          icon: <CreditCard className="w-4 h-4" />,
          children: [
            {
              id: 'secure-processing',
              title: 'Secure Payment Processing via Stripe/PayPal',
              icon: <ShieldCheck className="w-3 h-3" />,
              path: '/dashboard/partner/finance/payments'
            },
            {
              id: 'track-allocations',
              title: 'Track Allocations with AI Forecasts',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/finance/allocations'
            },
            {
              id: 'auto-receipts',
              title: 'Auto-generate Receipts and Tax Documents',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/finance/receipts'
            }
          ]
        },
        {
          id: 'budget-management',
          title: 'Budget Management',
          icon: <BarChart3 className="w-4 h-4" />,
          children: [
            {
              id: 'real-time-spending',
              title: 'View Real-time Spending',
              icon: <Eye className="w-3 h-3" />,
              path: '/dashboard/partner/finance/budget/spending'
            },
            {
              id: 'ai-roi',
              title: 'AI-driven ROI Forecasting',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/finance/budget/roi'
            },
            {
              id: 'budget-alerts',
              title: 'Set Alerts for Budget Thresholds',
              icon: <AlertCircle className="w-3 h-3" />,
              path: '/dashboard/partner/finance/budget/alerts'
            }
          ]
        },
        {
          id: 'grant-tracking',
          title: 'Grant Tracking',
          icon: <Award className="w-4 h-4" />,
          children: [
            {
              id: 'monitor-applications',
              title: 'Monitor Grant Applications',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/finance/grants/applications'
            },
            {
              id: 'ai-proposals',
              title: 'AI-assisted Proposal Generation',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/finance/grants/proposals'
            },
            {
              id: 'compliance-reporting',
              title: 'Compliance Reporting',
              icon: <Shield className="w-3 h-3" />,
              path: '/dashboard/partner/finance/grants/compliance'
            }
          ]
        }
      ]
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        {
          id: 'roi-metrics',
          title: 'ROI Metrics',
          icon: <TrendingUp className="w-4 h-4" />,
          children: [
            {
              id: 'interactive-charts',
              title: 'Interactive Cost-benefit Charts',
              icon: <BarChart3 className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/roi/charts'
            },
            {
              id: 'user-growth',
              title: 'User Growth by Partnership/Type',
              icon: <Users className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/roi/growth'
            },
            {
              id: 'ai-predictive',
              title: 'AI Predictive Modeling for Future Impact',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/roi/predictive'
            }
          ]
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          icon: <FileText className="w-4 h-4" />,
          children: [
            {
              id: 'filter-demographics',
              title: 'Filter by Region/Demographics/Time',
              icon: <Filter className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/reports/filter'
            },
            {
              id: 'ai-insights',
              title: 'AI-insights on Learning Gaps',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/reports/insights'
            },
            {
              id: 'export-bi',
              title: 'Export to BI Tools like Tableau',
              icon: <Download className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/reports/export'
            }
          ]
        },
        {
          id: 'student-ai-insights',
          title: 'Student AI Insights',
          icon: <Bot className="w-4 h-4" />,
          children: [
            {
              id: 'per-child-dashboards',
              title: 'Per-child AI Performance Dashboards',
              icon: <Eye className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/students/per-child'
            },
            {
              id: 'cohort-benchmarking',
              title: 'Cohort Benchmarking',
              icon: <Users className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/students/benchmarking'
            },
            {
              id: 'privacy-data',
              title: 'Privacy-compliant Data Sharing',
              icon: <Shield className="w-3 h-3" />,
              path: '/dashboard/partner/analytics/students/privacy'
            }
          ]
        }
      ]
    },
    {
      id: 'support',
      title: 'SUPPORT',
      icon: <Settings className="w-5 h-5" />,
      children: [
        {
          id: 'tickets',
          title: 'Tickets',
          icon: <FileText className="w-4 h-4" />,
          children: [
            {
              id: 'submit-issues',
              title: 'Submit Issues with AI Triage for Faster Resolution',
              icon: <Bot className="w-3 h-3" />,
              path: '/dashboard/partner/support/tickets/submit'
            },
            {
              id: 'real-time-updates',
              title: 'View Real-time Updates and Resolution Timelines',
              icon: <Clock className="w-3 h-3" />,
              path: '/dashboard/partner/support/tickets/status'
            }
          ]
        },
        {
          id: 'resources',
          title: 'Resources',
          icon: <HelpCircle className="w-4 h-4" />,
          children: [
            {
              id: 'api-docs',
              title: 'API Docs for Integrations',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/support/resources/api'
            },
            {
              id: 'ai-guides',
              title: 'Step-by-step Guides for AI Features',
              icon: <GraduationCap className="w-3 h-3" />,
              path: '/dashboard/partner/support/resources/ai-guides'
            },
            {
              id: 'community-forums',
              title: 'Partner Community Forums',
              icon: <Users className="w-3 h-3" />,
              path: '/dashboard/partner/support/resources/forums'
            }
          ]
        },
        {
          id: 'training-hub',
          title: 'Training Hub',
          icon: <GraduationCap className="w-4 h-4" />,
          children: [
            {
              id: 'on-demand-webinars',
              title: 'On-demand Webinars on AI Usage',
              icon: <Video className="w-3 h-3" />,
              path: '/dashboard/partner/support/training/webinars'
            },
            {
              id: 'certification',
              title: 'Certification for Partners on Urban Home School Tools',
              icon: <Award className="w-3 h-3" />,
              path: '/dashboard/partner/support/training/certification'
            }
          ]
        }
      ]
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      icon: <User className="w-5 h-5" />,
      children: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
          children: [
            {
              id: 'customizable-alerts',
              title: 'Customizable Alerts for Enrollments/Reports/AI Milestones',
              icon: <Bell className="w-3 h-3" />,
              path: '/dashboard/partner/account/notifications/settings'
            },
            {
              id: 'push-email-sms',
              title: 'Push/Email/SMS Options',
              icon: <Mail className="w-3 h-3" />,
              path: '/dashboard/partner/account/notifications/channels'
            }
          ]
        },
        {
          id: 'profile',
          title: 'Profile',
          icon: <User className="w-4 h-4" />,
          children: [
            {
              id: 'organization-details',
              title: 'Edit Organization Details',
              icon: <FileText className="w-3 h-3" />,
              path: '/dashboard/partner/account/profile/organization'
            },
            {
              id: 'manage-contacts',
              title: 'Manage Contacts/Teams',
              icon: <Users className="w-3 h-3" />,
              path: '/dashboard/partner/account/profile/contacts'
            },
            {
              id: 'upload-logo',
              title: 'Upload Logo for Branding',
              icon: <Upload className="w-3 h-3" />,
              path: '/dashboard/partner/account/profile/logo'
            }
          ]
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: <Settings className="w-4 h-4" />,
          children: [
            {
              id: 'role-based-access',
              title: 'Role-based Access Controls',
              icon: <Shield className="w-3 h-3" />,
              path: '/dashboard/partner/account/settings/access'
            },
            {
              id: 'notification-rules',
              title: 'Notification Rules',
              icon: <Bell className="w-3 h-3" />,
              path: '/dashboard/partner/account/settings/notifications'
            },
            {
              id: 'theme-toggles',
              title: 'Theme Toggles (light/dark)',
              icon: <Eye className="w-3 h-3" />,
              path: '/dashboard/partner/account/settings/theme'
            },
            {
              id: 'two-factor',
              title: 'Two-factor Authentication',
              icon: <ShieldCheck className="w-3 h-3" />,
              path: '/dashboard/partner/account/settings/security'
            }
          ]
        },
        {
          id: 'logout',
          title: 'Logout',
          icon: <LogOut className="w-4 h-4" />,
          path: '/logout'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
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
        // Handle logout
        localStorage.removeItem('user');
        navigate('/');
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
        bg-gradient-to-b from-[#0F1112] to-[#181C1F] border-r border-[#22272B]
        shadow-xl lg:shadow-none lg:border-r-0 lg:rounded-r-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Navigation */}
        <nav className="p-4 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {navigationItems.map((section) => (
            <div key={section.id} className="space-y-1">
              {section.title !== 'MAIN' && (
                <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              
              {section.children?.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleSection(item.id)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
                          transition-colors duration-200
                          ${isActive(item.children?.[0]?.path) ? 'bg-[#FF0000]/20 text-[#FF0000]' : 'text-white/80 hover:text-white hover:bg-white/5'}
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
                              openSections.includes(item.id) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </button>
                      
                      {openSections.includes(item.id) && (
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#2A3035] pl-4">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigation(child.path, child.onClick)}
                              disabled={child.disabled}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
                                transition-colors duration-200
                                ${isActive(child.path) 
                                  ? 'bg-[#FF0000]/20 text-[#FF0000] border-l-2 border-[#FF0000]' 
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
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
                          ? 'bg-[#FF0000]/20 text-[#FF0000] border-l-2 border-[#FF0000]' 
                          : 'text-white/80 hover:text-white hover:bg-white/5'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#22272B] bg-gradient-to-t from-[#0F1112] to-transparent">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Partner Dashboard v1.0</span>
            <div className="flex items-center gap-2">
              <span>{isDarkMode ? 'Dark' : 'Light'} Mode</span>
              <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-yellow-400'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerSidebar;