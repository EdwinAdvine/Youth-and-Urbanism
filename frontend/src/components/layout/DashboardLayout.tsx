import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useThemeStore, useUserStore, useCoPilotStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import apiClient from '../../services/api';
import StudentSidebar from '../student/sidebar/StudentSidebar';
import PartnerSidebar from '../partner/sidebar/PartnerSidebar';
import ParentSidebar from '../parent/ParentSidebar';
import InstructorSidebar from '../instructor/sidebar/InstructorSidebar';
import AdminSidebar from '../admin/sidebar/AdminSidebar';
import StaffSidebar from '../staff/sidebar/StaffSidebar';
import Topbar from './Topbar';
import CoPilotSidebar from '../co-pilot/CoPilotSidebar';
import ScrollToTopButton from './ScrollToTopButton';

const AvatarFloatingPanel = React.lazy(() => import('../avatar/AvatarFloatingPanel'));

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onOpenAuthModal?: () => void;
  role?: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onOpenAuthModal, role = 'student' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwShowCurrent, setPwShowCurrent] = useState(false);
  const [pwShowNew, setPwShowNew] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { updatePreferences } = useUserStore();
  const { theme } = useThemeStore();
  const { isExpanded, detectDashboardType } = useCoPilotStore();
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { ageGroup } = useAgeAdaptiveUI();

  // Show password change modal if user must change their password
  useEffect(() => {
    if (authUser?.must_change_password) {
      setShowPasswordModal(true);
    }
  }, [authUser?.must_change_password]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(pwForm.newPw) || !/[a-z]/.test(pwForm.newPw) || !/[0-9]/.test(pwForm.newPw)) {
      setPwError('Password must include uppercase, lowercase, and a digit.');
      return;
    }

    setPwLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        current_password: pwForm.current,
        new_password: pwForm.newPw,
      });
      setShowPasswordModal(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      await checkAuth();
    } catch (err: any) {
      setPwError(err?.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/', { replace: true });
  };

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

  const isChildTheme = user.role === 'student' && ageGroup !== 'senior';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0F1112] dark:to-[#181C1F] transition-colors duration-200${isChildTheme ? ' student-child-theme' : ''}`}>
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

      {/* 3D Avatar Floating Panel — rendered in Portal, persists across pages */}
      <React.Suspense fallback={null}>
        <AvatarFloatingPanel />
      </React.Suspense>

      {/* Must-Change-Password Blocking Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Password Change Required
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/60">
                  You must change your password before continuing.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={pwShowCurrent ? 'text' : 'password'}
                    value={pwForm.current}
                    onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                    required
                    className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setPwShowCurrent((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {pwShowCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={pwShowNew ? 'text' : 'password'}
                    value={pwForm.newPw}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))}
                    required
                    minLength={8}
                    className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setPwShowNew((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {pwShowNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50"
                />
              </div>

              {pwError && (
                <p className="text-sm text-red-400">{pwError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 bg-[#FF0000] hover:bg-[#E40000] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {pwLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="px-4 py-3 border border-gray-200 dark:border-[#22272B] rounded-xl text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 text-sm"
                >
                  Switch Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;