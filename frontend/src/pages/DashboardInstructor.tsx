import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Book, Calendar, MessageSquare, Plus, Eye, Coins, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardInstructor: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout role="instructor">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to Instructor Dashboard!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                Your comprehensive teaching platform. Use the sidebar to access all instructor features including course management, student engagement, and earnings tracking.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Book className="w-10 h-10 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Students Today</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Courses</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Earnings This Month</p>
                <p className="text-2xl font-bold text-white">KSh 45,200</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Needs Attention</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Today's Overview</h3>
                <p className="text-sm text-white/60">Quick heartbeat view of your teaching day</p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
            <button 
              onClick={() => navigate('/dashboard/instructor/today/active-students')}
              className="w-full py-2 px-4 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              View Today's Stats
            </button>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Course Management</h3>
                <p className="text-sm text-white/60">Create, edit, and manage your courses</p>
              </div>
              <Book className="w-8 h-8 text-blue-400" />
            </div>
            <button 
              onClick={() => navigate('/dashboard/instructor/teaching/courses')}
              className="w-full py-2 px-4 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Manage Courses
            </button>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Student Engagement</h3>
                <p className="text-sm text-white/60">Track progress and interact with students</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-400" />
            </div>
            <button 
              onClick={() => navigate('/dashboard/instructor/interactions/messages')}
              className="w-full py-2 px-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              View Interactions
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Today / Overview</h4>
              <p className="text-xs text-white/60">Quick heartbeat view with active students, upcoming sessions, and earnings</p>
            </div>
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">My Teaching Space</h4>
              <p className="text-xs text-white/60">Course creation, CBC alignment, and usage analytics</p>
            </div>
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Assessments & Activities</h4>
              <p className="text-xs text-white/60">Assignment creation, batch grading, and AI-assisted feedback</p>
            </div>
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Students & Engagement</h4>
              <p className="text-xs text-white/60">Live sessions, attendance tracking, and student interactions</p>
            </div>
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Impact & Recognition</h4>
              <p className="text-xs text-white/60">Student feedback, ratings, and performance tracking</p>
            </div>
            <div className="p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Earnings & Finances</h4>
              <p className="text-xs text-white/60">Earnings dashboard, payouts, and rate management</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardInstructor;
