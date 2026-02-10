import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore, useUserStore } from '../../store';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  Calendar,
  MessageCircle,
  HelpCircle,
  Home,
  LogOut
} from 'lucide-react';
import { Notification } from '../../types/index';

interface TopbarProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  role?: 'student' | 'parent' | 'instructor' | 'admin' | 'partner';
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle, isSidebarOpen, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode, toggleTheme } = useThemeStore();
  
  // Mock user data for direct dashboard access
  const user = {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'student' as const,
    createdAt: new Date(),
    lastLogin: new Date(),
    preferences: {
      theme: 'light' as const,
      language: 'en' as const,
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      dashboardWidgets: []
    }
  };
  
  const { } = useUserStore();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useUserStore();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const recentNotifications = notifications.slice(0, 5);

  const handleLogout = () => {
    // Clear local storage and redirect to home
    localStorage.clear();
    navigate('/');
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
    }
    setIsNotificationsOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment_due': return <Calendar className="w-5 h-5 text-orange-400" />;
      case 'grade_published': return <Plus className="w-5 h-5 text-green-400" />;
      case 'forum_reply': return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'course_update': return <Home className="w-5 h-5 text-purple-400" />;
      case 'system': return <HelpCircle className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-white/80" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getDashboardTitle = (userRole: string) => {
    switch (userRole) {
      case 'parent': return 'Parent Control Panel';
      case 'instructor': return 'Instructor Control Panel';
      case 'admin': return 'Admin Control Panel';
      case 'partner': return 'Partner Control Panel';
      default: return 'Student Control Panel';
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#0F1112] to-[#181C1F] border-b border-[#22272B] sticky top-0 z-50 shadow-lg shadow-black/30 w-full">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo and Title */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-4 hover:cursor-pointer transition-all"
                aria-label="Go to home page"
              >
                <div className="w-12 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  UHS
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white group-hover:text-[#FF0000] transition-colors">Urban Home School</h1>
                  <p className="text-xs text-white/60">{getDashboardTitle(user?.role || 'student')}</p>
                </div>
              </button>
            </div>

            {/* Breadcrumb for smaller screens */}
            <div className="lg:hidden text-sm text-white/80">
              {location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses, assignments, forums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  <span className="text-xs">⌘K</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Button for Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#181C1F] border border-[#22272B] rounded-xl shadow-xl shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-[#22272B]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-[#FF0000] hover:text-[#E40000] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-[#22272B] last:border-b-0 ${
                            !notification.read ? 'bg-[#22272B]/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm">{notification.title}</p>
                              <p className="text-xs text-white/70 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-white/50 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#FF0000] rounded-full mt-1"></div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-white/60">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-white/40" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-[#22272B]">
                    <button
                      onClick={() => {
                        navigate('/dashboard/student/notifications');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full text-center text-sm text-[#FF0000] hover:text-[#E40000] transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-white/60 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#181C1F] border border-[#22272B] rounded-xl shadow-xl shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-[#22272B]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-white/60">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/dashboard/student/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard/student/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-[#22272B] p-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSearchOpen(false)}>
          <div className="absolute top-20 left-4 right-4 bg-[#181C1F] border border-[#22272B] rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search courses, assignments, forums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-4 py-3 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;