import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeStore, useUserStore } from '../store';
import { initializeTheme } from '../store';
import { BookOpen, FileText, Award, TrendingUp, Calendar, Star, Users } from 'lucide-react';
import WelcomeWidget from '../components/dashboard/WelcomeWidget';
import StatsCards from '../components/dashboard/StatsCards';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

interface Course {
  id: string;
  title: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed';
  thumbnail?: string;
}

const DashboardStudent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useThemeStore();

  // Initialize theme
  useEffect(() => {
    initializeTheme();
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case 'view-courses':
        navigate('/dashboard/student/courses/in-progress');
        break;
      case 'view-assignments':
        navigate('/dashboard/student/assignments/pending');
        break;
      case 'view-certificates':
        navigate('/dashboard/student/certificates/achievements');
        break;
      case 'view-wallet':
        navigate('/dashboard/student/wallet');
        break;
      default:
        break;
    }
  };

  const handleContinueLearning = () => {
    navigate('/dashboard/student/courses/in-progress');
  };

  // Get data from store
  const { courses, assignments, certificates, transactions } = useUserStore();

  // Show loading state if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1112] to-[#181C1F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto"></div>
          <p className="mt-4 text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if user data is missing
  if (!user.name || !user.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1112] to-[#181C1F] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Profile Incomplete</h2>
          <p className="text-white/70 mb-6">
            We need some additional information to complete your setup. Please contact support or try logging in again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#FF0000] hover:bg-[#E40000] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeCourses = courses.filter(c => c.status === 'in_progress').length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const submittedAssignments = assignments.filter(a => a.status === 'submitted').length;
  const totalCertificates = certificates.length;
  const walletBalance = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0) - 
    transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Widget */}
        <WelcomeWidget onAction={handleContinueLearning} />

        {/* Stats Cards */}
        <StatsCards onAction={handleAction} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Continue Learning & Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Continue Learning
                </h3>
                <button
                  onClick={() => navigate('/dashboard/student/courses/in-progress')}
                  className="text-sm text-[#FF0000] hover:text-[#E40000] transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {courses
                  .filter(c => c.status === 'in_progress')
                  .slice(0, 3)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-[#22272B] border border-[#2A3035] rounded-xl hover:border-[#FF0000]/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                          {course.title.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{course.title}</h4>
                          <p className="text-sm text-white/60">In Progress</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{course.progress}%</div>
                        <div className="w-24 bg-[#2A3035] rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-[#FF0000] to-[#E40000] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </h3>
                <button
                  onClick={() => navigate('/dashboard/student/calendar')}
                  className="text-sm text-[#FF0000] hover:text-[#E40000] transition-colors"
                >
                  View Calendar
                </button>
              </div>
              
              <div className="space-y-3">
                {assignments
                  .filter(a => a.status === 'pending')
                  .slice(0, 3)
                  .map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-[#22272B] border border-[#2A3035] rounded-lg">
                      <div>
                        <p className="font-medium text-white">{assignment.title}</p>
                        <p className="text-sm text-white/60">{assignment.courseTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">
                          Due: {assignment.dueDate.toLocaleDateString()}
                        </p>
                        <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full mt-1">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Achievements */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Overview
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Courses Completed</span>
                    <span>{completedCourses}/{courses.length}</span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${courses.length > 0 ? (completedCourses / courses.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Assignments Submitted</span>
                    <span>{submittedAssignments}/{assignments.length}</span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${assignments.length > 0 ? (submittedAssignments / assignments.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span>Average Grade</span>
                    <span>
                      {assignments.length > 0 
                        ? Math.round(assignments.reduce((sum, a) => sum + (a.grade || 0), 0) / assignments.length)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${assignments.length > 0 
                        ? Math.round(assignments.reduce((sum, a) => sum + (a.grade || 0), 0) / assignments.length)
                        : 0
                      }%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recent Achievements
                </h3>
                <button
                  onClick={() => navigate('/dashboard/student/certificates/achievements')}
                  className="text-sm text-[#FF0000] hover:text-[#E40000] transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert) => (
                  <div key={cert.id} className="flex items-center gap-3 p-3 bg-[#22272B] border border-[#2A3035] rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{cert.courseTitle}</p>
                      <p className="text-xs text-white/60">
                        Completed {cert.completionDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {certificates.length === 0 && (
                  <div className="text-center py-4 text-white/60">
                    <Star className="w-8 h-8 mx-auto mb-2 text-white/40" />
                    <p className="text-sm">No achievements yet. Keep learning!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/student/courses/browse')}
                  className="w-full flex items-center gap-3 p-3 bg-[#22272B] border border-[#2A3035] rounded-lg hover:border-[#FF0000] transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-white/80" />
                  <span className="text-white">Browse New Courses</span>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard/student/assignments/pending')}
                  className="w-full flex items-center gap-3 p-3 bg-[#22272B] border border-[#2A3035] rounded-lg hover:border-[#FF0000] transition-colors"
                >
                  <FileText className="w-5 h-5 text-white/80" />
                  <span className="text-white">Submit Assignments</span>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard/student/forums/new-topics')}
                  className="w-full flex items-center gap-3 p-3 bg-[#22272B] border border-[#2A3035] rounded-lg hover:border-[#FF0000] transition-colors"
                >
                  <Users className="w-5 h-5 text-white/80" />
                  <span className="text-white">Join Community</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStudent;