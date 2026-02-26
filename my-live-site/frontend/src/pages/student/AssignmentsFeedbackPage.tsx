import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { MessageSquare, Clock, ArrowLeft } from 'lucide-react';

const feedbacks = [
  { id: '1', title: 'Essay: My Community', subject: 'English', grade: 'A-', score: '42/50', teacher: 'Mrs. Kamau', feedback: 'Excellent structure and vocabulary. Work on your conclusion paragraph — try summarizing your main points.', date: 'Feb 12' },
  { id: '2', title: 'Math Problem Set 5', subject: 'Mathematics', grade: 'B+', score: '38/50', teacher: 'Ms. Wanjiku', feedback: 'Good work on fractions! Review question 7-10 on decimal conversion. Practice more with word problems.', date: 'Feb 10' },
  { id: '3', title: 'Science Lab Report', subject: 'Science', grade: 'A', score: '48/50', teacher: 'Mr. Ochieng', feedback: 'Outstanding observation skills! Your hypothesis was well-formed and your data table was very clear.', date: 'Feb 8' },
];

const AssignmentsFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Assignment Feedback</h1>
          <p className="text-gray-600 dark:text-white/70">Review teacher feedback on your submissions</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.map((item) => (
          <div key={item.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">{item.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{item.subject} · {item.teacher}</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-bold text-lg">{item.grade}</span>
                <p className="text-gray-400 dark:text-white/40 text-xs">{item.score}</p>
              </div>
            </div>
            <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Teacher Feedback</span>
              </div>
              <p className="text-gray-600 dark:text-white/70 text-sm">{item.feedback}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="flex items-center gap-1 text-gray-400 dark:text-white/40 text-xs"><Clock className="w-3 h-3" /> {item.date}</span>
              <button
                onClick={() => navigate(`/dashboard/student/assignments/resubmit/${item.id}`)}
                className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius}`}
              >
                Resubmit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsFeedbackPage;
