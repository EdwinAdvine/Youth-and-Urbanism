import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, BarChart3, Settings, LogOut, Plus, TrendingUp } from 'lucide-react';

const DashboardAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock admin data
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
    <div className="min-h-screen bg-[#0F1112]">
      {/* Header */}
      <header className="bg-[#181C1F] border-b border-[#22272B] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center text-white font-bold text-xl">U</div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Urban Home School</h1>
                <p className="text-xs sm:text-sm text-white/60">Admin Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/60 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white border border-[#2A3035] rounded-lg hover:border-[#FF0000] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-500/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                Monitor system performance and manage the Urban Home School platform.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Overview</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">All systems operational</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Users</span>
                <span className="font-bold text-white">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Students</span>
                <span className="font-bold text-blue-400">{stats.activeStudents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Parents</span>
                <span className="font-bold text-green-400">{stats.activeParents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Active Instructors</span>
                <span className="font-bold text-purple-400">{stats.activeInstructors.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#2A3035]">
                <span className="text-white/60">System Uptime</span>
                <span className="font-bold text-yellow-400">{stats.systemUptime}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-white/60">Manage Users</span>
                </div>
                <p className="text-sm font-medium text-white">View and manage all accounts</p>
              </button>
              
              <button className="p-4 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-white/60">Analytics</span>
                </div>
                <p className="text-sm font-medium text-white">View platform statistics</p>
              </button>
              
              <button className="p-4 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-white/60">System Settings</span>
                </div>
                <p className="text-sm font-medium text-white">Configure platform settings</p>
              </button>
              
              <button className="p-4 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors text-left">
                <div className="flex items-center justify-between mb-2">
                  <Plus className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-white/60">Create Account</span>
                </div>
                <p className="text-sm font-medium text-white">Add new staff/admin accounts</p>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              {systemStatus.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium text-white">{service.service}</span>
                  </div>
                  <span className={`text-sm ${service.color}`}>{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{activity.action}</p>
                      <p className="text-xs text-white/60">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-white/60">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Analytics */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Platform Analytics</h3>
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Growing</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#22272B] rounded-lg p-4 text-center">
                  <p className="text-xs text-white/60 mb-1">New Users Today</p>
                  <p className="text-2xl font-bold text-white">{stats.newUsersToday}</p>
                </div>
                <div className="bg-[#22272B] rounded-lg p-4 text-center">
                  <p className="text-xs text-white/60 mb-1">Daily Active Users</p>
                  <p className="text-2xl font-bold text-blue-400">654</p>
                </div>
                <div className="bg-[#22272B] rounded-lg p-4 text-center">
                  <p className="text-xs text-white/60 mb-1">Course Completions</p>
                  <p className="text-2xl font-bold text-green-400">127</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Admin Tools */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Admin Tools</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">User Management</p>
                  <p className="text-xs text-white/60">Approve accounts, reset passwords</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Content Moderation</p>
                  <p className="text-xs text-white/60">Review user content and reports</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">System Logs</p>
                  <p className="text-xs text-white/60">View system events and errors</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Backup & Restore</p>
                  <p className="text-xs text-white/60">Manage data backups</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Security Settings</p>
                  <p className="text-xs text-white/60">Configure security policies</p>
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Database Performance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2A3035] rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full w-5/6" />
                    </div>
                    <span className="text-xs text-green-400">Excellent</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Server Response Time</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2A3035] rounded-full h-2">
                      <div className="h-2 bg-blue-500 rounded-full w-4/5" />
                    </div>
                    <span className="text-xs text-blue-400">Good</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#2A3035] rounded-full h-2">
                      <div className="h-2 bg-yellow-500 rounded-full w-3/5" />
                    </div>
                    <span className="text-xs text-yellow-400">Moderate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Tips */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Admin Tip</h3>
              <div className="bg-[#22272B] rounded-lg p-4">
                <p className="text-sm text-white/80 italic">
                  "Regularly monitor system logs and user activity. Proactive maintenance prevents major issues and ensures optimal platform performance."
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;