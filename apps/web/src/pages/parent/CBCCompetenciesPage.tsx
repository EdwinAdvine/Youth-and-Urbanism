/**
 * CBC Competencies Page
 *
 * Displays the 7 CBC (Competency-Based Curriculum) competency scores
 * for the selected child, featuring a large radar chart hero section
 * and detailed competency cards with trends.
 *
 * Route: /dashboard/parent/cbc-competencies
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Users, RefreshCw, TrendingUp, TrendingDown,
  Minus, ArrowLeft,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import CBCRadarChart from '../../components/parent/children/CBCRadarChart';
import { getCBCCompetencies } from '../../services/parentChildrenService';
import type { LearningJourneyResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Descriptions for the 7 CBC competencies */
const competencyDescriptions: Record<string, string> = {
  'Communication': 'Ability to express ideas clearly through speaking, listening, reading, and writing in various contexts.',
  'Mathematics': 'Proficiency in numerical concepts, problem-solving, logical reasoning, and application of mathematical skills.',
  'Science & Technology': 'Understanding of scientific inquiry, technological literacy, and application of STEM concepts.',
  'Social Studies': 'Awareness of society, citizenship, cultural heritage, and understanding of the world around us.',
  'Creative Arts': 'Expression through visual arts, music, drama, and creative thinking across various media.',
  'Physical Education': 'Physical fitness, motor skills development, sports knowledge, and healthy lifestyle habits.',
  'Religious Education': 'Moral values, spiritual growth, ethical reasoning, and understanding of diverse beliefs.',
};

const CBCCompetenciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [data, setData] = useState<LearningJourneyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  useEffect(() => {
    if (selectedChildId) {
      loadCompetencies();
    } else {
      setLoading(false);
    }
  }, [selectedChildId]);

  const loadCompetencies = async () => {
    if (!selectedChildId) return;

    try {
      setLoading(true);
      const response = await getCBCCompetencies(selectedChildId);
      setData(response);
    } catch (error) {
      console.error('Failed to load CBC competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-500/20 text-green-500';
      case 'declining':
        return 'bg-red-500/20 text-red-500';
      case 'stable':
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  if (!selectedChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view CBC competencies</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            View Children
          </button>
        </div>
      </>
    );
  }

  const competencies = data?.cbc_competencies || [];
  const overallScore =
    competencies.length > 0
      ? competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length
      : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent/learning-journey')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Learning Journey</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CBC Competency Snapshot</h1>
                {selectedChild && (
                  <p className="text-gray-500 dark:text-white/60 mt-1">{selectedChild.full_name}</p>
                )}
              </div>
            </div>
            <button
              onClick={loadCompetencies}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/15 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Overall CBC Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
              Average across {competencies.length} competencies
            </p>
          </div>
        </motion.div>

        {/* Large Radar Chart Hero */}
        {competencies.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <CBCRadarChart competencies={competencies} showLegend={false} />
          </motion.div>
        )}

        {/* Competency Detail Cards */}
        {competencies.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Competency Breakdown</h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {competencies.map((comp) => (
                <motion.div
                  key={comp.name}
                  variants={fadeUp}
                  className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{comp.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                        {competencyDescriptions[comp.name] || comp.description || ''}
                      </p>
                    </div>
                    <span className={`text-2xl font-bold ml-4 ${getScoreColor(comp.score)}`}>
                      {comp.score.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2.5 mb-3">
                    <div
                      className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2.5 rounded-full transition-all"
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center gap-2">
                    {getTrendIcon(comp.trend)}
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getTrendColor(comp.trend)}`}>
                      {comp.trend || 'stable'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {competencies.length === 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No CBC competency data yet
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                CBC competency scores will be generated as your child completes assessments and learning activities.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CBCCompetenciesPage;
