import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  Book, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Plus,
  ChevronRight,
  BarChart3,
  FileText
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardStaff: React.FC = () => {
  const navigate = useNavigate();

  // Mock staff data
  const staff = {
    name: "Sarah Johnson",
    position: "Academic Coordinator",
    department: "Administration",
    experience: "5 years"
  };

  const stats = [
    {
      title: "Students Monitored",
      value: "156",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Classes Supervised",
      value: "12",
      icon: Book,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Attendance Rate",
      value: "94%",
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      title: "Pending Tasks",
      value: "8",
      icon: ClipboardList,
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    }
  ];

  const studentOverview = [
    {
      id: 1,
      name: "Alex Johnson",
      grade: "Grade 8",
      attendance: "98%",
      status: "excellent",
      lastUpdate: "Today"
    },
    {
      id: 2,
      name: "Maria Smith",
      grade: "Grade 7",
      attendance: "92%",
      status: "good",
      lastUpdate: "Yesterday"
    },
    {
      id: 3,
      name: "James Wilson",
      grade: "Grade 8",
      attendance: "87%",
      status: "needs_attention",
      lastUpdate: "2 days ago"
    },
    {
      id: 4,
      name: "Emma Brown",
      grade: "Grade 7",
      attendance: "95%",
      status: "good",
      lastUpdate: "Today"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Updated attendance records",
      time: "2 hours ago",
      details: "Grade 8 Mathematics class"
    },
    {
      id: 2,
      action: "Generated progress report",
      time: "4 hours ago",
      details: "Student performance analysis"
    },
    {
      id: 3,
      action: "Scheduled parent meeting",
      time: "1 day ago",
      details: "Meeting with Alex Johnson's parents"
    },
    {
      id: 4,
      action: "Reviewed resource allocation",
      time: "2 days ago",
      details: "Classroom materials distribution"
    }
  ];

  const resourceStatus = [
    {
      id: 1,
      resource: "Textbooks",
      available: 145,
      total: 156,
      status: "good"
    },
    {
      id: 2,
      resource: "Digital Devices",
      available: 120,
      total: 156,
      status: "needs_attention"
    },
    {
      id: 3,
      resource: "Learning Materials",
      available: 150,
      total: 156,
      status: "good"
    },
    {
      id: 4,
      resource: "Classroom Supplies",
      available: 130,
      total: 156,
      status: "needs_attention"
    }
  ];

  const communicationStats = [
    {
      id: 1,
      type: "Parent Messages",
      count: 12,
      status: "pending"
    },
    {
      id: 2,
      type: "Teacher Updates",
      count: 8,
      status: "read"
    },
    {
      id: 3,
      type: "Admin Notifications",
      count: 3,
      status: "read"
    },
    {
      id: 4,
      type: "Student Concerns",
      count: 5,
      status: "pending"
    }
  ];

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {staff.name}!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                {staff.position} • {staff.department} • {staff.experience} of service
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Monitoring */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Overview */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Student Monitoring</h3>
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">View All</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {studentOverview.map((student) => (
                  <div key={student.id} className="bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{student.name}</h4>
                        <p className="text-xs text-white/60">{student.grade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          student.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                          student.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {student.status === 'excellent' ? 'Excellent' :
                           student.status === 'good' ? 'Good' : 'Needs Attention'}
                        </span>
                        <span className="text-xs text-white/60">{student.attendance}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Last update: {student.lastUpdate}</span>
                      <button className="text-blue-400 hover:text-blue-300">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Attendance Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Grade 7</p>
                    <p className="text-xs text-white/60">12 classes monitored</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">96%</p>
                    <div className="w-24 bg-[#2A3035] rounded-full h-2 mt-1">
                      <div className="h-2 bg-green-500 rounded-full w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Grade 8</p>
                    <p className="text-xs text-white/60">10 classes monitored</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">94%</p>
                    <div className="w-24 bg-[#2A3035] rounded-full h-2 mt-1">
                      <div className="h-2 bg-green-500 rounded-full w-19" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Grade 9</p>
                    <p className="text-xs text-white/60">8 classes monitored</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">92%</p>
                    <div className="w-24 bg-[#2A3035] rounded-full h-2 mt-1">
                      <div className="h-2 bg-yellow-500 rounded-full w-18" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-[#22272B] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-white/60">{activity.details}</p>
                      </div>
                      <span className="text-xs text-white/60">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                View All Activities
              </button>
            </div>

            {/* Resource Management */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resource Status</h3>
              <div className="space-y-3">
                {resourceStatus.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{resource.resource}</p>
                      <p className="text-xs text-white/60">{resource.available}/{resource.total} available</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      resource.status === 'good' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {resource.status === 'good' ? 'Adequate' : 'Low Stock'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                Manage Resources
              </button>
            </div>

            {/* Communication Center */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Communication Center</h3>
              <div className="space-y-3">
                {communicationStats.map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{comm.type}</p>
                      <p className="text-xs text-white/60">{comm.count} messages</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      comm.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {comm.status === 'pending' ? 'Pending' : 'Read'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                Open Communication Hub
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Generate Reports</p>
                      <p className="text-xs text-white/60">Attendance & performance analytics</p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Schedule Meetings</p>
                      <p className="text-xs text-white/60">Parent-teacher conferences</p>
                    </div>
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Resource Requests</p>
                      <p className="text-xs text-white/60">Submit supply orders</p>
                    </div>
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Staff Coordination</p>
                      <p className="text-xs text-white/60">Team communication</p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Staff Support</h3>
              <p className="text-white/80 text-sm">Need assistance with your administrative tasks? Contact the admin team.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                Help Center
              </button>
              <button className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStaff;