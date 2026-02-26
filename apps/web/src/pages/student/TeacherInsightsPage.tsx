import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { MessageSquare, User } from 'lucide-react';

const insights = [
  { teacher: 'Ms. Wanjiku', subject: 'Mathematics', comment: 'Kevin has shown significant improvement in fractions this term. He participates actively in class and helps other students.', date: 'Feb 10', rating: 'Excellent' },
  { teacher: 'Mr. Ochieng', subject: 'Science', comment: 'Strong practical skills in lab work. Kevin should focus more on theoretical concepts and reading the textbook material before class.', date: 'Feb 8', rating: 'Good' },
  { teacher: 'Mrs. Kamau', subject: 'English', comment: 'Creative writing is exceptional! Kevin\'s essays are among the best in class. Encourage him to enter the school writing competition.', date: 'Feb 5', rating: 'Outstanding' },
];

const TeacherInsightsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  const ratingColor = (rating: string) => {
    if (rating === 'Outstanding') return 'bg-purple-500/20 text-purple-400';
    if (rating === 'Excellent') return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Teacher Insights</h1>
        <p className="text-gray-600 dark:text-white/70">Progress notes from your teachers</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{insight.teacher}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{insight.subject}</p>
              </div>
              <span className={`px-2 py-0.5 ${borderRadius} text-xs ${ratingColor(insight.rating)}`}>
                {insight.rating}
              </span>
            </div>
            <div className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius}`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <span className="text-gray-400 dark:text-white/40 text-xs">{insight.date}</span>
              </div>
              <p className="text-gray-600 dark:text-white/70 text-sm">{insight.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherInsightsPage;
