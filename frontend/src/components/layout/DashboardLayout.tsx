import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useThemeStore, useUserStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { initializeTheme } from '../../store';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { updatePreferences } = useUserStore();
  const { theme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Update user preferences when theme changes
  useEffect(() => {
    if (user) {
      updatePreferences({ theme });
    }
  }, [theme, user, updatePreferences]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1112] to-[#181C1F]">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <Topbar onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Welcome back, {user?.name}! Here's what's happening with your learning journey today.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
                  <span>Home</span>
                  <span>›</span>
                  <span className="text-white font-medium">
                    {location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;