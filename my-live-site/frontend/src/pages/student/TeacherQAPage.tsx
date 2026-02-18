import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { HelpCircle, Plus } from 'lucide-react';
import TeacherQAThread from '../../components/student/community/TeacherQAThread';

const threads = [
  {
    question: 'How do you convert a fraction to a decimal?',
    author: 'Kevin O.',
    timeAgo: '3 hours ago',
    isAnswered: true,
    replies: [
      { id: '1', author: 'Ms. Wanjiku', text: 'Divide the numerator by the denominator. For example, 3/4 = 3 ÷ 4 = 0.75', timeAgo: '2 hours ago', isTeacher: true },
    ],
  },
  {
    question: 'What causes the seasons to change?',
    author: 'Amina W.',
    timeAgo: '1 day ago',
    isAnswered: true,
    replies: [
      { id: '2', author: 'Mr. Ochieng', text: "The Earth's axis is tilted at 23.5 degrees. As Earth orbits the Sun, different parts receive more direct sunlight at different times.", timeAgo: '20 hours ago', isTeacher: true },
      { id: '3', author: 'Kevin O.', text: 'That makes sense! So when the Northern hemisphere tilts toward the Sun, we get summer?', timeAgo: '18 hours ago', isTeacher: false },
    ],
  },
  {
    question: 'What is the difference between simile and metaphor?',
    author: 'Brian K.',
    timeAgo: '2 days ago',
    isAnswered: false,
    replies: [],
  },
];

const TeacherQAPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-blue-400" /> Teacher Q&A
          </h1>
          <p className="text-gray-600 dark:text-white/70">Ask questions and get answers from teachers</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/student/community/questions/new')}
          className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" /> Ask Question
        </button>
      </div>

      <div className="space-y-4">
        {threads.map((thread, i) => (
          <TeacherQAThread key={i} {...thread} />
        ))}
      </div>
    </div>
  );
};

export default TeacherQAPage;
