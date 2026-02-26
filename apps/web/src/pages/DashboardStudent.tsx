// DashboardStudent - Student role dashboard at /dashboard. Shows enrolled courses, assignments,
// progress stats, AI tutor access, forum activity, and certificates overview.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Book,
  Award,
  TrendingUp,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  ChevronRight,
  Loader2,
  Search,
  Bot,
  BadgeCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { courseService } from '../services/courseService';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AnimatedProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-200 dark:bg-[#2A3035] rounded-full h-2">
    <motion.div
      className="h-2 bg-[#E40000] rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

interface EnrollmentData {
  id: string;
  course_id: string;
  course_title?: string;
  progress_percentage: number;
  status: string;
  lessons_completed: number;
  total_lessons: number;
  current_grade?: number;
}

const DashboardStudent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await courseService.getMyEnrollments() as any;
        setEnrollments(Array.isArray(data) ? data : data?.enrollments || []);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const studentName = user?.full_name || user?.profile_data?.full_name || user?.email?.split('@')[0] || 'Student';
  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  // Derive learning progress from enrollments
  const learningProgress = activeEnrollments.map(e => ({
    subject: e.course_title || `Course`,
    progress: e.progress_percentage || 0,
    grade: e.current_grade ? `${e.current_grade}%` : 'N/A',
  }));

  // Placeholder data until backend endpoints are built
  const assignments: { id: string; title: string; course: string; status: string; priority: string; dueDate: string }[] = [];
  const announcements: { id: string; category: string; date: string; title: string; excerpt: string }[] = [];

  const stats = [
    {
      title: "Active Courses",
      value: String(activeEnrollments.length),
      icon: Book,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Completed",
      value: String(enrollments.filter(e => e.status === 'completed').length),
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Avg Progress",
      value: activeEnrollments.length > 0
        ? `${Math.round(activeEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / activeEnrollments.length)}%`
        : '0%',
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      title: "Total Enrolled",
      value: String(enrollments.length),
      icon: FileText,
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {studentName}!</h2>
              <p className="text-gray-400 dark:text-gray-300 text-sm sm:text-base">
                Ready to learn? Let's check your progress and what's coming up.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                <Book className="w-10 h-10 text-[#E40000]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Academic Stats */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 cursor-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Browse Courses', desc: 'Explore new courses', icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', path: '/courses' },
            { title: 'My Certificates', desc: 'View earned certificates', icon: BadgeCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10', path: '/certificates' },
            { title: 'The Bird AI', desc: 'Chat with your tutor', icon: Bot, color: 'text-[#E40000]', bg: 'bg-[#E40000]/10', path: '/the-bird' },
            { title: 'Forum', desc: 'Join discussions', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', path: '/forum' },
          ].map((action, i) => (
            <motion.button key={i} variants={fadeUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(action.path)} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-left hover:border-[#E40000]/40 transition-colors">
              <div className={`p-2 rounded-xl ${action.bg} w-fit mb-3`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
              <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Courses */}
            <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Courses</h3>
                <button className="flex items-center gap-2 px-3 py-1 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] rounded-xl hover:bg-[#E40000]/30 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">View All</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#E40000] animate-spin" />
                    <span className="ml-2 text-gray-500 dark:text-white/60">Loading courses...</span>
                  </div>
                ) : activeEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <Book className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-white/60">No active courses yet.</p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="mt-3 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-xl hover:bg-[#FF0000] transition-colors"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  activeEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{enrollment.course_title || 'Course'}</h4>
                          <p className="text-xs text-gray-500 dark:text-white/60">
                            {enrollment.lessons_completed}/{enrollment.total_lessons} lessons completed
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                            {enrollment.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-white/60 mb-1">
                          <span>Course Progress</span>
                          <span>{Math.round(enrollment.progress_percentage || 0)}%</span>
                        </div>
                        <AnimatedProgressBar value={enrollment.progress_percentage || 0} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Week's Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Mathematics - Algebra</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Mr. Johnson • Room 201</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">Today</p>
                    <p className="text-sm text-blue-400">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">English Literature</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Ms. Smith • Room 305</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">Tomorrow</p>
                    <p className="text-sm text-green-400">9:00 AM - 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Science - Biology</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">Dr. Brown • Lab 1</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">Wednesday</p>
                    <p className="text-sm text-purple-400">1:00 PM - 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pending Assignments */}
            <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Assignments</h3>
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                        <p className="text-xs text-gray-500 dark:text-white/60">{assignment.course}</p>
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
                      <span className="text-xs text-gray-500 dark:text-white/60">{assignment.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 px-3 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-xl hover:bg-[#FF0000] transition-colors">
                Submit Assignment
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">View Learning Materials</p>
                      <p className="text-xs text-gray-500 dark:text-white/60">Access course resources</p>
                    </div>
                    <Book className="w-5 h-5 text-blue-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Check Grades</p>
                      <p className="text-xs text-gray-500 dark:text-white/60">View academic progress</p>
                    </div>
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Contact Teachers</p>
                      <p className="text-xs text-gray-500 dark:text-white/60">Send messages</p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-green-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-gray-200 dark:bg-[#2A3035] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Study Tools</p>
                      <p className="text-xs text-gray-500 dark:text-white/60">Flashcards & quizzes</p>
                    </div>
                    <Plus className="w-5 h-5 text-purple-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Progress</h3>
              <div className="space-y-3">
                {learningProgress.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white font-medium">{subject.subject}</span>
                      <span className="text-gray-500 dark:text-white/60">{subject.grade}</span>
                    </div>
                    <AnimatedProgressBar value={subject.progress} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-8 bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Announcements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-gray-100 dark:bg-[#22272B] rounded-xl p-4 border-l-4 border-[#E40000]">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-[#E40000]/20 text-[#E40000] text-xs rounded-full font-medium">
                    {announcement.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/60">{announcement.date}</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{announcement.title}</h4>
                <p className="text-sm text-gray-600 dark:text-white/80">{announcement.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStudent;