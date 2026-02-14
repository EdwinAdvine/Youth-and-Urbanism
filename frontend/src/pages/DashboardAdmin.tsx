import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, BarChart3, Settings, Plus, TrendingUp, Brain } from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();

  const stats = {
    totalUsers: 1247,
    activeStudents: 892,
    activeParents: 324,
    activeInstructors: 31,
    systemUptime: "99.8%",
    newUsersToday: 15
  };

  const recentActivity = [
    { id: 1, action: "New student registered", user: "John Doe", time: "2 minutes ago" },
    { id: 2, action: "Parent account verified", user: "Jane Smith", time: "15 minutes ago" },
    { id: 3, action: "Instructor added new course", user: "Dr. Wilson", time: "1 hour ago" },
    { id: 4, action: "System backup completed", user: "System", time: "3 hours ago" }
  ];

  const systemStatus = [
    { id: 1, service: "Authentication", status: "online", color: "text-green-400" },
    { id: 2, service: "Database", status: "online", color: "text-green-400" },
    { id: 3, service: "File Storage", status: "degraded", color: "text-yellow-400" },
    { id: 4, service: "Email Service", status: "online", color: "text-green-400" }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome, Demo Admin!</h2>
                <p className="text-gray-600 dark:text-white/80 text-sm sm:text-base">
                  Monitor system performance and manage the Urban Home School platform.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Stats */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <motion.div variants={fadeUp} className="lg:col-span-2 bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Overview</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">All systems operational</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/60">Total Users</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/60">Active Students</span>
                <span className="font-bold text-blue-400">{stats.activeStudents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/60">Active Parents</span>
                <span className="font-bold text-green-400">{stats.activeParents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/60">Active Instructors</span>
                <span className="font-bold text-purple-400">{stats.activeInstructors.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-[#2A3035]">
                <span className="text-gray-500 dark:text-white/60">System Uptime</span>
                <span className="font-bold text-yellow-400">{stats.systemUptime}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-2 bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.02 }} className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-gray-500 dark:text-white/60">Manage Users</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">View and manage all accounts</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/dashboard/admin/ai-providers')}
                className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-5 h-5 text-[#E40000]" />
                  <span className="text-xs text-gray-500 dark:text-white/60">AI Providers</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage AI provider settings</p>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-gray-500 dark:text-white/60">Analytics</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">View platform statistics</p>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-gray-500 dark:text-white/60">System Settings</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Configure platform settings</p>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Plus className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-gray-500 dark:text-white/60">Create Account</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add new staff/admin accounts</p>
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-2 bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h3>
            <div className="space-y-3">
              {systemStatus.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium text-gray-900 dark:text-white">{service.service}</span>
                  </div>
                  <span className={`text-sm ${service.color}`}>{service.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeUp}>
              <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-white/60">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-white/60">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Analytics</h3>
                  <div className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Growing</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-1">New Users Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsersToday}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Daily Active Users</p>
                    <p className="text-2xl font-bold text-blue-400">654</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Course Completions</p>
                    <p className="text-2xl font-bold text-green-400">127</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Tools</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/dashboard/admin/ai-providers')}
                    className="w-full text-left p-3 bg-gradient-to-r from-[#E40000]/20 to-[#E40000]/10 border border-[#E40000]/30 rounded-lg hover:bg-[#E40000]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-[#E40000]" />
                      <p className="font-medium text-gray-900 dark:text-white">AI Provider Management</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/60">Configure AI models and providers</p>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                    <p className="font-medium text-gray-900 dark:text-white">User Management</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Approve accounts, reset passwords</p>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                    <p className="font-medium text-gray-900 dark:text-white">Content Moderation</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Review user content and reports</p>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                    <p className="font-medium text-gray-900 dark:text-white">System Logs</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">View system events and errors</p>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                    <p className="font-medium text-gray-900 dark:text-white">Backup & Restore</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Manage data backups</p>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-white/60">Database Performance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-[#2A3035] rounded-full h-2">
                        <div className="h-2 bg-green-500 rounded-full w-5/6" />
                      </div>
                      <span className="text-xs text-green-400">Excellent</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-white/60">Server Response Time</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-[#2A3035] rounded-full h-2">
                        <div className="h-2 bg-blue-500 rounded-full w-4/5" />
                      </div>
                      <span className="text-xs text-blue-400">Good</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-white/60">Memory Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-[#2A3035] rounded-full h-2">
                        <div className="h-2 bg-yellow-500 rounded-full w-3/5" />
                      </div>
                      <span className="text-xs text-yellow-400">Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Tip</h3>
                <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-white/80 italic">
                    "Regularly monitor system logs and user activity. Proactive maintenance prevents major issues and ensures optimal platform performance."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardAdmin;
