import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';
import SkillTreeViz from '../../components/student/progress/SkillTreeViz';
import apiClient from '../../services/api';

interface SkillReport {
  subject: string;
  average_score: number;
  quizzes_taken: number;
  trend: 'up' | 'down' | 'stable';
}

const SkillReportsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [skills, setSkills] = useState<SkillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/assessments/quizzes/skill-reports');
        setSkills(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load skill reports.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400 dark:text-white/40" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  // Build the SkillTreeViz-compatible format
  const vizSkills = skills.map(s => ({ label: s.subject, value: s.average_score }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Skill Reports</h1>
        <p className="text-gray-600 dark:text-white/70">Detailed analysis of your subject-level skills</p>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {skills.length === 0 && !error && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No graded quizzes yet. Complete quizzes to see your skill breakdown here.
        </div>
      )}

      {vizSkills.length > 0 && <SkillTreeViz skills={vizSkills} title="Subject Overview" />}

      {skills.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skill Breakdown</h2>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.subject} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-medium text-sm">{skill.subject}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-xs">{skill.quizzes_taken} quiz{skill.quizzes_taken !== 1 ? 'zes' : ''} taken</p>
                </div>
                <div className="w-32">
                  <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.average_score >= 80 ? 'bg-green-500' : skill.average_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${skill.average_score}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-sm w-10 text-right">{skill.average_score}%</span>
                {trendIcon(skill.trend)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillReportsPage;
