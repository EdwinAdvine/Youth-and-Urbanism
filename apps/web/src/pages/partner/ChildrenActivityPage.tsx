import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Activity,
  Zap,
  CheckCircle,
  BookOpen,
  Brain,
  FileText,
  HelpCircle,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type ActivityType = 'lesson' | 'quiz' | 'assignment' | 'ai-tutor';
type PeriodFilter = 'day' | 'week' | 'month';

interface ActivityItem {
  id: string;
  timestamp: string;
  childName: string;
  type: ActivityType;
  description: string;
  duration: string;
}

const ChildrenActivityPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodFilter>('week');

  const stats = [
    {
      label: 'Total Hours',
      value: '124',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Average Sessions',
      value: '3.2/day',
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Active Streak',
      value: '12 days',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Completion Rate',
      value: '87%',
      icon: CheckCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      timestamp: 'Today, 2:45 PM',
      childName: 'Sarah Mwangi',
      type: 'lesson',
      description: 'Completed "Introduction to Algebra" lesson in Mathematics',
      duration: '45 min',
    },
    {
      id: '2',
      timestamp: 'Today, 1:30 PM',
      childName: 'James Omondi',
      type: 'ai-tutor',
      description: 'AI tutor session on English reading comprehension',
      duration: '30 min',
    },
    {
      id: '3',
      timestamp: 'Today, 11:15 AM',
      childName: 'Grace Kamau',
      type: 'quiz',
      description: 'Scored 92% on "Chemical Reactions" quiz in Science',
      duration: '20 min',
    },
    {
      id: '4',
      timestamp: 'Today, 10:00 AM',
      childName: 'Sarah Mwangi',
      type: 'assignment',
      description: 'Submitted "Kenya\'s Independence" essay in Social Studies',
      duration: '60 min',
    },
    {
      id: '5',
      timestamp: 'Yesterday, 4:20 PM',
      childName: 'David Kiprono',
      type: 'lesson',
      description: 'Started "Creative Writing Basics" lesson in English',
      duration: '35 min',
    },
    {
      id: '6',
      timestamp: 'Yesterday, 3:00 PM',
      childName: 'Lucy Wanjiru',
      type: 'quiz',
      description: 'Completed "Fractions & Decimals" assessment with 85%',
      duration: '25 min',
    },
    {
      id: '7',
      timestamp: 'Yesterday, 1:45 PM',
      childName: 'Michael Otieno',
      type: 'ai-tutor',
      description: 'Interactive learning session on basic shapes and colors',
      duration: '20 min',
    },
    {
      id: '8',
      timestamp: 'Yesterday, 10:30 AM',
      childName: 'Grace Kamau',
      type: 'assignment',
      description: 'Submitted Python coding challenge for Digital Literacy',
      duration: '50 min',
    },
  ];

  const typeConfig: Record<ActivityType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    lesson: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Lesson' },
    quiz: { icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Quiz' },
    assignment: { icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Assignment' },
    'ai-tutor': { icon: Brain, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'AI Tutor' },
  };

  const periods: { value: PeriodFilter; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Children Activity</h1>
          <p className="text-gray-600 dark:text-white/70">
            Track daily learning activities and engagement across all sponsored children
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-2 inline-flex gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
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

        {/* Activity List */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Recent Activities</h2>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {activities.map((activity) => {
                const config = typeConfig[activity.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={activity.id}
                    variants={fadeUp}
                    className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-xl hover:border-gray-200 dark:hover:border-[#2A2F34]/80 transition-colors"
                  >
                    <div className={`p-2.5 rounded-lg ${config.bg} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{activity.childName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {activity.duration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildrenActivityPage;
