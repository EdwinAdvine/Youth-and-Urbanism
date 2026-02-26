/**
 * Parent Security Page
 *
 * Password change and login history.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Clock, Loader, CheckCircle, Monitor, Smartphone } from 'lucide-react';
import { changePassword, getLoginHistory } from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface LoginEntry {
  id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  location?: string;
  login_at: string;
  success: boolean;
}

const SecurityPage: React.FC = () => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getLoginHistory(20);
      setLoginHistory(data.entries || data || []);
    } catch (error) {
      console.error('Failed to load login history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess(true);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">Manage password and review login activity</p>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-[#E40000]" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
                />
              </div>

              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-green-400">Password changed successfully!</p>
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password}
                className="w-full py-3 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Login History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Login History</h3>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E40000]" />
              </div>
            ) : loginHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-white/60 text-center py-4">No login history available</p>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((entry, i) => (
                  <div key={entry.id || i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {entry.device_type === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-gray-500 dark:text-white/60" />
                      ) : (
                        <Monitor className="w-5 h-5 text-gray-500 dark:text-white/60" />
                      )}
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{entry.ip_address}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40">{entry.location || 'Unknown location'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${entry.success ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.success ? 'Success' : 'Failed'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/40">
                        {new Date(entry.login_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SecurityPage;
