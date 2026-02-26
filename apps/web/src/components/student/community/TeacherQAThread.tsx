import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { User, CheckCircle } from 'lucide-react';

interface Reply {
  id: string;
  author: string;
  text: string;
  timeAgo: string;
  isTeacher: boolean;
}

interface TeacherQAThreadProps {
  question: string;
  author: string;
  timeAgo: string;
  replies: Reply[];
  isAnswered: boolean;
}

const TeacherQAThread: React.FC<TeacherQAThreadProps> = ({ question, author, timeAgo, replies, isAnswered }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0`}>
          <User className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-white font-medium text-sm">{author}</span>
            <span className="text-gray-400 dark:text-white/30 text-xs">{timeAgo}</span>
            {isAnswered && (
              <span className={`px-2 py-0.5 bg-green-500/20 text-green-400 text-xs ${borderRadius} flex items-center gap-1`}>
                <CheckCircle className="w-3 h-3" /> Answered
              </span>
            )}
          </div>
          <p className="text-gray-900 dark:text-white mt-1">{question}</p>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-11 mt-4 space-y-3 border-l-2 border-gray-200 dark:border-white/10 pl-4">
          {replies.map((reply) => (
            <div key={reply.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${reply.isTeacher ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {reply.author}
                </span>
                {reply.isTeacher && <span className={`px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] ${borderRadius}`}>Teacher</span>}
                <span className="text-gray-400 dark:text-white/30 text-xs">{reply.timeAgo}</span>
              </div>
              <p className="text-gray-600 dark:text-white/70 text-sm">{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQAThread;
