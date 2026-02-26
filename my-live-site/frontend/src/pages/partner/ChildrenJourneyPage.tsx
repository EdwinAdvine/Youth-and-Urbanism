import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  ChevronDown,
  MessageSquare,
  Calculator,
  FlaskConical,
  Globe,
  Monitor,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Child {
  id: string;
  name: string;
  grade: string;
  overallProgress: number;
  competencies: {
    name: string;
    icon: React.ElementType;
    progress: number;
    color: string;
  }[];
  strengths: string[];
  areasForGrowth: string[];
}

const ChildrenJourneyPage: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string>('1');

  const children: Child[] = [
    {
      id: '1',
      name: 'Sarah Mwangi',
      grade: 'Grade 8',
      overallProgress: 87,
      competencies: [
        { name: 'Communication', icon: MessageSquare, progress: 92, color: 'from-blue-500 to-blue-400' },
        { name: 'Mathematics', icon: Calculator, progress: 88, color: 'from-purple-500 to-purple-400' },
        { name: 'Science', icon: FlaskConical, progress: 85, color: 'from-green-500 to-green-400' },
        { name: 'Social Studies', icon: Globe, progress: 80, color: 'from-amber-500 to-amber-400' },
        { name: 'Digital Literacy', icon: Monitor, progress: 90, color: 'from-cyan-500 to-cyan-400' },
      ],
      strengths: [
        'Critical thinking',
        'Mathematical reasoning',
        'Digital fluency',
        'Collaborative learning',
        'Creative writing',
      ],
      areasForGrowth: [
        'Public speaking confidence',
        'Historical analysis depth',
        'Lab report documentation',
      ],
    },
    {
      id: '2',
      name: 'James Omondi',
      grade: 'Grade 2',
      overallProgress: 74,
      competencies: [
        { name: 'Communication', icon: MessageSquare, progress: 78, color: 'from-blue-500 to-blue-400' },
        { name: 'Mathematics', icon: Calculator, progress: 70, color: 'from-purple-500 to-purple-400' },
        { name: 'Science', icon: FlaskConical, progress: 72, color: 'from-green-500 to-green-400' },
        { name: 'Social Studies', icon: Globe, progress: 76, color: 'from-amber-500 to-amber-400' },
        { name: 'Digital Literacy', icon: Monitor, progress: 68, color: 'from-cyan-500 to-cyan-400' },
      ],
      strengths: [
        'Curiosity and exploration',
        'Verbal expression',
        'Number recognition',
      ],
      areasForGrowth: [
        'Reading comprehension',
        'Written expression',
        'Basic computer skills',
        'Time management',
      ],
    },
    {
      id: '3',
      name: 'Grace Kamau',
      grade: 'Grade 7',
      overallProgress: 91,
      competencies: [
        { name: 'Communication', icon: MessageSquare, progress: 94, color: 'from-blue-500 to-blue-400' },
        { name: 'Mathematics', icon: Calculator, progress: 90, color: 'from-purple-500 to-purple-400' },
        { name: 'Science', icon: FlaskConical, progress: 93, color: 'from-green-500 to-green-400' },
        { name: 'Social Studies', icon: Globe, progress: 86, color: 'from-amber-500 to-amber-400' },
        { name: 'Digital Literacy', icon: Monitor, progress: 95, color: 'from-cyan-500 to-cyan-400' },
      ],
      strengths: [
        'Programming aptitude',
        'Scientific inquiry',
        'Leadership skills',
        'Peer tutoring',
      ],
      areasForGrowth: [
        'Artistic expression',
        'Physical education engagement',
      ],
    },
  ];

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Journey</h1>
          <p className="text-gray-600 dark:text-white/70">
            Track CBC-aligned learning progress and competency development
          </p>
        </motion.div>

        {/* Child Selector */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-600 dark:text-white/70">Select Child:</span>
              <div className="relative">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} - {child.grade}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
              </div>
              <span className="text-2xl font-bold text-red-400">{selectedChild.overallProgress}%</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${selectedChild.overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* CBC Competencies */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">CBC Competencies</h2>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {selectedChild.competencies.map((competency, index) => (
                <motion.div key={index} variants={fadeUp} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                        <competency.icon className="w-4 h-4 text-gray-600 dark:text-white/70" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{competency.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{competency.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden ml-11">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${competency.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${competency.progress}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Weekly Progress Chart Placeholder */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Progress</h2>
            </div>
            <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2A2F34]">
              <p className="text-sm text-gray-400 dark:text-white/40">
                Chart will be integrated with PartnerChart component
              </p>
            </div>
          </div>
        </motion.div>

        {/* Strengths and Areas for Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Strengths */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedChild.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Areas for Growth */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Growth</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedChild.areasForGrowth.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenJourneyPage;
