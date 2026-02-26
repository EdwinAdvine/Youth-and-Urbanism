import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Users, Send, MessageCircle, Clock, CheckCircle, AlertCircle, Bot } from 'lucide-react';

const teacherThreads = [
  {
    id: '1',
    teacher: 'Ms. Wanjiku',
    subject: 'Mathematics',
    question: 'I don\'t understand how to convert fractions to percentages. Can you explain step by step?',
    aiSummary: 'Student needs help with fraction-to-percentage conversion. Related to Unit 5, Lesson 3.',
    answer: 'Great question! To convert a fraction to a percentage: 1) Divide the numerator by the denominator. 2) Multiply the result by 100. For example, 3/4 = 0.75 × 100 = 75%.',
    status: 'answered' as const,
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    teacher: 'Mr. Ochieng',
    subject: 'Science',
    question: 'What\'s the difference between mitosis and meiosis? The textbook explanation is confusing.',
    aiSummary: 'Student confused about cell division types. Recommend visual comparison.',
    answer: null,
    status: 'pending' as const,
    timeAgo: '5 hours ago',
  },
  {
    id: '3',
    teacher: 'Mrs. Kamau',
    subject: 'English',
    question: 'Can you review my essay draft on climate change? I attached it to the assignment.',
    aiSummary: 'Student requesting essay review. Draft available in assignments section.',
    answer: 'I\'ve reviewed your essay. Your introduction is strong! Focus on adding more evidence in paragraphs 2 and 3. I\'ve left detailed comments on your submission.',
    status: 'answered' as const,
    timeAgo: '1 day ago',
  },
];

const TeacherCollabPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const teachers = [
    { id: '1', name: 'Ms. Wanjiku', subject: 'Mathematics' },
    { id: '2', name: 'Mr. Ochieng', subject: 'Science' },
    { id: '3', name: 'Mrs. Kamau', subject: 'English' },
    { id: '4', name: 'Mwl. Akinyi', subject: 'Kiswahili' },
  ];

  const statusConfig = {
    answered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Answered' },
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pending' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-400" /> Teacher Collaboration
        </h1>
        <p className="text-gray-600 dark:text-white/70">Ask questions and get answers from your teachers</p>
      </div>

      {/* Ask New Question */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Ask a Teacher</h3>
        <div className="space-y-3">
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-blue-500`}
          >
            <option value="" className="bg-white dark:bg-[#181C1F]">Select a teacher...</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-[#181C1F]">{t.name} - {t.subject}</option>
            ))}
          </select>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question here..."
            rows={3}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 dark:text-white/40 text-xs">
              <Bot className="w-3 h-3" />
              <span>AI will summarize your question for the teacher</span>
            </div>
            <button
              disabled={!newQuestion || !selectedTeacher}
              className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2 text-sm`}
            >
              <Send className="w-4 h-4" /> Send Question
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-green-400 font-bold text-lg">
            {teacherThreads.filter(t => t.status === 'answered').length}
          </div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Answered</div>
        </div>
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-yellow-400 font-bold text-lg">
            {teacherThreads.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Pending</div>
        </div>
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-blue-400 font-bold text-lg">{teacherThreads.length}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Total</div>
        </div>
      </div>

      {/* Threads */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Questions</h2>
        <div className="space-y-3">
          {teacherThreads.map((thread) => {
            const config = statusConfig[thread.status];
            const StatusIcon = config.icon;

            return (
              <div key={thread.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 ${config.bg} ${config.color} text-xs ${borderRadius}`}>{config.label}</span>
                  <span className={`px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs ${borderRadius}`}>{thread.subject}</span>
                  <span className="text-gray-400 dark:text-white/40 text-xs">{thread.timeAgo}</span>
                </div>

                <p className="text-gray-700 dark:text-white/80 text-sm mb-2">
                  <span className="text-gray-400 dark:text-white/40">To: </span>
                  <span className="text-gray-900 dark:text-white font-medium">{thread.teacher}</span>
                </p>

                <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} mb-2`}>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 dark:text-white/70 text-sm">{thread.question}</p>
                  </div>
                </div>

                <div className={`p-2 bg-purple-500/10 ${borderRadius} mb-2 flex items-start gap-2`}>
                  <Bot className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-purple-300 text-xs">{thread.aiSummary}</p>
                </div>

                {thread.answer ? (
                  <div className={`p-3 bg-green-500/10 ${borderRadius} flex items-start gap-2`}>
                    <StatusIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 text-xs font-medium mb-1">{thread.teacher}&#39;s Response</p>
                      <p className="text-gray-600 dark:text-white/70 text-sm">{thread.answer}</p>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 bg-yellow-500/10 ${borderRadius} flex items-center gap-2`}>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <p className="text-yellow-300 text-sm">Waiting for teacher response...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherCollabPage;
