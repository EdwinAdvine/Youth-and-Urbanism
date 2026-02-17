import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useThemeStore, useUserStore, useCoPilotStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import StudentSidebar from '../student/sidebar/StudentSidebar';
import PartnerSidebar from '../partner/sidebar/PartnerSidebar';
import ParentSidebar from '../parent/ParentSidebar';
import InstructorSidebar from '../instructor/sidebar/InstructorSidebar';
import AdminSidebar from '../admin/sidebar/AdminSidebar';
import StaffSidebar from '../staff/sidebar/StaffSidebar';
import Topbar from './Topbar';
import CoPilotSidebar from '../co-pilot/CoPilotSidebar';
import ScrollToTopButton from './ScrollToTopButton';

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
  const authUser = useAuthStore((state) => state.user);

  // Use authenticated user data when available, fallback to demo data for development
  const user = React.useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id || 'auth-user',
        name: authUser.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (authUser.role || role) as 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff',
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
    }
    return {
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
    };
  }, [authUser, role]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0F1112] dark:to-[#181C1F] transition-colors duration-200">
      {/* Global Topbar - Fixed at top */}
      <Topbar onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} role={user.role} />

      {/* Main Layout Container - Starts below topbar */}
      <div className="flex min-h-screen">
        {/* AI Co-Pilot Sidebar */}
        <CoPilotSidebar onOpenAuthModal={onOpenAuthModal} />

        {/* Sidebar - Starts immediately below topbar */}
        {user.role === 'admin' ? (
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : user.role === 'staff' ? (
          <StaffSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : user.role === 'instructor' ? (
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
          />
        ) : (
          <StudentSidebar
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
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default DashboardLayout;