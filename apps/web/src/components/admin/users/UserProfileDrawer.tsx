import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Calendar, Clock, Activity } from 'lucide-react';
import AdminBadge from '../shared/AdminBadge';
import adminUserService, { UserDetail, UserActivity } from '../../../services/admin/adminUserService';

interface UserProfileDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !isOpen) return;
    setLoading(true);

    Promise.all([
      adminUserService.getUserDetail(userId),
      adminUserService.getUserActivity(userId, 20),
    ])
      .then(([u, a]) => {
        setUser(u);
        setActivity(a);
      })
      .catch((err) => console.error('Drawer fetch error:', err))
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0F1112] border-l border-gray-200 dark:border-[#22272B] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#22272B]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Profile</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 dark:text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-[#181C1F] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : user ? (
              <div className="p-5 space-y-6">
                {/* User info */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">
                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <AdminBadge
                      variant={user.role === 'admin' ? 'critical' : 'low'}
                    >
                      {user.role}
                    </AdminBadge>
                    {!user.is_active && <AdminBadge variant="high">Inactive</AdminBadge>}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-gray-700 dark:text-white/70">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-gray-700 dark:text-white/70">
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-gray-700 dark:text-white/70">
                      Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
                    <span className="text-gray-700 dark:text-white/70">
                      Last login {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Recent activity */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-white/50 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  {activity.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-white/30">No activity recorded.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {activity.map((a) => (
                        <div
                          key={a.id}
                          className="p-2.5 bg-gray-50 dark:bg-[#181C1F] rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 dark:text-white/70">
                              {a.action}
                            </span>
                            <span className="text-gray-400 dark:text-white/30">
                              {a.created_at ? new Date(a.created_at).toLocaleTimeString() : ''}
                            </span>
                          </div>
                          <span className="text-gray-400 dark:text-white/40">
                            {a.resource_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center text-gray-400 dark:text-white/40">
                User not found.
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserProfileDrawer;
