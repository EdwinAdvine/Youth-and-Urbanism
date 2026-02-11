import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store';
import { 
  Home, 
  Users, 
  BarChart3, 
  Calendar, 
  Award, 
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
  MessageSquare,
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
  Book,
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
  Download as DownloadIcon,
  Share2 as Share2Icon,
  Trash2,
  User as UserIcon,
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
  ShieldCheck
} from 'lucide-react';

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
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const ParentSidebar: React.FC<ParentSidebarProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useThemeStore();
  
  const [openSections, setOpenSections] = useState<string[]>(['my-children', 'learning-journey', 'ai-companion', 'communications', 'finance']);
  
  const navigationItems: NavItem[] = [
    {
      id: 'today-family',
      title: 'Today / Family Overview',
      icon: null,
      children: [
        {
          id: 'family-dashboard',
          title: 'Today\'s Dashboard',
          icon: <Home className="w-5 h-5" />,
          children: [
            {
              id: 'quick-status',
              title: 'Quick Status of All Children',
              icon: <Users className="w-4 h-4" />,
              path: '/dashboard/parent/today/status'
            },
            {
              id: 'highlights',
              title: 'Today\'s Highlights & AI Insights',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/parent/today/highlights'
            },
            {
              id: 'urgent',
              title: 'Urgent Items',
              icon: <Bell className="w-4 h-4" />,
              path: '/dashboard/parent/today/urgent'
            },
            {
              id: 'family-mood',
              title: 'Family Mood / Energy Snapshot',
              icon: <Heart className="w-4 h-4" />,
              path: '/dashboard/parent/today/mood'
            }
          ]
        }
      ]
    },
    {
      id: 'my-children',
      title: 'My Children',
      icon: null,
      children: [
        {
          id: 'overview-cards',
          title: 'Overview Cards',
          icon: <Users className="w-5 h-5" />,
          children: [
            {
              id: 'child1',
              title: 'Alex Johnson (Grade 4)',
              icon: <UserIcon className="w-4 h-4" />,
              path: '/dashboard/parent/children/alex'
            },
            {
              id: 'child2',
              title: 'Sarah Johnson (Grade 2)',
              icon: <UserIcon className="w-4 h-4" />,
              path: '/dashboard/parent/children/sarah'
            },
            {
              id: 'switch-children',
              title: 'Switch Quickly Between Children',
              icon: <Users className="w-4 h-4" />,
              path: '/dashboard/parent/children/switch'
            }
          ]
        }
      ]
    },
    {
      id: 'learning-journey',
      title: 'Learning Journey',
      icon: null,
      children: [
        {
          id: 'current-focus',
          title: 'Current Focus Areas',
          icon: <Target className="w-5 h-5" />,
          children: [
            {
              id: 'ai-topics',
              title: 'AI-selected Topics',
              icon: <Brain className="w-4 h-4" />,
              path: '/dashboard/parent/learning/focus-topics'
            },
            {
              id: 'weekly-story',
              title: 'Weekly Story & Progress Narrative',
              icon: <Book className="w-4 h-4" />,
              path: '/dashboard/parent/learning/weekly-story'
            },
            {
              id: 'cbc-competency',
              title: 'CBC Competency Snapshot',
              icon: <Map className="w-4 h-4" />,
              path: '/dashboard/parent/learning/competency'
            },
            {
              id: 'strengths-growing',
              title: 'Strengths & Growing Edges',
              icon: <Zap className="w-4 h-4" />,
              path: '/dashboard/parent/learning/strengths'
            }
          ]
        }
      ]
    },
    {
      id: 'daily-weekly',
      title: 'Daily & Weekly Activity',
      icon: null,
      children: [
        {
          id: 'activity-tracking',
          title: 'Activity Tracking',
          icon: <BarChart3 className="w-5 h-5" />,
          children: [
            {
              id: 'time-spent',
              title: 'Time Spent • Sessions • Streaks',
              icon: <Clock className="w-4 h-4" />,
              path: '/dashboard/parent/activity/time'
            },
            {
              id: 'engaged-content',
              title: 'Most Engaged Content This Week',
              icon: <TrendingUp className="w-4 h-4" />,
              path: '/dashboard/parent/activity/engagement'
            },
            {
              id: 'ai-highlights',
              title: 'AI Tutor Conversation Highlights',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/parent/activity/ai-highlights'
            }
          ]
        }
      ]
    },
    {
      id: 'achievements',
      title: 'Achievements & Milestones',
      icon: null,
      children: [
        {
          id: 'certificates',
          title: 'Certificates Earned',
          icon: <Award className="w-5 h-5" />,
          children: [
            {
              id: 'view-certificates',
              title: 'View',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/parent/achievements/view'
            },
            {
              id: 'download-certificates',
              title: 'Download',
              icon: <DownloadIcon className="w-4 h-4" />,
              path: '/dashboard/parent/achievements/download'
            },
            {
              id: 'share-certificates',
              title: 'Share',
              icon: <Share2Icon className="w-4 h-4" />,
              path: '/dashboard/parent/achievements/share'
            }
          ]
        },
        {
          id: 'badges-gallery',
          title: 'Badges & Skill Badges Gallery',
          icon: <Trophy className="w-5 h-5" />,
          path: '/dashboard/parent/achievements/badges'
        },
        {
          id: 'growth-timeline',
          title: 'Growth Moments Timeline',
          icon: <CalendarDays className="w-5 h-5" />,
          path: '/dashboard/parent/achievements/timeline'
        }
      ]
    },
    {
      id: 'goals-expectations',
      title: 'Goals & Expectations',
      icon: null,
      children: [
        {
          id: 'family-goals',
          title: 'Family-set Learning Goals',
          icon: <Goal className="w-5 h-5" />,
          path: '/dashboard/parent/goals/family'
        },
        {
          id: 'ai-suggestions',
          title: 'AI-suggested Next Milestones',
          icon: <Sparkles className="w-5 h-5" />,
          path: '/dashboard/parent/goals/ai-suggestions'
        },
        {
          id: 'progress-bars',
          title: 'Progress Bars & Celebration Moments',
          icon: <PartyPopper className="w-5 h-5" />,
          path: '/dashboard/parent/goals/progress'
        }
      ]
    },
    {
      id: 'ai-companion',
      title: 'AI Companion Insights',
      icon: null,
      children: [
        {
          id: 'child-ai-summary',
          title: 'My Child\'s AI Tutor Summary',
          icon: <Brain className="w-5 h-5" />,
          path: '/dashboard/parent/ai/summary'
        },
        {
          id: 'learning-style',
          title: 'Learning Style & Preferences',
          icon: <Target className="w-5 h-5" />,
          path: '/dashboard/parent/ai/learning-style'
        },
        {
          id: 'support-tips',
          title: 'How to Support at Home',
          icon: <Heart className="w-5 h-5" />,
          path: '/dashboard/parent/ai/support-tips'
        },
        {
          id: 'ai-planning',
          title: 'Topics AI is Planning Next',
          icon: <Book className="w-5 h-5" />,
          path: '/dashboard/parent/ai/planning'
        },
        {
          id: 'conversation-patterns',
          title: 'Conversation Topics & Curiosity Patterns',
          icon: <MessageCircle className="w-5 h-5" />,
          path: '/dashboard/parent/ai/patterns'
        },
        {
          id: 'early-warnings',
          title: 'Early Warning Signs',
          icon: <ShieldAlert className="w-5 h-5" />,
          path: '/dashboard/parent/ai/warnings'
        }
      ]
    },
    {
      id: 'communications',
      title: 'Communications',
      icon: null,
      children: [
        {
          id: 'notifications',
          title: 'Notifications & Alerts',
          icon: <Bell className="w-5 h-5" />,
          children: [
            {
              id: 'smart-inbox',
              title: 'Smart Inbox Style',
              icon: <Inbox className="w-4 h-4" />,
              path: '/dashboard/parent/communications/inbox'
            },
            {
              id: 'priority',
              title: 'Priority + All Notifications',
              icon: <BellRing className="w-4 h-4" />,
              path: '/dashboard/parent/communications/priority'
            }
          ]
        },
        {
          id: 'messages',
          title: 'Messages',
          icon: <MessageSquare className="w-5 h-5" />,
          children: [
            {
              id: 'ai-tutor',
              title: 'Messages to/from Child\'s AI Tutor',
              icon: <Brain className="w-4 h-4" />,
              path: '/dashboard/parent/messages/ai-tutor'
            },
            {
              id: 'teacher',
              title: 'Messages to/from Class Teacher',
              icon: <UserCheck className="w-4 h-4" />,
              path: '/dashboard/parent/messages/teacher'
            },
            {
              id: 'family-chat',
              title: 'Family Chat (Parent ↔ Child)',
              icon: <Users className="w-4 h-4" />,
              path: '/dashboard/parent/messages/family'
            }
          ]
        },
        {
          id: 'support-questions',
          title: 'Support & Questions',
          icon: <HelpCircle className="w-5 h-5" />,
          children: [
            {
              id: 'help-articles',
              title: 'Quick Help Articles',
              icon: <Book className="w-4 h-4" />,
              path: '/dashboard/parent/support/help-articles'
            },
            {
              id: 'submit-ticket',
              title: 'Submit Ticket / Urgent Flag',
              icon: <ShieldAlert className="w-4 h-4" />,
              path: '/dashboard/parent/support/ticket'
            },
            {
              id: 'school-team',
              title: 'Chat with School Team',
              icon: <Phone className="w-4 h-4" />,
              path: '/dashboard/parent/support/school-team'
            }
          ]
        }
      ]
    },
    {
      id: 'finance-plans',
      title: 'Finance & Plans',
      icon: null,
      children: [
        {
          id: 'current-plan',
          title: 'Current Plan',
          icon: <CreditCard className="w-5 h-5" />,
          children: [
            {
              id: 'status',
              title: 'Status, Renewal Date, Features Included',
              icon: <FileCheck className="w-4 h-4" />,
              path: '/dashboard/parent/finance/plan/status'
            }
          ]
        },
        {
          id: 'payment-history',
          title: 'Payment History & Receipts',
          icon: <FileText className="w-5 h-5" />,
          path: '/dashboard/parent/finance/history'
        },
        {
          id: 'manage-subscription',
          title: 'Manage Subscription',
          icon: <Settings className="w-5 h-5" />,
          children: [
            {
              id: 'upgrade',
              title: 'Upgrade',
              icon: <Plus className="w-4 h-4" />,
              path: '/dashboard/parent/finance/subscription/upgrade'
            },
            {
              id: 'downgrade',
              title: 'Downgrade',
              icon: <Minus className="w-4 h-4" />,
              path: '/dashboard/parent/finance/subscription/downgrade'
            },
            {
              id: 'pause',
              title: 'Pause',
              icon: <Pause className="w-4 h-4" />,
              path: '/dashboard/parent/finance/subscription/pause'
            },
            {
              id: 'family-plan',
              title: 'Family Plan Options',
              icon: <Users className="w-4 h-4" />,
              path: '/dashboard/parent/finance/subscription/family'
            }
          ]
        },
        {
          id: 'add-ons',
          title: 'Add-ons & Extras',
          icon: <Plus className="w-5 h-5" />,
          children: [
            {
              id: 'premium-ai',
              title: 'Premium AI Features',
              icon: <Sparkles className="w-4 h-4" />,
              path: '/dashboard/parent/finance/addons/premium-ai'
            },
            {
              id: 'live-sessions',
              title: 'Extra Live Sessions',
              icon: <Video className="w-4 h-4" />,
              path: '/dashboard/parent/finance/addons/live-sessions'
            }
          ]
        },
        {
          id: 'support-fund',
          title: 'Support Fund / Donations',
          icon: <Gift className="w-5 h-5" />,
          path: '/dashboard/parent/finance/donations'
        }
      ]
    },
    {
      id: 'reports-documents',
      title: 'Reports & Documents',
      icon: null,
      children: [
        {
          id: 'weekly-reports',
          title: 'Weekly / Monthly Reports',
          icon: <FileText className="w-5 h-5" />,
          children: [
            {
              id: 'pdf-view',
              title: 'PDF + Interactive View',
              icon: <FileSearch className="w-4 h-4" />,
              path: '/dashboard/parent/reports/interactive'
            }
          ]
        },
        {
          id: 'term-summary',
          title: 'Term Progress Summary',
          icon: <BarChart3 className="w-5 h-5" />,
          path: '/dashboard/parent/reports/term-summary'
        },
        {
          id: 'official-docs',
          title: 'Official Transcripts & Competency Statements',
          icon: <FileCheck className="w-5 h-5" />,
          path: '/dashboard/parent/reports/transcripts'
        },
        {
          id: 'portfolio',
          title: 'Export Learning Portfolio',
          icon: <FolderKanban className="w-5 h-5" />,
          path: '/dashboard/parent/reports/portfolio'
        }
      ]
    },
    {
      id: 'settings-controls',
      title: 'Settings & Controls',
      icon: null,
      children: [
        {
          id: 'notifications',
          title: 'Notification Preferences',
          icon: <Bell className="w-5 h-5" />,
          children: [
            {
              id: 'per-child',
              title: 'Per Child',
              icon: <UserIcon className="w-4 h-4" />,
              path: '/dashboard/parent/settings/notifications/child'
            },
            {
              id: 'per-type',
              title: 'Per Type',
              icon: <Filter className="w-4 h-4" />,
              path: '/dashboard/parent/settings/notifications/type'
            }
          ]
        },
        {
          id: 'consent-permissions',
          title: 'Consent & Permissions',
          icon: <Shield className="w-5 h-5" />,
          children: [
            {
              id: 'review',
              title: 'Review',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/parent/settings/consent/review'
            },
            {
              id: 'update',
              title: 'Update',
              icon: <Edit3 className="w-4 h-4" />,
              path: '/dashboard/parent/settings/consent/update'
            },
            {
              id: 'revoke',
              title: 'Revoke',
              icon: <XCircle className="w-4 h-4" />,
              path: '/dashboard/parent/settings/consent/revoke'
            }
          ]
        },
        {
          id: 'privacy-data',
          title: 'Privacy & Data',
          icon: <ShieldCheck className="w-5 h-5" />,
          children: [
            {
              id: 'shared-data',
              title: 'What\'s Shared',
              icon: <Share2Icon className="w-4 h-4" />,
              path: '/dashboard/parent/settings/privacy/shared'
            },
            {
              id: 'data-access',
              title: 'Data Access Request',
              icon: <FileSearch className="w-4 h-4" />,
              path: '/dashboard/parent/settings/privacy/access'
            }
          ]
        },
        {
          id: 'family-members',
          title: 'Family Members',
          icon: <Users className="w-5 h-5" />,
          children: [
            {
              id: 'add-parent',
              title: 'Add Co-parent',
              icon: <UserPlus className="w-4 h-4" />,
              path: '/dashboard/parent/settings/family/add-parent'
            },
            {
              id: 'add-guardian',
              title: 'Add Guardians',
              icon: <UserCheck className="w-4 h-4" />,
              path: '/dashboard/parent/settings/family/add-guardian'
            },
            {
              id: 'viewing-rights',
              title: 'Viewing Rights',
              icon: <Eye className="w-4 h-4" />,
              path: '/dashboard/parent/settings/family/rights'
            }
          ]
        },
        {
          id: 'profile-preferences',
          title: 'Profile & Preferences',
          icon: <UserIcon className="w-5 h-5" />,
          children: [
            {
              id: 'language',
              title: 'Language',
              icon: <Globe className="w-4 h-4" />,
              path: '/dashboard/parent/settings/profile/language'
            },
            {
              id: 'timezone',
              title: 'Time Zone',
              icon: <Clock className="w-4 h-4" />,
              path: '/dashboard/parent/settings/profile/timezone'
            },
            {
              id: 'display-name',
              title: 'Display Name',
              icon: <UserIcon className="w-4 h-4" />,
              path: '/dashboard/parent/settings/profile/name'
            }
          ]
        },
        {
          id: 'security',
          title: 'Security',
          icon: <ShieldAlert className="w-5 h-5" />,
          children: [
            {
              id: 'password',
              title: 'Password',
              icon: <Key className="w-4 h-4" />,
              path: '/dashboard/parent/settings/security/password'
            },
            {
              id: '2fa',
              title: '2FA',
              icon: <ShieldCheck className="w-4 h-4" />,
              path: '/dashboard/parent/settings/security/2fa'
            },
            {
              id: 'login-history',
              title: 'Login History',
              icon: <History className="w-4 h-4" />,
              path: '/dashboard/parent/settings/security/history'
            }
          ]
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
        bg-gradient-to-b from-[#0F1112] to-[#181C1F] border border-[#22272B]
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
                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-[#22272B] pl-4">
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
            <span>Parent Dashboard v1.0.0</span>
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

export default ParentSidebar;