import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Calendar, Award, LogOut, Eye } from 'lucide-react';

const DashboardParent: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock child data
  const children = [
    {
      id: 1,
      name: "Alex Johnson",
      grade: "Grade 4",
      progress: 78,
      recentActivity: "Completed Mathematics quiz with 85%",
      lastActive: "2 hours ago",
      subjects: ["Mathematics", "English", "Science"]
    },
    {
      id: 2,
      name: "Sarah Johnson", 
      grade: "Grade 2",
      progress: 92,
      recentActivity: "Started new English reading lesson",
      lastActive: "4 hours ago",
      subjects: ["English", "Mathematics", "Creative Arts"]
    }
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
                <p className="text-xs sm:text-sm text-white/60">Parent Dashboard</p>
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
        <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                Monitor your child's progress and support their learning journey.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {children.map((child) => (
            <div key={child.id} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{child.name}</h3>
                  <p className="text-sm text-white/60">{child.grade}</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">View Details</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>Overall Progress</span>
                  <span>{child.progress}%</span>
                </div>
                <div className="w-full bg-[#22272B] rounded-full h-3">
                  <div 
                    className="h-3 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#22272B] rounded-lg p-3 mb-3">
                <p className="text-sm text-white/80 mb-1">Recent Activity:</p>
                <p className="text-sm text-white font-medium">{child.recentActivity}</p>
                <p className="text-xs text-white/60 mt-1">Last active: {child.lastActive}</p>
              </div>

              {/* Subjects */}
              <div>
                <p className="text-sm text-white/60 mb-2">Active Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {child.subjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-[#22272B] text-xs text-white/80 rounded-full border border-[#2A3035]">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Learning Insights */}
          <div className="lg:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Learning Insights</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#22272B] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Average Score</span>
                    <span className="text-lg font-bold text-green-400">82%</span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-2">
                    <div className="h-2 bg-green-500 rounded-full w-4/5" />
                  </div>
                </div>
                <div className="bg-[#22272B] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Completion Rate</span>
                    <span className="text-lg font-bold text-blue-400">89%</span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-2">
                    <div className="h-2 bg-blue-500 rounded-full w-5/6" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#22272B] rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Weekly Activity</h4>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className={`h-8 bg-[#2A3035] rounded mb-1 ${index < 5 ? 'bg-green-500/50' : ''}`} />
                      <span className="text-white/60">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Parent Actions */}
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Parent Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">View Detailed Reports</p>
                    <p className="text-xs text-white/60">Comprehensive progress analysis</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Set Learning Goals</p>
                    <p className="text-xs text-white/60">Help your child achieve targets</p>
                  </div>
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Schedule Parent-Teacher Meeting</p>
                    <p className="text-xs text-white/60">Connect with instructors</p>
                  </div>
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
              </button>
            </div>

            {/* Parent Tips */}
            <div className="mt-6 p-4 bg-[#22272B] rounded-lg">
              <h4 className="font-medium text-white mb-2">Parent Tip</h4>
              <p className="text-xs text-white/80">
                "Spend 15 minutes daily reviewing what your child learned. This reinforces concepts and shows you care about their education."
              </p>
            </div>
          </div>
        </div>

        {/* Communication Section */}
        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Recent Messages</h4>
              <div className="space-y-2">
                <div className="p-3 bg-[#22272B] rounded-lg">
                  <p className="text-sm text-white font-medium">Mathematics Instructor</p>
                  <p className="text-xs text-white/60 mt-1">"Alex is doing great with fractions! Keep practicing at home."</p>
                  <p className="text-xs text-white/60 mt-1">2 days ago</p>
                </div>
                <div className="p-3 bg-[#22272B] rounded-lg">
                  <p className="text-sm text-white font-medium">English Instructor</p>
                  <p className="text-xs text-white/60 mt-1">"Sarah's reading comprehension has improved significantly."</p>
                  <p className="text-xs text-white/60 mt-1">5 days ago</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-3">Upcoming Events</h4>
              <div className="space-y-2">
                <div className="p-3 bg-[#22272B] rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-white font-medium">Parent-Teacher Conference</p>
                  <p className="text-xs text-white/60 mt-1">Next Monday, 4:00 PM</p>
                </div>
                <div className="p-3 bg-[#22272B] rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-white font-medium">Progress Report</p>
                  <p className="text-xs text-white/60 mt-1">Available Friday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardParent;