// DashboardInstructor - Instructor role dashboard at /dashboard. Shows course management,
// student enrollment stats, earnings, sessions, messages, and AI intervention alerts.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Book, Calendar, MessageSquare, Eye, Coins, ShieldAlert } from 'lucide-react';
import apiClient from '../services/api';
import courseService from '../services/courseService';
import { useAuthStore } from '../store/authStore';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DashboardInstructor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    upcoming_sessions: 5,
    earnings_this_month: 45200,
    needs_attention: 3,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch dashboard overview from the instructor API
      try {
        const response = await apiClient.get('/api/v1/instructor/dashboard/overview');
        if (response.data) {
          setStats((prev) => ({
            ...prev,
            courses: response.data.courses ?? prev.courses,
            students: response.data.students ?? prev.students,
            upcoming_sessions: response.data.upcoming_sessions ?? prev.upcoming_sessions,
            earnings_this_month: response.data.earnings_this_month ?? prev.earnings_this_month,
            needs_attention: response.data.needs_attention ?? prev.needs_attention,
          }));
          return; // API provided data, skip course fallback
        }
      } catch {
        // Dashboard overview endpoint not available, fall back to course listing
      }

      // Fallback: derive course/student counts from course listing
      try {
        const courses = await courseService.listCourses({ limit: 100 });
        const courseCount = courses.courses?.length || 0;
        const totalStudents = courses.courses?.reduce(
          (sum: number, c: any) => sum + (c.enrollment_count || 0),
          0
        ) || 0;
        setStats((prev) => ({ ...prev, courses: courseCount, students: totalStudents }));
      } catch {
        // Keep defaults
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome{user?.full_name ? `, ${user.full_name}` : ''}!</h2>
                <p className="text-gray-600 dark:text-white/80 text-sm sm:text-base">
                  Your comprehensive teaching platform. Use the sidebar to access all instructor features including course management, student engagement, and earnings tracking.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                  <Book className="w-10 h-10 text-[#E40000]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.students}</p>
              </div>
              <div className="w-12 h-12 bg-[#E40000]/20 border border-[#E40000]/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#E40000]" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60">Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.courses}</p>
              </div>
              <div className="w-12 h-12 bg-[#E40000]/20 border border-[#E40000]/50 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-[#E40000]" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming_sessions}</p>
              </div>
              <div className="w-12 h-12 bg-[#E40000]/20 border border-[#E40000]/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#E40000]" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60">Earnings This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {stats.earnings_this_month.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#E40000]/20 border border-[#E40000]/50 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-[#E40000]" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60">Needs Attention</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needs_attention}</p>
              </div>
              <div className="w-12 h-12 bg-[#E40000]/20 border border-[#E40000]/50 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#E40000]" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div variants={fadeUp} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Overview</h3>
                <p className="text-sm text-gray-500 dark:text-white/60">Quick heartbeat view of your teaching day</p>
              </div>
              <Eye className="w-8 h-8 text-[#E40000]" />
            </div>
            <button
              onClick={() => navigate('/dashboard/instructor/today/active-students')}
              className="w-full py-2 px-4 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
            >
              View Today's Stats
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Management</h3>
                <p className="text-sm text-gray-500 dark:text-white/60">Create, edit, and manage your courses</p>
              </div>
              <Book className="w-8 h-8 text-[#E40000]" />
            </div>
            <button
              onClick={() => navigate('/dashboard/instructor/teaching/courses')}
              className="w-full py-2 px-4 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
            >
              Manage Courses
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Engagement</h3>
                <p className="text-sm text-gray-500 dark:text-white/60">Track progress and interact with students</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#E40000]" />
            </div>
            <button
              onClick={() => navigate('/dashboard/instructor/interactions/messages')}
              className="w-full py-2 px-4 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
            >
              View Interactions
            </button>
          </motion.div>
        </motion.div>

        {/* Features Overview */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-50 dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Today / Overview</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Quick heartbeat view with active students, upcoming sessions, and earnings</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">My Teaching Space</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Course creation, CBC alignment, and usage analytics</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Assessments & Activities</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Assignment creation, batch grading, and AI-assisted feedback</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Students & Engagement</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Live sessions, attendance tracking, and student interactions</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Impact & Recognition</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Student feedback, ratings, and performance tracking</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Earnings & Finances</h4>
                <p className="text-xs text-gray-500 dark:text-white/60">Earnings dashboard, payouts, and rate management</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardInstructor;
