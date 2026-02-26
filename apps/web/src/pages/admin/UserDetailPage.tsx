import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  Monitor,
  Lock,
  KeyRound,
  UserX,
  UserCheck,
  Clock,
  LogIn,
  FileEdit,
  Trash2,
  Settings,
  BookOpen,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Laptop,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type TabType = 'profile' | 'activity' | 'devices' | 'permissions';

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  type: 'auth' | 'content' | 'admin' | 'system';
}

interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
  icon: React.ReactNode;
}

interface UserPermission {
  id: string;
  name: string;
  description: string;
  granted: boolean;
  grantedBy: string;
  grantedAt: Date;
}

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  instructor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  parent: 'bg-green-500/20 text-green-400 border-green-500/30',
  partner: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  staff: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60 * 1000);
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000);
const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);

const mockUser = {
  id: 'usr_001',
  full_name: 'Amina Wanjiku',
  email: 'amina.wanjiku@example.com',
  role: 'student',
  is_active: true,
  phone: '+254 712 345 678',
  created_at: '2025-06-15T08:30:00Z',
  last_login: '2026-02-12T14:22:00Z',
  email_verified: true,
  two_factor_enabled: false,
  login_count: 142,
  profile_data: {
    grade_level: 'Grade 6',
    county: 'Nairobi',
    school: 'Urban Home School',
    learning_style: 'Visual',
  },
};

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    action: 'Logged in',
    description: 'Signed in from Chrome on MacOS',
    timestamp: mins(15),
    icon: <LogIn className="w-4 h-4 text-blue-400" />,
    type: 'auth',
  },
  {
    id: '2',
    action: 'Completed assessment',
    description: 'Mathematics Term 2 Quiz - Score: 85%',
    timestamp: hours(2),
    icon: <BookOpen className="w-4 h-4 text-green-400" />,
    type: 'content',
  },
  {
    id: '3',
    action: 'AI Tutor session',
    description: 'Had a 25-minute session with Ndege on Science topics',
    timestamp: hours(3),
    icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
    type: 'content',
  },
  {
    id: '4',
    action: 'Profile updated',
    description: 'Changed learning style preference to Visual',
    timestamp: hours(8),
    icon: <FileEdit className="w-4 h-4 text-yellow-400" />,
    type: 'system',
  },
  {
    id: '5',
    action: 'Course enrolled',
    description: 'Enrolled in "CBC English Language Arts - Term 2"',
    timestamp: days(1),
    icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
    type: 'content',
  },
  {
    id: '6',
    action: 'Password changed',
    description: 'Password was reset via email link',
    timestamp: days(3),
    icon: <KeyRound className="w-4 h-4 text-orange-400" />,
    type: 'auth',
  },
  {
    id: '7',
    action: 'Logged in',
    description: 'Signed in from Safari on iPhone',
    timestamp: days(4),
    icon: <LogIn className="w-4 h-4 text-blue-400" />,
    type: 'auth',
  },
  {
    id: '8',
    action: 'Account created',
    description: 'Account registered by parent Grace Kamau',
    timestamp: days(240),
    icon: <User className="w-4 h-4 text-emerald-400" />,
    type: 'admin',
  },
];

const mockDevices: DeviceSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 121',
    os: 'macOS Sonoma',
    ip: '102.89.45.112',
    location: 'Nairobi, Kenya',
    lastActive: mins(15),
    isCurrent: true,
    icon: <Laptop className="w-5 h-5 text-blue-400" />,
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari 17',
    os: 'iOS 17.3',
    ip: '102.89.45.115',
    location: 'Nairobi, Kenya',
    lastActive: days(1),
    isCurrent: false,
    icon: <Smartphone className="w-5 h-5 text-green-400" />,
  },
  {
    id: '3',
    device: 'Windows Desktop',
    browser: 'Edge 121',
    os: 'Windows 11',
    ip: '41.90.62.88',
    location: 'Mombasa, Kenya',
    lastActive: days(5),
    isCurrent: false,
    icon: <Monitor className="w-5 h-5 text-purple-400" />,
  },
];

const mockPermissions: UserPermission[] = [
  {
    id: '1',
    name: 'ai_tutor.access',
    description: 'Access AI Tutor chat sessions',
    granted: true,
    grantedBy: 'System (Role Default)',
    grantedAt: days(240),
  },
  {
    id: '2',
    name: 'courses.enroll',
    description: 'Enroll in available courses',
    granted: true,
    grantedBy: 'System (Role Default)',
    grantedAt: days(240),
  },
  {
    id: '3',
    name: 'assessments.take',
    description: 'Take quizzes and assessments',
    granted: true,
    grantedBy: 'System (Role Default)',
    grantedAt: days(240),
  },
  {
    id: '4',
    name: 'forum.post',
    description: 'Create forum posts and replies',
    granted: true,
    grantedBy: 'Admin: Edwin Odhiambo',
    grantedAt: days(120),
  },
  {
    id: '5',
    name: 'content.download',
    description: 'Download learning materials for offline use',
    granted: false,
    grantedBy: '-',
    grantedAt: days(0),
  },
  {
    id: '6',
    name: 'voice_tutor.access',
    description: 'Access ElevenLabs voice tutor sessions',
    granted: true,
    grantedBy: 'System (Subscription)',
    grantedAt: days(60),
  },
];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hoursDiff = Math.floor(minutes / 60);
  if (hoursDiff < 24) return `${hoursDiff}h ago`;
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 30) return `${daysDiff}d ago`;
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ------------------------------------------------------------------
// Tab component
// ------------------------------------------------------------------

const TabButton: React.FC<{
  tab: TabType;
  activeTab: TabType;
  label: string;
  icon: React.ReactNode;
  onClick: (tab: TabType) => void;
}> = ({ tab, activeTab, label, icon, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-[#E40000] text-gray-900 dark:text-white'
        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A3035]'
    }`}
  >
    {icon}
    {label}
  </button>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userActive, setUserActive] = useState(mockUser.is_active);
  const [permissions, setPermissions] = useState(mockPermissions);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleActive = () => {
    const next = !userActive;
    setUserActive(next);
    showToast(
      next ? 'User reactivated successfully' : 'User deactivated successfully',
      'success'
    );
  };

  const handleResetPassword = () => {
    showToast('Password reset email sent to ' + mockUser.email, 'success');
  };

  const handleTogglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, granted: !p.granted } : p))
    );
    showToast('Permission updated', 'success');
  };

  // Use id from params to show we're handling it (for future API integration)
  const _userId = id;
  void _userId;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <AdminPageHeader
          title="User Detail"
          subtitle={`Viewing profile for ${mockUser.full_name}`}
          breadcrumbs={[
            { label: 'Users', path: '/dashboard/admin/users' },
            { label: mockUser.full_name },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard/admin/users')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleResetPassword}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={handleToggleActive}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  userActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {userActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Reactivate
                  </>
                )}
              </button>
            </div>
          }
        />

        {/* User Info Card */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-2xl font-bold uppercase flex-shrink-0">
              {mockUser.full_name.slice(0, 2)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{mockUser.full_name}</h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      roleBadgeColors[mockUser.role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {mockUser.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      userActive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${userActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {userActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="truncate">{mockUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span>Joined {formatDate(mockUser.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span>Last login {formatDate(mockUser.last_login)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
                  <Activity className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span>{mockUser.login_count} total logins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <TabButton tab="profile" activeTab={activeTab} label="Profile" icon={<User className="w-4 h-4" />} onClick={setActiveTab} />
          <TabButton tab="activity" activeTab={activeTab} label="Activity Timeline" icon={<Activity className="w-4 h-4" />} onClick={setActiveTab} />
          <TabButton tab="devices" activeTab={activeTab} label="Devices" icon={<Monitor className="w-4 h-4" />} onClick={setActiveTab} />
          <TabButton tab="permissions" activeTab={activeTab} label="Permissions" icon={<Shield className="w-4 h-4" />} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E40000]" />
                  Account Details
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: mockUser.full_name },
                    { label: 'Email', value: mockUser.email },
                    { label: 'Phone', value: mockUser.phone },
                    { label: 'Role', value: mockUser.role, capitalize: true },
                    { label: 'Email Verified', value: mockUser.email_verified ? 'Yes' : 'No' },
                    { label: 'Two-Factor Auth', value: mockUser.two_factor_enabled ? 'Enabled' : 'Disabled' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#22272B]/50 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-white/50">{item.label}</span>
                      <span className={`text-sm text-gray-900 dark:text-white font-medium ${item.capitalize ? 'capitalize' : ''}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Data */}
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#E40000]" />
                  Profile Data
                </h3>
                <div className="space-y-4">
                  {Object.entries(mockUser.profile_data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#22272B]/50 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-white/50 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Summary */}
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 lg:col-span-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#E40000]" />
                  Security Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockUser.login_count}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Total Logins</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{mockDevices.length}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Active Devices</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-400">
                      {mockUser.two_factor_enabled ? 'On' : 'Off'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Two-Factor Auth</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#E40000]" />
                Recent Activity
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-100 dark:bg-[#22272B]" />

                <div className="space-y-6">
                  {mockActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="relative flex items-start gap-4 pl-0"
                    >
                      {/* Icon dot */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center flex-shrink-0 z-10 border-2 border-[#181C1F]">
                        {activity.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            activity.type === 'auth'
                              ? 'bg-blue-500/20 text-blue-400'
                              : activity.type === 'content'
                              ? 'bg-green-500/20 text-green-400'
                              : activity.type === 'admin'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{activity.description}</p>
                        <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{timeAgo(activity.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              {mockDevices.map((device) => (
                <div
                  key={device.id}
                  className={`bg-white dark:bg-[#181C1F] border rounded-xl p-5 ${
                    device.isCurrent
                      ? 'border-emerald-500/30'
                      : 'border-gray-200 dark:border-[#22272B]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#22272B] flex items-center justify-center flex-shrink-0">
                      {device.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{device.device}</h4>
                        {device.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-500 dark:text-white/50">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {device.browser}
                        </div>
                        <div>{device.os}</div>
                        <div>{device.ip}</div>
                        <div>{device.location}</div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-2">
                        Last active: {timeAgo(device.lastActive)}
                      </p>
                    </div>
                    {!device.isCurrent && (
                      <button
                        onClick={() => showToast('Session revoked', 'success')}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 dark:text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Revoke session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#22272B]">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E40000]" />
                  User Permissions
                </h3>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                  Toggle individual permissions for this user. Role defaults are applied automatically.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                      <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Permission</th>
                      <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Description</th>
                      <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Granted By</th>
                      <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                        <td className="px-6 py-3">
                          <code className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 font-mono">
                            {perm.name}
                          </code>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-white/50">{perm.description}</td>
                        <td className="px-6 py-3 text-gray-400 dark:text-white/40 text-xs">{perm.grantedBy}</td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              perm.granted ? 'bg-emerald-500' : 'bg-[#333]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                perm.granted ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500 text-gray-900 dark:text-white'
                  : 'bg-red-500 text-gray-900 dark:text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default UserDetailPage;
