import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useThemeStore, useUserStore, useCoPilotStore } from '../../store';
import Sidebar from './Sidebar';
import PartnerSidebar from '../partner/PartnerSidebar';
import ParentSidebar from '../parent/ParentSidebar';
import InstructorSidebar from '../instructor/InstructorSidebar';
import Topbar from './Topbar';
import CoPilotSidebar from '../co-pilot/CoPilotSidebar';
import { initializeTheme } from '../../store';
import { detectDashboardType as detectDashboardTypeUtil } from '../../utils/dashboardDetection';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onOpenAuthModal?: () => void;
  role?: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onOpenAuthModal, role = 'student' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { updatePreferences } = useUserStore();
  const { theme } = useThemeStore();
  const { isExpanded, detectDashboardType } = useCoPilotStore();

  // Mock user data for direct dashboard access - moved outside component to prevent recreation
  const user = React.useMemo(() => ({
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: role as 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff',
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
  }), [role]);

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

  // Detect dashboard type and update co-pilot state
  useEffect(() => {
    detectDashboardType(location.pathname);
  }, [location.pathname, detectDashboardType]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1112] to-[#181C1F]">
      {/* Global Topbar - Fixed at top */}
      <Topbar onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} role={user.role} />

      {/* Main Layout Container - Starts below topbar */}
      <div className="flex min-h-screen">
        {/* AI Co-Pilot Sidebar */}
        <CoPilotSidebar onOpenAuthModal={onOpenAuthModal} />

        {/* Sidebar - Starts immediately below topbar */}
        {user.role === 'instructor' ? (
          <InstructorSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : user.role === 'parent' ? (
          <ParentSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : user.role === 'partner' ? (
          <PartnerSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onOpenAuthModal={onOpenAuthModal}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isExpanded ? 'mr-0 lg:mr-96' : 'mr-0'}`}>
          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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

    </div>
  );
};

export default DashboardLayout;