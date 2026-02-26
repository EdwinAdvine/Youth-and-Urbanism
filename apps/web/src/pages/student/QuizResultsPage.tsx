import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Trophy, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';

interface QuizResult {
  id: string;
  title: string;
  subject: string;
  course_title: string;
  assessment_type: string;
  submission_id: string;
  submitted_at: string | null;
  score: number;
  total_points: number;
  percentage: number;
  is_graded: boolean;
  passed: boolean;
}

const QuizResultsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/assessments/quizzes/results');
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0;

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Results</h1>
        <p className="text-gray-600 dark:text-white/70">Review your quiz performance</p>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{avgScore}%</div>
            <div className="text-gray-400 dark:text-white/40 text-sm">Average Score</div>
          </div>
          <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{results.length}</div>
            <div className="text-gray-400 dark:text-white/40 text-sm">Quizzes Taken</div>
          </div>
        </div>
      )}

      {results.length === 0 && !error && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No quiz results yet. Complete a quiz to see your scores here.
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.submission_id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${borderRadius} flex items-center justify-center ${result.percentage >= 80 ? 'bg-green-500/20' : result.percentage >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                <span className={`text-xl font-bold ${result.percentage >= 80 ? 'text-green-400' : result.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {result.percentage}%
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{result.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{result.course_title} · {result.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    {result.score}/{result.total_points} pts
                  </span>
                  {result.submitted_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(result.submitted_at)}
                    </span>
                  )}
                  {!result.is_graded && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Pending Grade</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultsPage;
