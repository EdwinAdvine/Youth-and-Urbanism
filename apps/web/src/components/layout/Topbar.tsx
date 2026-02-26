import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore, useUserStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { useNotificationWebSocket } from '../../hooks/useNotificationWebSocket';
import { searchService, type SearchResult } from '../../services/searchService';
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
  LogOut,
  Loader2,
  BookOpen,
  Users,
  FileText,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
} from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Notification } from '../../types/index';

interface TopbarProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  role?: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle, isSidebarOpen, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logout, user: authUser } = useAuthStore();

  // Use authenticated user data, fallback to demo data
  const user = authUser ? {
    id: authUser.id || 'auth-user',
    name: authUser.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: (authUser.role || role || 'student') as string,
    admission_number: (authUser.profile_data?.admission_number as string | undefined) || null,
  } : {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: (role || 'student') as string,
    admission_number: null as string | null,
  };

  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useUserStore();
  const { isConnected: wsConnected, unreadCount: wsUnreadCount } = useNotificationWebSocket();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Speech recognition for voice search
  const { isRecording: isVoiceSearching, isSupported: isVoiceSupported, toggle: toggleVoiceSearch } =
    useSpeechRecognition({
      onFinalTranscript: (text) => {
        handleSearchInput(text);
      },
      onError: (err) => console.error('Voice search error:', err),
    });

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await searchService.search(value.trim(), undefined, 8);
        setSearchResults(response.results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const getSearchResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-400" />;
      case 'course': return <BookOpen className="w-4 h-4 text-green-400" />;
      case 'notification': return <Bell className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const recentNotifications = notifications.slice(0, 5);

  const handleLogout = () => {
    logout();
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
      default: return <Bell className="w-5 h-5 text-gray-700 dark:text-white/80" />;
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
    <header className="bg-gradient-to-r from-white to-gray-50 dark:from-[#0F1112] dark:to-[#181C1F] border-b border-gray-200 dark:border-[#22272B] sticky top-0 z-50 shadow-lg shadow-black/10 dark:shadow-black/30 w-full transition-colors duration-200">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
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
                <div className="w-12 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  UHS
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#FF0000] transition-colors">Urban Home School</h1>
                  <p className="text-xs text-gray-500 dark:text-white/60">{getDashboardTitle(user?.role || 'student')}</p>
                </div>
              </button>
            </div>

            {/* Breadcrumb for smaller screens */}
            <div className="lg:hidden text-sm text-gray-600 dark:text-white/80">
              {location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </div>
          </div>

          {/* Center Section - Search with Dropdown */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8" ref={searchDropdownRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search courses, users, notifications..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => { if (searchQuery.trim().length >= 2) setShowSearchDropdown(true); }}
                    className={`w-full pl-10 ${isVoiceSupported ? 'pr-16' : 'pr-4'} py-2 bg-gray-100 dark:bg-[#22272B] border ${isVoiceSearching ? 'border-red-500/40 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-[#2A3035]'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all`}
                  />
                  {/* Voice search button */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      title={isVoiceSearching ? 'Stop voice search' : 'Voice search'}
                      className={`
                        absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded transition-all
                        ${isVoiceSearching
                          ? 'text-red-500 animate-pulse'
                          : 'text-gray-400 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400'
                        }
                      `}
                    >
                      {isVoiceSearching ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  {isSearching ? (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/60 text-xs">⌘K</span>
                  )}
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400 dark:text-white/60">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result, i) => (
                        <button
                          key={`${result.type}-${i}`}
                          onClick={() => {
                            navigate(result.url);
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-100 dark:border-[#22272B] last:border-b-0"
                        >
                          {getSearchResultIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 dark:text-white/60 truncate">{result.description}</p>
                          </div>
                          <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            {result.type}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setShowSearchDropdown(false);
                        }}
                        className="w-full text-center text-sm text-[#FF0000] hover:text-[#E40000] py-2 border-t border-gray-200 dark:border-[#22272B] transition-colors"
                      >
                        View all results
                      </button>
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center text-gray-400 dark:text-white/60">
                      <Search className="w-5 h-5 mx-auto mb-2" />
                      <p className="text-sm">No results for "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Button for Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* WebSocket Status */}
            <div className="hidden sm:flex items-center" title={wsConnected ? 'Real-time connected' : 'Reconnecting...'}>
              {wsConnected ? (
                <Wifi className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {(unreadNotifications.length > 0 || wsUnreadCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-gray-900 dark:text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {Math.max(unreadNotifications.length, wsUnreadCount) > 99 ? '99+' : Math.max(unreadNotifications.length, wsUnreadCount)}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
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
                          className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-[#22272B] last:border-b-0 ${
                            !notification.read ? 'bg-gray-50 dark:bg-[#22272B]/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</p>
                              <p className="text-xs text-gray-500 dark:text-white/70 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-400 dark:text-white/50 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#FF0000] rounded-full mt-1"></div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-400 dark:text-white/60">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-[#22272B]">
                    <button
                      onClick={() => {
                        navigate(`/dashboard/${role || 'student'}/notifications`);
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
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-semibold text-sm group-hover:scale-105 transition-transform">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-white/80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl shadow-xl shadow-black/10 dark:shadow-black/50 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-semibold flex-shrink-0">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-white/60 truncate">{user?.email || user?.name}</p>
                        {user?.admission_number && (
                          <p className="text-[10px] font-mono text-blue-500 dark:text-blue-400 mt-0.5 truncate">
                            {user.admission_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate(`/dashboard/${role || 'student'}/profile`);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/dashboard/${role || 'student'}/preferences`);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-[#22272B] p-3">
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
          <div className="absolute top-20 left-4 right-4 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/60 w-5 h-5" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={isVoiceSearching ? 'Listening...' : 'Search courses, assignments, forums...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 ${isVoiceSupported ? 'pr-10' : 'pr-4'} py-3 bg-gray-100 dark:bg-[#22272B] border ${isVoiceSearching ? 'border-red-500/40' : 'border-gray-200 dark:border-[#2A3035]'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all`}
                />
                {/* Mobile voice search button */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={toggleVoiceSearch}
                    title={isVoiceSearching ? 'Stop voice search' : 'Voice search'}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all
                      ${isVoiceSearching
                        ? 'text-red-500 animate-pulse'
                        : 'text-gray-400 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400'
                      }
                    `}
                  >
                    {isVoiceSearching ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="px-4 py-3 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
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