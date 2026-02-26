import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Brain,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface PartnerGoal {
  id: string;
  goal: string;
  childName: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed';
}

interface AIMilestone {
  id: string;
  milestone: string;
  suggestedDate: string;
  confidence: number;
  childName: string;
}

const ChildrenGoalsPage: React.FC = () => {
  const [_addGoalOpen] = useState(false);

  const partnerGoals: PartnerGoal[] = [
    {
      id: '1',
      goal: 'Achieve 90% average score in Mathematics by end of term',
      childName: 'Sarah Mwangi',
      targetDate: 'Apr 15, 2026',
      progress: 82,
      status: 'active',
    },
    {
      id: '2',
      goal: 'Complete all Grade 2 reading modules',
      childName: 'James Omondi',
      targetDate: 'Mar 30, 2026',
      progress: 65,
      status: 'active',
    },
    {
      id: '3',
      goal: 'Build and deploy a personal website using HTML and CSS',
      childName: 'Grace Kamau',
      targetDate: 'Feb 28, 2026',
      progress: 100,
      status: 'completed',
    },
    {
      id: '4',
      goal: 'Improve Science assessment scores by 20% from baseline',
      childName: 'David Kiprono',
      targetDate: 'May 10, 2026',
      progress: 40,
      status: 'active',
    },
    {
      id: '5',
      goal: 'Participate in at least 3 peer tutoring sessions per month',
      childName: 'Lucy Wanjiru',
      targetDate: 'Mar 15, 2026',
      progress: 100,
      status: 'completed',
    },
  ];

  const aiMilestones: AIMilestone[] = [
    {
      id: '1',
      milestone: 'Sarah is likely to master algebraic equations within 2 weeks based on current learning pace',
      suggestedDate: 'Feb 28, 2026',
      confidence: 92,
      childName: 'Sarah Mwangi',
    },
    {
      id: '2',
      milestone: 'James shows strong potential for advancing to Level 4 reading comprehension',
      suggestedDate: 'Mar 10, 2026',
      confidence: 78,
      childName: 'James Omondi',
    },
    {
      id: '3',
      milestone: 'Grace is ready to begin learning Python basics after completing web fundamentals',
      suggestedDate: 'Mar 5, 2026',
      confidence: 88,
      childName: 'Grace Kamau',
    },
    {
      id: '4',
      milestone: 'David would benefit from a structured Science lab project to reinforce theoretical concepts',
      suggestedDate: 'Mar 20, 2026',
      confidence: 71,
      childName: 'David Kiprono',
    },
  ];

  const getStatusBadge = (status: 'active' | 'completed') => {
    if (status === 'completed') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        Active
      </span>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-amber-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Goals & Milestones</h1>
            <p className="text-gray-600 dark:text-white/70">
              Set learning goals and track AI-suggested milestones for your sponsored children
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </motion.div>

        {/* Partner Goals Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <Target className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Goals</h2>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {partnerGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  variants={fadeUp}
                  className="p-4 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-xl hover:border-red-500/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex-1 mr-4">{goal.goal}</p>
                    {getStatusBadge(goal.status)}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 dark:text-white/40">Progress</span>
                      <span className="text-xs text-gray-900 dark:text-white font-medium">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-white dark:bg-[#181C1F] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.status === 'completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      {goal.childName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Target: {goal.targetDate}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* AI-Suggested Milestones Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Suggested Milestones</h2>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                Powered by AI
              </span>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {aiMilestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  variants={fadeUp}
                  className="p-4 bg-gray-100 dark:bg-[#22272B] border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70 flex-1">{milestone.milestone}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40 ml-11">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        {milestone.childName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {milestone.suggestedDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-3.5 h-3.5 ${getConfidenceColor(milestone.confidence)}`} />
                      <span className={`font-medium ${getConfidenceColor(milestone.confidence)}`}>
                        {milestone.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildrenGoalsPage;
