import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Brain, Clock, Calendar, BookOpen, Play, Bell, CheckCircle, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface UpcomingQuiz {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  questions: number;
  type: string;
  instructor: string;
  canStart: boolean;
}

const FALLBACK_QUIZZES: UpcomingQuiz[] = [
  { id: '1', title: 'Fractions & Decimals Quiz', subject: 'Mathematics', date: 'Today, 3:00 PM', duration: '20 min', questions: 15, type: 'Graded', instructor: 'Ms. Wanjiku', canStart: true },
  { id: '2', title: 'Water Cycle Assessment', subject: 'Science', date: 'Tomorrow, 10:00 AM', duration: '30 min', questions: 20, type: 'Graded', instructor: 'Mr. Ochieng', canStart: false },
  { id: '3', title: 'Grammar Check', subject: 'English', date: 'Wed, Feb 19', duration: '15 min', questions: 10, type: 'Practice', instructor: 'Mrs. Kamau', canStart: false },
  { id: '4', title: 'Kenya History Quiz', subject: 'Social Studies', date: 'Fri, Feb 21', duration: '25 min', questions: 18, type: 'Graded', instructor: 'Ms. Njeri', canStart: false },
];

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
        const data = response.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setQuizzes(data);
        } else {
          setQuizzes(FALLBACK_QUIZZES);
        }
      } catch {
        setQuizzes(FALLBACK_QUIZZES);
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

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border ${quiz.canStart ? 'border-green-500/30' : 'border-gray-200 dark:border-[#22272B]'} hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-purple-500/20 ${borderRadius} flex items-center justify-center`}>
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 dark:text-white font-semibold">{quiz.title}</h3>
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs ${quiz.type === 'Practice' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{quiz.type}</span>
                </div>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{quiz.instructor} · {quiz.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {quiz.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {quiz.questions} questions</span>
                </div>
              </div>
              <div className="flex gap-2">
                {quiz.canStart ? (
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
