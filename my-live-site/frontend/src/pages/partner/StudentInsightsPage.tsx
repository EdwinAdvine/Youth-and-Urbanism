import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Trend = 'improving' | 'stable' | 'declining';

interface StudentInsight {
  id: string;
  name: string;
  grade: string;
  learningStyle: string;
  engagementScore: number;
  trend: Trend;
  topStrength: string;
  recommendation: string;
  details: {
    averageScore: number;
    sessionsPerWeek: number;
    completionRate: number;
    strongSubjects: string[];
    weakSubjects: string[];
    aiSummary: string;
  };
}

const StudentInsightsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const overviewStats = [
    { label: 'Total Analyzed', value: 247, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Improving', value: 189, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Stable', value: 40, icon: Minus, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Declining', value: 18, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const students: StudentInsight[] = [
    {
      id: '1',
      name: 'Amara Ochieng',
      grade: 'Grade 6',
      learningStyle: 'Visual',
      engagementScore: 92,
      trend: 'improving',
      topStrength: 'Mathematics & Logical Reasoning',
      recommendation: 'Ready for advanced problem-solving challenges. Consider STEM enrichment modules.',
      details: {
        averageScore: 88,
        sessionsPerWeek: 5,
        completionRate: 96,
        strongSubjects: ['Mathematics', 'Science', 'Digital Literacy'],
        weakSubjects: ['Kiswahili'],
        aiSummary: 'Amara demonstrates exceptional analytical skills and consistent engagement. Her math scores have improved 15% over the last 3 months. Recommend introducing advanced coding exercises.',
      },
    },
    {
      id: '2',
      name: 'Brian Kimani',
      grade: 'Grade 4',
      learningStyle: 'Kinesthetic',
      engagementScore: 78,
      trend: 'stable',
      topStrength: 'Creative Arts & Expression',
      recommendation: 'Incorporate more hands-on activities to boost engagement in core subjects.',
      details: {
        averageScore: 72,
        sessionsPerWeek: 3,
        completionRate: 81,
        strongSubjects: ['Art', 'Music', 'Physical Education'],
        weakSubjects: ['Mathematics', 'English'],
        aiSummary: 'Brian thrives in creative and physical activities. His engagement is stable but could improve with gamified learning approaches for math and English.',
      },
    },
    {
      id: '3',
      name: 'Faith Wanjiru',
      grade: 'Grade 7',
      learningStyle: 'Auditory',
      engagementScore: 95,
      trend: 'improving',
      topStrength: 'Languages & Communication',
      recommendation: 'Excellent candidate for peer tutoring program and debate club.',
      details: {
        averageScore: 91,
        sessionsPerWeek: 6,
        completionRate: 98,
        strongSubjects: ['English', 'Kiswahili', 'Social Studies'],
        weakSubjects: ['Science'],
        aiSummary: 'Faith is a top performer with outstanding verbal skills. She has shown 20% improvement in overall scores this term. Her leadership potential is evident in group activities.',
      },
    },
    {
      id: '4',
      name: 'David Mutua',
      grade: 'Grade 5',
      learningStyle: 'Read/Write',
      engagementScore: 58,
      trend: 'declining',
      topStrength: 'Reading Comprehension',
      recommendation: 'Schedule a check-in session. May benefit from additional mentorship support.',
      details: {
        averageScore: 64,
        sessionsPerWeek: 2,
        completionRate: 62,
        strongSubjects: ['English Reading'],
        weakSubjects: ['Mathematics', 'Science', 'Kiswahili'],
        aiSummary: 'David\'s engagement has dropped over the past month. His session frequency decreased from 4 to 2 per week. Environmental factors may be contributing. Immediate intervention recommended.',
      },
    },
    {
      id: '5',
      name: 'Grace Akinyi',
      grade: 'Grade 8',
      learningStyle: 'Visual',
      engagementScore: 87,
      trend: 'improving',
      topStrength: 'Science & Technology',
      recommendation: 'Preparing well for KCPE. Focus on timed practice exams for exam readiness.',
      details: {
        averageScore: 85,
        sessionsPerWeek: 5,
        completionRate: 93,
        strongSubjects: ['Science', 'Mathematics', 'Social Studies'],
        weakSubjects: ['Creative Arts'],
        aiSummary: 'Grace is showing strong KCPE preparation momentum. Her science scores improved by 18% this term. She responds well to visual aids and diagram-based learning.',
      },
    },
  ];

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-yellow-400" />;
      case 'declining':
        return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    }
  };

  const getTrendLabel = (trend: Trend) => {
    const config: Record<Trend, { label: string; color: string }> = {
      improving: { label: 'Improving', color: 'text-green-400' },
      stable: { label: 'Stable', color: 'text-yellow-400' },
      declining: { label: 'Declining', color: 'text-red-400' },
    };
    return config[trend];
  };

  const getLearningStyleBadge = (style: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      Visual: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      Kinesthetic: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
      Auditory: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
      'Read/Write': { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    };
    const c = config[style] || { bg: 'bg-gray-50 dark:bg-white/5', text: 'text-gray-500 dark:text-white/60' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {style}
      </span>
    );
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Brain className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student AI Insights</h1>
          </div>
          <p className="text-gray-500 dark:text-white/60">AI-powered analytics across all sponsored children</p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
            />
          </div>
        </motion.div>

        {/* Student Insight Cards */}
        <motion.div variants={stagger} className="space-y-4">
          {filteredStudents.map((student) => {
            const isExpanded = expandedCard === student.id;
            const trendInfo = getTrendLabel(student.trend);

            return (
              <motion.div
                key={student.id}
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden hover:border-[#E40000]/30 transition-colors"
              >
                {/* Main Card */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : student.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                        <span className="text-xs text-gray-400 dark:text-white/40 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded">
                          {student.grade}
                        </span>
                        {getLearningStyleBadge(student.learningStyle)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Engagement Score */}
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40 mb-1.5">Engagement Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  student.engagementScore >= 80
                                    ? 'bg-green-500'
                                    : student.engagementScore >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${student.engagementScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.engagementScore}%</span>
                          </div>
                        </div>

                        {/* Trend */}
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40 mb-1.5">Progress Trend</p>
                          <div className="flex items-center gap-1.5">
                            {getTrendIcon(student.trend)}
                            <span className={`text-sm font-medium ${trendInfo.color}`}>{trendInfo.label}</span>
                          </div>
                        </div>

                        {/* Top Strength */}
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40 mb-1.5">Top Strength</p>
                          <p className="text-sm text-gray-900 dark:text-white">{student.topStrength}</p>
                        </div>

                        {/* Recommendation */}
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40 mb-1.5">Key Recommendation</p>
                          <p className="text-sm text-gray-600 dark:text-white/70">{student.recommendation}</p>
                        </div>
                      </div>
                    </div>

                    <button className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 dark:text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-[#22272B] bg-[#141719] p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40">Average Score</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.details.averageScore}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <BookOpen className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40">Sessions / Week</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.details.sessionsPerWeek}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-white/40">Completion Rate</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.details.completionRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-white/40 mb-2">Strong Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {student.details.strongSubjects.map((subject) => (
                            <span
                              key={subject}
                              className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-white/40 mb-2">Needs Improvement</p>
                        <div className="flex flex-wrap gap-2">
                          {student.details.weakSubjects.map((subject) => (
                            <span
                              key={subject}
                              className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <p className="text-xs font-medium text-amber-400">AI Analysis</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{student.details.aiSummary}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {filteredStudents.length === 0 && (
          <motion.div variants={fadeUp}>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No students found</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">Try adjusting your search query</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentInsightsPage;
