import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Key,
  Monitor,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  LogOut,
  Smartphone,
  MapPin,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

const mockSessions: ActiveSession[] = [
  { id: '1', device: 'MacBook Pro', browser: 'Chrome 121', ip_address: '196.201.214.100', location: 'Nairobi, KE', last_active: '2025-01-15T16:45:00Z', is_current: true },
  { id: '2', device: 'iPhone 15', browser: 'Safari Mobile', ip_address: '196.201.214.101', location: 'Nairobi, KE', last_active: '2025-01-15T14:20:00Z', is_current: false },
  { id: '3', device: 'Windows Desktop', browser: 'Firefox 122', ip_address: '41.89.110.50', location: 'Mombasa, KE', last_active: '2025-01-14T09:30:00Z', is_current: false },
];

const AdminProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profile, setProfile] = useState({
    first_name: 'System',
    last_name: 'Admin',
    email: 'admin@urbanhomeschool.ke',
    phone: '+254 700 000 000',
    bio: 'Platform administrator for Urban Home School',
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Profile"
        breadcrumbs={[
          { label: 'Admin', path: '/dashboard/admin' },
          { label: 'Account' },
          { label: 'Profile' },
        ]}
      />

      <div className="flex gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1 w-fit">
        {(['profile', 'security', 'sessions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
              activeTab === tab ? 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70'
            }`}
          >
            {tab === 'sessions' ? 'Active Sessions' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-gray-900 dark:text-white text-2xl font-bold shrink-0">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">First Name</label>
                  <input type="text" value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Last Name</label>
                  <input type="text" value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Email</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-white/30" />
                    <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Phone</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-white/30" />
                    <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444] resize-none" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                <Save className="w-4 h-4" />Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-gray-500 dark:text-white/50" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
            </div>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Current Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" className="w-full px-3 py-2 pr-10 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">New Password</label>
                <input type="password" placeholder="Enter new password" className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-lg hover:border-gray-300 dark:hover:border-[#444] transition-colors">
                <Save className="w-4 h-4" />Update Password
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500 dark:text-white/50" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={`relative w-11 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-[#333]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${twoFactorEnabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'sessions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {mockSessions.map(session => (
            <div key={session.id} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#22272B]">
                    {session.device.includes('iPhone') ? <Smartphone className="w-5 h-5 text-gray-500 dark:text-white/50" /> : <Monitor className="w-5 h-5 text-gray-500 dark:text-white/50" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-white">{session.device}</span>
                      {session.is_current && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded">Current</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-white/40">
                      <span>{session.browser}</span>
                      <span>{session.ip_address}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-white/30 mt-1">Last active: {new Date(session.last_active).toLocaleString()}</div>
                  </div>
                </div>
                {!session.is_current && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" />Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AdminProfilePage;
