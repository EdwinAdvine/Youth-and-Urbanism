import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Trophy, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const results = [
  { id: '1', title: 'Fractions & Decimals Quiz', subject: 'Mathematics', score: 92, total: 15, correct: 14, date: 'Today', duration: '18 min', improvement: +8 },
  { id: '2', title: 'Water Cycle Assessment', subject: 'Science', score: 78, total: 20, correct: 16, date: 'Yesterday', duration: '28 min', improvement: +3 },
  { id: '3', title: 'Grammar Check', subject: 'English', score: 85, total: 10, correct: 8, date: '3 days ago', duration: '12 min', improvement: -2 },
  { id: '4', title: 'Kenya History Quiz', subject: 'Social Studies', score: 70, total: 18, correct: 13, date: '1 week ago', duration: '22 min', improvement: +5 },
];

const QuizResultsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Results</h1>
        <p className="text-gray-600 dark:text-white/70">Review your quiz performance</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-green-400">+{Math.round(results.reduce((a, r) => a + r.improvement, 0) / results.length)}%</div>
          <div className="text-gray-400 dark:text-white/40 text-sm">Avg Improvement</div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${borderRadius} flex items-center justify-center ${result.score >= 80 ? 'bg-green-500/20' : result.score >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                <span className={`text-xl font-bold ${result.score >= 80 ? 'text-green-400' : result.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{result.score}%</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{result.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{result.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> {result.correct}/{result.total} correct</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {result.duration}</span>
                  <span>{result.date}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${result.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.improvement >= 0 ? '+' : ''}{result.improvement}% vs last
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultsPage;
