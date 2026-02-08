import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  FileText, 
  Award, 
  Wallet, 
  Users, 
  Settings, 
  Bell, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Play,
  BarChart3,
  MessageCircle,
  HelpCircle,
  Star,
  Folder,
  Video,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Plus,
  Search,
  Filter,
  SortAsc,
  Download,
  Share2,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  MessageSquarePlus,
  Bookmark,
  FolderPlus,
  FolderMinus,
  FolderCheck,
  FolderX,
  FolderSearch,
  FolderHeart,
  FolderKey,
  FolderCog,
  FolderSync,
  FolderArchive,
  FolderGit,
  FolderInput,
  FolderOutput,
  FolderCode,
  FolderUp,
  FolderDown,
  FolderLock,
  Folders,
  FolderSearch2,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: string;
  disabled?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useThemeStore();
  
  const [openSections, setOpenSections] = useState<string[]>(['learning', 'assessments', 'progress', 'finance', 'community']);
  
  const navigationItems: NavItem[] = [
    {
      id: 'main',
      title: 'MAIN',
      icon: null,
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
          path: '/dashboard/student'
        },
        {
          id: 'calendar',
          title: 'Calendar & Events',
          icon: <Calendar className="w-5 h-5" />,
          path: '/dashboard/student/calendar'
        }
      ]
    },
    {
      id: 'learning',
      title: 'LEARNING',
      icon: null,
      children: [
        {
          id: 'my-courses',
          title: 'My Courses',
          icon: <BookOpen className="w-5 h-5" />,
          children: [
            {
              id: 'enrolled',
              title: 'Enrolled',
              icon: <Play className="w-4 h-4" />,
              path: '/dashboard/student/courses/enrolled'
            },
            {
              id: 'in-progress',
              title: 'In Progress',
              icon: <BarChart3 className="w-4 h-4" />,
              path: '/dashboard/student/courses/in-progress'
            },
            {
              id: 'completed',
              title: 'Completed',
              icon: <CheckCircle className="w-4 h-4" />,
              path: '/dashboard/student/courses/completed'
            },
            {
              id: 'comments',
              title: 'Comments',
              icon: <MessageCircle className="w-4 h-4" />,
              path: '/dashboard/student/courses/comments'
            },
            {
              id: 'favorites',
              title: 'Favorites',
              icon: <Star className="w-4 h-4" />,
              path: '/dashboard/student/courses/favorites'
            }
          ]
        },
        {
          id: 'browse-courses',
          title: 'Upcoming & Browse Courses',
          icon: <Search className="w-5 h-5" />,
          path: '/dashboard/student/courses/browse'
        },
        {
          id: 'live-sessions',
          title: 'Live Sessions & Meetings',
          icon: <Video className="w-5 h-5" />,
          path: '/dashboard/student/live-sessions'
        }
      ]
    },
    {
      id: 'assessments',
      title: 'ASSESSMENTS',
      icon: null,
      children: [
        {
          id: 'assignments',
          title: 'Assignments',
          icon: <FileText className="w-5 h-5" />,
          children: [
            {
              id: 'pending',
              title: 'Pending',
              icon: <Clock className="w-4 h-4" />,
              path: '/dashboard/student/assignments/pending'
            },
            {
              id: 'submitted',
              title: 'Submitted',
              icon: <CheckCircle className="w-4 h-4" />,
              path: '/dashboard/student/assignments/submitted'
            },
            {
              id: 'graded',
              title: 'Graded',
              icon: <Edit3 className="w-4 h-4" />,
              path: '/dashboard/student/assignments/graded'
            }
          ]
        },
        {
          id: 'quizzes',
          title: 'Quizzes & Exams',
          icon: <File className="w-5 h-5" />,
          children: [
            {
              id: 'upcoming',
              title: 'Upcoming',
              icon: <CalendarPlus className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/upcoming'
            },
            {
              id: 'results',
              title: 'My Results',
              icon: <BarChart3 className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/results'
            },
            {
              id: 'not-participated',
              title: 'Not Participated',
              icon: <XCircle className="w-4 h-4" />,
              path: '/dashboard/student/quizzes/not-participated'
            }
          ]
        },
        {
          id: 'projects',
          title: 'Projects',
          icon: <Folder className="w-5 h-5" />,
          path: '/dashboard/student/projects'
        }
      ]
    },
    {
      id: 'progress',
      title: 'PROGRESS',
      icon: null,
      children: [
        {
          id: 'certificates',
          title: 'Certificates & Badges',
          icon: <Award className="w-5 h-5" />,
          children: [
            {
              id: 'achievements',
              title: 'My Achievements',
              icon: <Star className="w-4 h-4" />,
              path: '/dashboard/student/certificates/achievements'
            },
            {
              id: 'validation',
              title: 'Certificate Validation',
              icon: <CheckCircle className="w-4 h-4" />,
              path: '/dashboard/student/certificates/validation'
            }
          ]
        },
        {
          id: 'analytics',
          title: 'Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          path: '/dashboard/student/analytics'
        }
      ]
    },
    {
      id: 'finance',
      title: 'FINANCE',
      icon: null,
      children: [
        {
          id: 'wallet',
          title: 'Wallet Dashboard',
          icon: <Wallet className="w-5 h-5" />,
          path: '/dashboard/student/wallet'
        },
        {
          id: 'transactions',
          title: 'Transactions',
          icon: <FileText className="w-5 h-5" />,
          path: '/dashboard/student/transactions'
        },
        {
          id: 'charge-account',
          title: 'Charge Account',
          icon: <Plus className="w-5 h-5" />,
          path: '/dashboard/student/charge-account'
        },
        {
          id: 'payouts',
          title: 'Payouts',
          icon: <Download className="w-5 h-5" />,
          path: '/dashboard/student/payouts'
        },
        {
          id: 'subscriptions',
          title: 'Subscriptions',
          icon: <Share2 className="w-5 h-5" />,
          path: '/dashboard/student/subscriptions'
        }
      ]
    },
    {
      id: 'community',
      title: 'COMMUNITY',
      icon: null,
      children: [
        {
          id: 'forums',
          title: 'Forums',
          icon: <MessageCircle className="w-5 h-5" />,
          children: [
            {
              id: 'new-topics',
              title: 'New Topics',
              icon: <MessageSquarePlus className="w-4 h-4" />,
              path: '/dashboard/student/forums/new-topics'
            },
            {
              id: 'my-topics',
              title: 'My Topics',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/forums/my-topics'
            },
            {
              id: 'my-posts',
              title: 'My Posts',
              icon: <MessageSquare className="w-4 h-4" />,
              path: '/dashboard/student/forums/my-posts'
            },
            {
              id: 'bookmarks',
              title: 'Bookmarks',
              icon: <Bookmark className="w-4 h-4" />,
              path: '/dashboard/student/forums/bookmarks'
            }
          ]
        },
        {
          id: 'support',
          title: 'Support',
          icon: <HelpCircle className="w-5 h-5" />,
          children: [
            {
              id: 'new-student-guide',
              title: 'New Student Guide',
              icon: <UserPlus className="w-4 h-4" />,
              path: '/dashboard/student/support/new-student-guide'
            },
            {
              id: 'class-support',
              title: 'Class Support',
              icon: <UserCheck className="w-4 h-4" />,
              path: '/dashboard/student/support/class-support'
            },
            {
              id: 'submit-ticket',
              title: 'Submit Ticket',
              icon: <UserX className="w-4 h-4" />,
              path: '/dashboard/student/support/submit-ticket'
            }
          ]
        }
      ]
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      icon: null,
      children: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell className="w-5 h-5" />,
          path: '/dashboard/student/notifications'
        },
        {
          id: 'profile',
          title: 'Profile',
          icon: <User className="w-5 h-5" />,
          path: '/dashboard/student/profile'
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: <Settings className="w-5 h-5" />,
          path: '/dashboard/student/settings'
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

  const handleNavigation = (path?: string) => {
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
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-[#0F1112] to-[#181C1F] border-r border-[#22272B]
        shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22272B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center text-white font-bold text-xl">U</div>
            <div>
              <h1 className="text-lg font-bold text-white">Urban Home School</h1>
              <p className="text-xs text-white/60">Student Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
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
                              onClick={() => handleNavigation(child.path)}
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
                      onClick={() => handleNavigation(item.path)}
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
            <span>Version 1.0.0</span>
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

export default Sidebar;