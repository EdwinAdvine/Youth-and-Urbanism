import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Brain, Clock, Calendar, Play, Bell, CheckCircle, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface UpcomingQuiz {
  id: string;
  title: string;
  subject: string;
  course_title: string;
  assessment_type: string;
  available_until: string | null;
  duration_minutes: number | null;
  can_start: boolean;
}

const QuizzesUpcomingPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [quizzes, setQuizzes] = useState<UpcomingQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingQuizzes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/student/assessments/quizzes/upcoming');
        setQuizzes(Array.isArray(response.data) ? response.data : []);
      } catch {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upcoming Quizzes</h1>
        <p className="text-gray-600 dark:text-white/70">{quizzes.length} quizzes scheduled</p>
      </div>

      {quizzes.length === 0 && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No upcoming quizzes at the moment.
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border ${quiz.can_start ? 'border-green-500/30' : 'border-gray-200 dark:border-[#22272B]'} hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-purple-500/20 ${borderRadius} flex items-center justify-center`}>
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 dark:text-white font-semibold">{quiz.title}</h3>
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs capitalize ${quiz.assessment_type === 'exam' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {quiz.assessment_type}
                  </span>
                </div>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{quiz.course_title} · {quiz.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  {quiz.available_until && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due {new Date(quiz.available_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {quiz.duration_minutes && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.duration_minutes} min</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {quiz.can_start ? (
                  <button onClick={() => navigate('/dashboard/student/quizzes/practice')} className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                    <Play className="w-4 h-4" /> Start Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setReminders(prev => ({ ...prev, [quiz.id]: true }))}
                    className={`px-4 py-2 ${reminders[quiz.id] ? 'bg-green-500/20 text-green-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60'} text-sm ${borderRadius} flex items-center gap-2`}
                  >
                    {reminders[quiz.id] ? <><CheckCircle className="w-4 h-4" /> Reminded</> : <><Bell className="w-4 h-4" /> Remind Me</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Practice Mode Banner */}
      <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20 flex items-center justify-between`}>
        <div>
          <h3 className="text-gray-900 dark:text-white font-medium">Want to practice?</h3>
          <p className="text-gray-500 dark:text-white/60 text-sm">Try practice mode to prepare for upcoming quizzes</p>
        </div>
        <button onClick={() => navigate('/dashboard/student/quizzes/practice')} className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white text-sm ${borderRadius}`}>Practice Mode</button>
      </div>
    </div>
  );
};

export default QuizzesUpcomingPage;
