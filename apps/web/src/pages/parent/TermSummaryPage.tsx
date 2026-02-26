/**
 * Term Summary Page
 *
 * Shows term progress summary for a selected child, including
 * subject cards with grades, progress bars, overall GPA,
 * and AI commentary.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
  Minus, Sparkles,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getTermSummary } from '../../services/parentReportsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

interface SubjectData {
  name: string;
  grade: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface TermSummaryData {
  child_id: string;
  child_name: string;
  term: string;
  academic_year: string;
  subjects: SubjectData[];
  cbc_competencies: { name: string; level: string }[];
  attendance_rate: number;
  overall_grade: number;
  teacher_comment: string | null;
  ai_analysis: string | null;
}

const TermSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();

  const [summary, setSummary] = useState<TermSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  useEffect(() => {
    if (selectedChildId) {
      loadSummary();
    }
  }, [selectedChildId, selectedTerm]);

  const loadSummary = async () => {
    if (!selectedChildId) return;
    try {
      setLoading(true);
      const data = await getTermSummary(selectedChildId, selectedTerm);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load term summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400 dark:text-white/40" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!selectedChildId) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No child selected</h3>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Please select a child from the sidebar to view their term summary.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent/reports')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Reports</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Term Progress Summary</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  {summary?.child_name || 'Loading...'} - {summary?.academic_year || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Term Selector */}
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#E40000]"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <button
                onClick={loadSummary}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {summary ? (
          <>
            {/* Overall Grade & Attendance */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-2">Overall Grade</p>
                  <p className={`text-4xl font-bold ${getScoreColor(summary.overall_grade)}`}>
                    {summary.overall_grade.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 dark:text-white/40 text-xs mt-1">
                    GPA: {(summary.overall_grade / 20).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-2">Attendance Rate</p>
                  <p className={`text-4xl font-bold ${getScoreColor(summary.attendance_rate)}`}>
                    {summary.attendance_rate.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 dark:text-white/40 text-xs mt-1">
                    {selectedTerm} {summary.academic_year}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Subject Cards Grid */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Subjects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.subjects.map((subject, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-gray-900 dark:text-white font-medium">{subject.name}</h4>
                      {getTrendIcon(subject.trend)}
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(subject.score)}`}>
                        {subject.score}%
                      </span>
                      <span className="text-gray-400 dark:text-white/40 text-sm mb-0.5">
                        Grade: {subject.grade}
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(subject.score)}`}
                        style={{ width: `${subject.score}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Commentary */}
            {summary.ai_analysis && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-gradient-to-r from-[#E40000]/10 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#E40000] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AI Insights</h3>
                      <p className="text-gray-700 dark:text-white/80 text-sm leading-relaxed">
                        {summary.ai_analysis}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Teacher Comment */}
            {summary.teacher_comment && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Teacher's Comment</h3>
                  <p className="text-gray-700 dark:text-white/80 text-sm leading-relaxed italic">
                    "{summary.teacher_comment}"
                  </p>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No term summary available
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Term summary data will appear once assessments are recorded.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TermSummaryPage;
