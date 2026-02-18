import React from 'react';
import { Key, Smartphone, Clock, AlertTriangle } from 'lucide-react';

const StaffSecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security</h1>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              Password
            </h2>
            <button className="w-full px-4 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] text-left">
              Change Password
            </button>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              Two-Factor Authentication
            </h2>
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-900 dark:text-white">2FA Status</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Add extra security to your account</p>
              </div>
              <button className="px-3 py-1.5 bg-[#E40000]/20 text-[#FF4444] text-xs rounded-lg hover:bg-[#E40000]/30">
                Enable
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Active Sessions
            </h2>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Chrome on MacOS</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">Nairobi, Kenya · 2 hours ago</p>
                  </div>
                  {i === 1 && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                      Current
                    </span>
                  )}
                  {i === 2 && (
                    <button className="text-xs px-2 py-0.5 text-red-400 hover:bg-red-500/20 rounded">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
            <h2 className="text-base font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h2>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-3">
              Permanently delete your account and all data
            </p>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSecurityPage;
