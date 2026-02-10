import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Calendar, 
  Award, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardStudent: React.FC = () => {
  const navigate = useNavigate();

  // Mock student data
  const student = {
    name: "Alex Johnson",
    gradeLevel: "Grade 8",
    gpa: 4.2,
    attendance: 96,
    enrollmentDate: "September 2024"
  };

  const stats = [
    {
      title: "Current GPA",
      value: "4.2",
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Current Courses",
      value: "8",
      icon: Book,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Attendance",
      value: "96%",
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      title: "Pending Assignments",
      value: "3",
      icon: FileText,
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    }
  ];

  const currentCourses = [
    {
      id: 1,
      title: "Mathematics - Algebra",
      teacher: "Mr. Johnson",
      grade: "A",
      progress: 85,
      assignments: 2,
      nextClass: "Today at 10:00 AM"
    },
    {
      id: 2,
      title: "English Literature",
      teacher: "Ms. Smith",
      grade: "B+",
      progress: 78,
      assignments: 1,
      nextClass: "Tomorrow at 9:00 AM"
    },
    {
      id: 3,
      title: "Science - Biology",
      teacher: "Dr. Brown",
      grade: "A-",
      progress: 92,
      assignments: 0,
      nextClass: "Wednesday at 1:00 PM"
    },
    {
      id: 4,
      title: "History - World Civilizations",
      teacher: "Mr. Davis",
      grade: "B",
      progress: 74,
      assignments: 3,
      nextClass: "Thursday at 11:00 AM"
    },
    {
      id: 5,
      title: "Creative Arts",
      teacher: "Ms. Wilson",
      grade: "A",
      progress: 95,
      assignments: 0,
      nextClass: "Friday at 2:00 PM"
    }
  ];

  const assignments = [
    {
      id: 1,
      title: "Mathematics Chapter 5 Quiz",
      course: "Mathematics",
      dueDate: "Today, 3:00 PM",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      title: "English Essay: Character Analysis",
      course: "English Literature",
      dueDate: "Tomorrow, 5:00 PM",
      status: "in_progress",
      priority: "medium"
    },
    {
      id: 3,
      title: "Science Lab Report",
      course: "Science",
      dueDate: "Friday, 4:00 PM",
      status: "pending",
      priority: "low"
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "Mathematics Test",
      date: "March 15, 2024",
      excerpt: "Chapter 5 test scheduled for next Monday. Review your notes and practice problems.",
      category: "Academic"
    },
    {
      id: 2,
      title: "Library Hours Extended",
      date: "March 10, 2024",
      excerpt: "Library will be open until 6 PM during exam week for additional study time.",
      category: "Announcement"
    },
    {
      id: 3,
      title: "Science Fair Projects Due",
      date: "March 20, 2024",
      excerpt: "All science fair projects must be submitted by Friday. See your science teacher for details.",
      category: "Important"
    }
  ];

  const learningProgress = [
    { subject: "Mathematics", progress: 85, grade: "A" },
    { subject: "English", progress: 78, grade: "B+" },
    { subject: "Science", progress: 92, grade: "A-" },
    { subject: "History", progress: 74, grade: "B" },
    { subject: "Arts", progress: 95, grade: "A" }
  ];

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {student.name}!</h2>
              <p className="text-white/80 text-sm sm:text-base">
                Ready to learn? Let's check your progress and what's coming up.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Book className="w-10 h-10 text-blue-400" />
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
          {/* Left Column - Current Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Courses */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Current Courses</h3>
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">View All</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {currentCourses.map((course) => (
                  <div key={course.id} className="bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{course.title}</h4>
                        <p className="text-xs text-white/60">Teacher: {course.teacher}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                          {course.grade}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{course.progress}% progress</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{course.assignments} assignments</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">Next class:</p>
                        <p className="text-sm font-medium text-blue-400">{course.nextClass}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Course Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-[#2A3035] rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">This Week's Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Mathematics - Algebra</p>
                    <p className="text-xs text-white/60">Mr. Johnson • Room 201</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Today</p>
                    <p className="text-sm text-blue-400">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">English Literature</p>
                    <p className="text-xs text-white/60">Ms. Smith • Room 305</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Tomorrow</p>
                    <p className="text-sm text-green-400">9:00 AM - 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Science - Biology</p>
                    <p className="text-xs text-white/60">Dr. Brown • Lab 1</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">Wednesday</p>
                    <p className="text-sm text-purple-400">1:00 PM - 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pending Assignments */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Pending Assignments</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-[#22272B] rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{assignment.title}</p>
                        <p className="text-xs text-white/60">{assignment.course}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-orange-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        assignment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        assignment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {assignment.priority} priority
                      </span>
                      <span className="text-xs text-white/60">{assignment.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                Submit Assignment
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">View Learning Materials</p>
                      <p className="text-xs text-white/60">Access course resources</p>
                    </div>
                    <Book className="w-5 h-5 text-blue-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Check Grades</p>
                      <p className="text-xs text-white/60">View academic progress</p>
                    </div>
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Contact Teachers</p>
                      <p className="text-xs text-white/60">Send messages</p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-green-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-[#22272B] rounded-lg hover:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Study Tools</p>
                      <p className="text-xs text-white/60">Flashcards & quizzes</p>
                    </div>
                    <Plus className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subject Progress</h3>
              <div className="space-y-3">
                {learningProgress.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{subject.subject}</span>
                      <span className="text-white/60">{subject.grade}</span>
                    </div>
                    <div className="w-full bg-[#2A3035] rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-8 bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Announcements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-[#22272B] rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                    {announcement.category}
                  </span>
                  <span className="text-xs text-white/60">{announcement.date}</span>
                </div>
                <h4 className="font-medium text-white mb-2">{announcement.title}</h4>
                <p className="text-sm text-white/80">{announcement.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStudent;