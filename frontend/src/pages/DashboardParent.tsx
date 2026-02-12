import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BarChart3, Calendar, Award, Eye } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DashboardParent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout role="parent">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-[#22272B] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to Parent Dashboard!</h2>
                <p className="text-white/80 text-sm sm:text-base">
                  Your comprehensive view of your child's learning journey. Use the sidebar to navigate through all features.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-[#E40000]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div variants={fadeUp}>
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Today's Overview</h3>
                  <p className="text-sm text-white/60">Quick status of all children</p>
                </div>
                <Eye className="w-8 h-8 text-[#E40000]" />
              </div>
              <button
                onClick={() => navigate('/dashboard/parent/today/status')}
                className="w-full py-2 px-4 bg-[#E40000] text-white rounded-lg hover:bg-[#FF0000] transition-colors"
              >
                View Status
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  <p className="text-sm text-white/60">Your child's AI Tutor summary</p>
                </div>
                <BarChart3 className="w-8 h-8 text-[#E40000]" />
              </div>
              <button
                onClick={() => navigate('/dashboard/parent/ai/summary')}
                className="w-full py-2 px-4 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
              >
                View Insights
              </button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Communications</h3>
                  <p className="text-sm text-white/60">Messages & notifications</p>
                </div>
                <Calendar className="w-8 h-8 text-[#E40000]" />
              </div>
              <button
                onClick={() => navigate('/dashboard/parent/communications/inbox')}
                className="w-full py-2 px-4 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors"
              >
                View Messages
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Overview */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Available Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">My Children</h4>
                <p className="text-xs text-white/60">Overview cards and quick switching between children</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">Learning Journey</h4>
                <p className="text-xs text-white/60">Current focus areas, weekly stories, and competency tracking</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">Daily Activity</h4>
                <p className="text-xs text-white/60">Time spent, sessions, streaks, and engagement tracking</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">Achievements</h4>
                <p className="text-xs text-white/60">Certificates, badges, and growth milestones</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">Goals & Expectations</h4>
                <p className="text-xs text-white/60">Family goals and AI-suggested milestones</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-[#22272B] rounded-lg">
                <h4 className="font-medium text-white mb-2">Finance & Plans</h4>
                <p className="text-xs text-white/60">Subscription management and payment history</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardParent;
