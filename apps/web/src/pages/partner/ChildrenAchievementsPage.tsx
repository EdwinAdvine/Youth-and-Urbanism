import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Shield,
  Flag,
  Download,
  Star,
  Trophy,
  Zap,
  Target,
  BookOpen,
  Calendar,
  User,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type TabType = 'certificates' | 'badges' | 'milestones';

interface Certificate {
  id: string;
  title: string;
  childName: string;
  course: string;
  date: string;
}

interface Badge {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  childName: string;
  earnedDate: string;
  color: string;
}

interface Milestone {
  id: string;
  title: string;
  childName: string;
  date: string;
  description: string;
}

const ChildrenAchievementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('certificates');

  const summaryStats = [
    {
      label: 'Total Certificates',
      value: '34',
      icon: Award,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Badges',
      value: '128',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Milestones Reached',
      value: '45',
      icon: Flag,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'Mathematics Excellence Award',
      childName: 'Sarah Mwangi',
      course: 'Advanced Mathematics - Grade 8',
      date: 'Feb 10, 2026',
    },
    {
      id: '2',
      title: 'Science Fair Winner',
      childName: 'Grace Kamau',
      course: 'Integrated Science - Grade 7',
      date: 'Feb 5, 2026',
    },
    {
      id: '3',
      title: 'Reading Champion',
      childName: 'James Omondi',
      course: 'English Language Arts - Grade 2',
      date: 'Jan 28, 2026',
    },
    {
      id: '4',
      title: 'Digital Literacy Proficiency',
      childName: 'Grace Kamau',
      course: 'Computer Studies - Grade 7',
      date: 'Jan 20, 2026',
    },
  ];

  const badges: Badge[] = [
    {
      id: '1',
      icon: Star,
      name: 'Top Performer',
      description: 'Scored above 90% in 5 consecutive assessments',
      childName: 'Sarah Mwangi',
      earnedDate: 'Feb 12, 2026',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      id: '2',
      icon: Zap,
      name: 'Speed Learner',
      description: 'Completed a full module in under 3 days',
      childName: 'Grace Kamau',
      earnedDate: 'Feb 8, 2026',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: '3',
      icon: Trophy,
      name: 'Quiz Master',
      description: 'Achieved perfect score on 3 quizzes',
      childName: 'Sarah Mwangi',
      earnedDate: 'Feb 3, 2026',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: '4',
      icon: Target,
      name: 'Goal Setter',
      description: 'Completed all weekly learning goals for a month',
      childName: 'Lucy Wanjiru',
      earnedDate: 'Jan 30, 2026',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: '5',
      icon: BookOpen,
      name: 'Bookworm',
      description: 'Read 20 articles in the digital library',
      childName: 'James Omondi',
      earnedDate: 'Jan 25, 2026',
      color: 'from-red-500 to-orange-500',
    },
    {
      id: '6',
      icon: Shield,
      name: 'Consistency King',
      description: 'Maintained a 30-day learning streak',
      childName: 'Grace Kamau',
      earnedDate: 'Jan 18, 2026',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Completed Grade 8 Term 1 Curriculum',
      childName: 'Sarah Mwangi',
      date: 'Feb 11, 2026',
      description: 'Successfully completed all subjects for Grade 8 Term 1 with an average score of 91%.',
    },
    {
      id: '2',
      title: 'First Coding Project Deployed',
      childName: 'Grace Kamau',
      date: 'Feb 6, 2026',
      description: 'Built and deployed a personal portfolio website using HTML, CSS, and JavaScript.',
    },
    {
      id: '3',
      title: 'Reading Level Advancement',
      childName: 'James Omondi',
      date: 'Jan 29, 2026',
      description: 'Advanced from Level 2 to Level 3 reading comprehension, exceeding grade expectations.',
    },
    {
      id: '4',
      title: '100th Lesson Completed',
      childName: 'Lucy Wanjiru',
      date: 'Jan 22, 2026',
      description: 'Reached the milestone of completing 100 lessons across all subjects on the platform.',
    },
    {
      id: '5',
      title: 'Peer Tutoring Achievement',
      childName: 'Sarah Mwangi',
      date: 'Jan 15, 2026',
      description: 'Successfully tutored 5 peers in Mathematics, improving their scores by an average of 15%.',
    },
  ];

  const tabs: { value: TabType; label: string; icon: React.ElementType }[] = [
    { value: 'certificates', label: 'Certificates', icon: Award },
    { value: 'badges', label: 'Badges', icon: Shield },
    { value: 'milestones', label: 'Milestones', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
          <p className="text-gray-600 dark:text-white/70">
            Celebrate the accomplishments and growth of your sponsored children
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {summaryStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-2 inline-flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {certificates.map((cert) => (
              <motion.div
                key={cert.id}
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-red-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg">
                      <Award className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">{cert.course}</p>
                    </div>
                  </div>
                  <button className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2F34] transition-colors">
                    <Download className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#22272B]">
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
                    <User className="w-3.5 h-3.5" />
                    {cert.childName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                    <Calendar className="w-3 h-3" />
                    {cert.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  variants={fadeUp}
                  className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${badge.color} rounded-xl`}
                    >
                      <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{badge.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-white/40">{badge.earnedDate}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{badge.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40 pt-3 border-t border-gray-200 dark:border-[#22272B]">
                    <User className="w-3.5 h-3.5" />
                    {badge.childName}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                variants={fadeUp}
                className="flex gap-4"
              >
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Flag className="w-4 h-4 text-red-400" />
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-100 dark:bg-[#22272B] mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 flex-1 mb-2 hover:border-red-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{milestone.title}</h3>
                    <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1 flex-shrink-0 ml-4">
                      <Calendar className="w-3 h-3" />
                      {milestone.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-2">{milestone.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
                    <User className="w-3.5 h-3.5" />
                    {milestone.childName}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChildrenAchievementsPage;
