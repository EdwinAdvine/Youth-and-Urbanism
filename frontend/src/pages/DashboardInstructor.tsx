import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Book, Calendar, MessageSquare, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardInstructor: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const courses = [
    {
      id: 1,
      title: "Mathematics - Algebra Basics",
      students: 24,
      progress: 78,
      nextClass: "Tomorrow at 10:00 AM",
      assignments: 3
    },
    {
      id: 2,
      title: "Science - Ecosystems",
      students: 18,
      progress: 92,
      nextClass: "Wednesday at 2:00 PM",
      assignments: 1
    }
  ];

  const recentMessages = [
    {
      id: 1,
      student: "Alex Johnson",
      course: "Mathematics",
      message: "I need help with the homework assignment",
      time: "2 hours ago"
    },
    {
      id: 2,
      student: "Sarah Johnson",
      course: "Science",
      message: "Can you explain the ecosystem concept again?",
      time: "4 hours ago"
    }
  ];

  return (
    <DashboardLayout role="instructor">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, Demo Instructor!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                Manage your courses and support your students' learning journey.
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Active Courses</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/50 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Students</p>
                <p className="text-2xl font-bold text-white">42</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pending Messages</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Upcoming Classes</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Overview */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Courses</h3>
                <button className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs">Add Course</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{course.title}</h4>
                        <p className="text-xs text-white/60">{course.students} students enrolled</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">Next class:</p>
                        <p className="text-sm font-medium text-purple-400">{course.nextClass}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>📊 {course.progress}% progress</span>
                        <span>📝 {course.assignments} assignments</span>
                      </div>
                      <button className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition-colors">
                        View Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Schedule */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Mathematics - Algebra Basics</p>
                    <p className="text-xs text-white/60">Group Session</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Tomorrow</p>
                    <p className="text-sm text-purple-400">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Science - Ecosystems</p>
                    <p className="text-xs text-white/60">Office Hours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Wednesday</p>
                    <p className="text-sm text-green-400">2:00 PM - 3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Mathematics - Review Session</p>
                    <p className="text-xs text-white/60">Assignment Help</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Friday</p>
                    <p className="text-sm text-blue-400">4:00 PM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Messages */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-[#22272B] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{message.student}</p>
                        <p className="text-xs text-white/60">{message.course}</p>
                      </div>
                      <span className="text-xs text-white/60">{message.time}</span>
                    </div>
                    <p className="text-sm text-white/80">{message.message}</p>
                    <button className="mt-2 text-xs text-purple-400 hover:text-purple-300">
                      Reply →
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                View All Messages
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Create New Assignment</p>
                  <p className="text-xs text-white/60">Add homework or quiz</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Grade Assignments</p>
                  <p className="text-xs text-white/60">Review student work</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Generate Progress Reports</p>
                  <p className="text-xs text-white/60">Download student analytics</p>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <p className="font-medium text-white">Schedule Office Hours</p>
                  <p className="text-xs text-white/60">Set availability times</p>
                </button>
              </div>
            </div>

            {/* Instructor Tips */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instructor Tip</h3>
              <div className="bg-[#22272B] rounded-lg p-4">
                <p className="text-sm text-white/80 italic">
                  "Regular feedback is key to student success. Aim to respond to messages within 24 hours and provide constructive assignment feedback."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardInstructor;