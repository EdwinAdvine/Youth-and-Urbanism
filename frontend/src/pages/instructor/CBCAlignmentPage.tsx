import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Target } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { CBCAlignmentBadge } from '../../components/instructor/courses/CBCAlignmentBadge';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CBCCompetency {
  code: string;
  name: string;
  description: string;
  status: 'covered' | 'partial' | 'missing';
}

interface CBCAnalysis {
  id: string;
  course_id: string;
  course_title: string;
  alignment_score: number;
  competencies_covered: CBCCompetency[];
  competencies_missing: CBCCompetency[];
  suggestions: string[];
  ai_model_used: string;
  analysis_date: string;
}

export const CBCAlignmentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [analysis, setAnalysis] = useState<CBCAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchAnalysis();
    }
  }, [courseId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/v1/instructor/courses/${courseId}/cbc-analysis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mock data for development
      if (!response.data) {
        setAnalysis({
          id: '1',
          course_id: courseId || '1',
          course_title: 'Introduction to Mathematics - Grade 7',
          alignment_score: 78,
          competencies_covered: [
            {
              code: 'MAT-7.1.1',
              name: 'Number Patterns',
              description: 'Identify and describe number patterns',
              status: 'covered',
            },
            {
              code: 'MAT-7.1.2',
              name: 'Linear Equations',
              description: 'Solve simple linear equations',
              status: 'covered',
            },
            {
              code: 'MAT-7.2.1',
              name: 'Geometric Shapes',
              description: 'Identify and classify 2D and 3D shapes',
              status: 'partial',
            },
            {
              code: 'MAT-7.3.1',
              name: 'Data Representation',
              description: 'Create and interpret graphs and charts',
              status: 'covered',
            },
          ],
          competencies_missing: [
            {
              code: 'MAT-7.2.2',
              name: 'Angle Measurement',
              description: 'Measure and calculate angles in various shapes',
              status: 'missing',
            },
            {
              code: 'MAT-7.3.2',
              name: 'Probability',
              description: 'Understand and calculate basic probability',
              status: 'missing',
            },
          ],
          suggestions: [
            'Add a module on angle measurement and geometric constructions to fully cover geometry competencies',
            'Include probability exercises and real-world examples to meet statistical reasoning standards',
            'Consider adding more word problems to strengthen problem-solving competencies',
            'Incorporate collaborative learning activities to develop communication competencies',
          ],
          ai_model_used: 'gemini-pro',
          analysis_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error fetching CBC analysis:', error);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/instructor/courses/${courseId}/cbc-analysis`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimeout(() => {
        fetchAnalysis();
        setAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Error running CBC analysis:', error);
      alert('Failed to run CBC analysis');
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <InstructorPageHeader
          title="CBC Alignment Analysis"
          description="AI-powered curriculum alignment checker"
          badge="AI Powered"
          icon={<Sparkles className="w-6 h-6 text-purple-400" />}
        />

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <Target className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Analysis Yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            Run an AI-powered analysis to check how well your course aligns with CBC curriculum standards
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {analyzing ? 'Analyzing...' : 'Run CBC Analysis'}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    covered: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    partial: {
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    missing: {
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="CBC Alignment Analysis"
        description={`Course: ${analysis.course_title}`}
        badge="AI Powered"
        icon={<Sparkles className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {analyzing ? 'Re-analyzing...' : 'Re-run Analysis'}
          </button>
        }
      />

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Overall Alignment Score</h2>
            <p className="text-gray-500 dark:text-white/60">
              Analyzed by {analysis.ai_model_used} on{' '}
              {new Date(analysis.analysis_date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{analysis.alignment_score}%</div>
            <CBCAlignmentBadge score={analysis.alignment_score} showLabel={false} size="lg" />
          </div>
        </div>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fully Covered</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analysis.competencies_covered.filter((c) => c.status === 'covered').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">Competencies</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partially Covered</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analysis.competencies_covered.filter((c) => c.status === 'partial').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">Competencies</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Missing</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.competencies_missing.length}</p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">Competencies</p>
        </div>
      </div>

      {/* Competencies Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Covered Competencies */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Covered Competencies ({analysis.competencies_covered.length})
          </h3>
          <div className="space-y-3">
            {analysis.competencies_covered.map((competency) => {
              const config = statusConfig[competency.status];
              const Icon = config.icon;
              return (
                <div
                  key={competency.code}
                  className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono ${config.color}`}>
                          {competency.code}
                        </span>
                        {competency.status === 'partial' && (
                          <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded">
                            Partial
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{competency.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-white/60">{competency.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Competencies */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Missing Competencies ({analysis.competencies_missing.length})
          </h3>
          <div className="space-y-3">
            {analysis.competencies_missing.map((competency) => {
              const config = statusConfig[competency.status];
              const Icon = config.icon;
              return (
                <div
                  key={competency.code}
                  className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-mono ${config.color} block mb-1`}>
                        {competency.code}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{competency.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-white/60">{competency.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI-Generated Improvement Suggestions
        </h3>
        <div className="space-y-3">
          {analysis.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
            >
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-300">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-white/80 flex-1">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
