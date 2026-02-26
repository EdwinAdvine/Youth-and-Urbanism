import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Award,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Eye,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Palette,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ChildInsights {
  id: string;
  name: string;
  grade: string;
  learningStyle: string;
  learningStyleDescription: string;
  strengths: { text: string; icon: React.ElementType }[];
  supportTips: string[];
  upcomingTopics: { topic: string; subject: string }[];
  earlyWarnings: { message: string; severity: 'low' | 'medium' | 'high' }[];
  curiosityPatterns: string[];
}

const ChildrenAIInsightsPage: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string>('1');

  const childrenData: ChildInsights[] = [
    {
      id: '1',
      name: 'Sarah Mwangi',
      grade: 'Grade 8',
      learningStyle: 'Visual Learner',
      learningStyleDescription:
        'Sarah processes information most effectively through visual aids such as diagrams, charts, and color-coded notes. She retains 40% more information when content includes visual elements.',
      strengths: [
        { text: 'Exceptional pattern recognition in Mathematics', icon: Target },
        { text: 'Strong analytical writing with structured arguments', icon: MessageSquare },
        { text: 'Quick adoption of new digital tools and platforms', icon: Zap },
        { text: 'Natural ability to explain complex concepts to peers', icon: Award },
      ],
      supportTips: [
        'Provide more infographic-style study materials to leverage her visual processing strength',
        'Encourage participation in inter-school debate competitions to build public speaking confidence',
        'Introduce mind-mapping tools for her Science revision sessions',
      ],
      upcomingTopics: [
        { topic: 'Quadratic Equations', subject: 'Mathematics' },
        { topic: 'Photosynthesis & Cellular Respiration', subject: 'Science' },
        { topic: 'Essay Writing: Persuasive Techniques', subject: 'English' },
      ],
      earlyWarnings: [
        {
          message: 'Slight decline in Social Studies engagement over the past 2 weeks',
          severity: 'low',
        },
        {
          message: 'Homework submission timing has shifted later in the evenings',
          severity: 'medium',
        },
      ],
      curiosityPatterns: [
        'Space exploration and astronomy',
        'Environmental conservation',
        'Artificial intelligence and robotics',
        'Ancient African civilizations',
        'Coding and app development',
      ],
    },
    {
      id: '2',
      name: 'James Omondi',
      grade: 'Grade 2',
      learningStyle: 'Kinesthetic Learner',
      learningStyleDescription:
        'James learns best through hands-on activities and physical movement. He shows significantly higher engagement during interactive lessons and practical exercises.',
      strengths: [
        { text: 'Excellent hands-on problem solving abilities', icon: Target },
        { text: 'Strong verbal communication for his age group', icon: MessageSquare },
        { text: 'Enthusiastic participation in group activities', icon: Award },
        { text: 'Creative storytelling with vivid imagination', icon: Palette },
      ],
      supportTips: [
        'Incorporate more physical counting aids and manipulatives for Math lessons',
        'Use read-aloud sessions with role-playing to boost reading comprehension',
        'Allow movement breaks every 20 minutes during study sessions',
      ],
      upcomingTopics: [
        { topic: 'Addition and Subtraction within 100', subject: 'Mathematics' },
        { topic: 'Reading Short Stories', subject: 'English' },
        { topic: 'My Community Helpers', subject: 'Social Studies' },
      ],
      earlyWarnings: [],
      curiosityPatterns: [
        'Animals and nature',
        'Building and construction',
        'Music and rhythm',
        'Outdoor adventures',
      ],
    },
  ];

  const children = childrenData.map((c) => ({ id: c.id, name: c.name, grade: c.grade }));
  const selectedChild = childrenData.find((c) => c.id === selectedChildId) || childrenData[0];

  const getSeverityStyle = (severity: 'low' | 'medium' | 'high') => {
    const styles = {
      low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', label: 'Low' },
      medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', label: 'Medium' },
      high: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'High' },
    };
    return styles[severity];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h1>
          <p className="text-gray-600 dark:text-white/70">
            AI-powered analysis of learning patterns, strengths, and personalized recommendations
          </p>
        </motion.div>

        {/* Child Selector */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
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

        {/* Insight Cards Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Learning Style Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-purple-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Learning Style</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">AI-identified preference</p>
              </div>
            </div>
            <div className="mb-3">
              <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm font-semibold">
                {selectedChild.learningStyle}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">
              {selectedChild.learningStyleDescription}
            </p>
          </motion.div>

          {/* Strengths Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-green-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Strengths</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">Key areas of excellence</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedChild.strengths.map((strength, index) => {
                const Icon = strength.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-500/10 rounded-md flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70">{strength.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Support Tips Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-amber-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Support Tips</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">AI-generated recommendations</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedChild.supportTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <span className="text-amber-400 font-bold text-sm flex-shrink-0 mt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-gray-600 dark:text-white/70">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Topics Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Topics</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">Next in the learning path</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedChild.upcomingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{topic.topic}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/40 bg-white dark:bg-[#181C1F] px-2 py-1 rounded">
                    {topic.subject}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Early Warnings Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-red-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Early Warnings</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">Potential areas of concern</p>
              </div>
            </div>
            {selectedChild.earlyWarnings.length > 0 ? (
              <div className="space-y-3">
                {selectedChild.earlyWarnings.map((warning, index) => {
                  const style = getSeverityStyle(warning.severity);
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 ${style.bg} border ${style.border} rounded-lg`}
                    >
                      <AlertTriangle className={`w-4 h-4 ${style.text} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-white/70">{warning.message}</p>
                        <span className={`text-xs font-medium ${style.text} mt-1 inline-block`}>
                          Severity: {style.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-400/40 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-white/40">No warnings at this time</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Curiosity Patterns Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-cyan-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Curiosity Patterns</h2>
                <p className="text-xs text-gray-400 dark:text-white/40">Topics showing strong interest</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedChild.curiosityPatterns.map((pattern, index) => {
                const colors = [
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                  'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  'bg-green-500/10 text-green-400 border-green-500/20',
                  'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  'bg-pink-500/10 text-pink-400 border-pink-500/20',
                ];
                return (
                  <span
                    key={index}
                    className={`px-3 py-1.5 border rounded-full text-sm font-medium ${
                      colors[index % colors.length]
                    }`}
                  >
                    {pattern}
                  </span>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildrenAIInsightsPage;
