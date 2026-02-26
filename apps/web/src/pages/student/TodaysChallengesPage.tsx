import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Zap, CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface Challenge {
  id: string;
  question: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeLimit: number;
  options: string[];
  correctAnswer: number;
  status: 'pending' | 'correct' | 'wrong';
}

const challenges: Challenge[] = [
  { id: '1', question: 'What is 3/4 + 1/2?', subject: 'Mathematics', difficulty: 'easy', xpReward: 10, timeLimit: 30, options: ['1', '5/4', '1 1/4', '3/6'], correctAnswer: 2, status: 'pending' },
  { id: '2', question: 'Which process converts water from liquid to gas?', subject: 'Science', difficulty: 'easy', xpReward: 10, timeLimit: 30, options: ['Condensation', 'Evaporation', 'Precipitation', 'Filtration'], correctAnswer: 1, status: 'pending' },
  { id: '3', question: 'What is the capital city of Kenya?', subject: 'Social Studies', difficulty: 'easy', xpReward: 10, timeLimit: 20, options: ['Mombasa', 'Kisumu', 'Nairobi', 'Nakuru'], correctAnswer: 2, status: 'pending' },
  { id: '4', question: 'Which part of speech describes a noun?', subject: 'English', difficulty: 'medium', xpReward: 15, timeLimit: 30, options: ['Verb', 'Adjective', 'Adverb', 'Pronoun'], correctAnswer: 1, status: 'pending' },
  { id: '5', question: 'Neno "haraka" ni aina gani ya neno?', subject: 'Kiswahili', difficulty: 'medium', xpReward: 15, timeLimit: 30, options: ['Nomino', 'Kivumishi', 'Kitenzi', 'Kielezi'], correctAnswer: 3, status: 'pending' },
];

const difficultyColors = { easy: 'text-green-400 bg-green-500/20', medium: 'text-yellow-400 bg-yellow-500/20', hard: 'text-red-400 bg-red-500/20' };

const TodaysChallengesPage: React.FC = () => {
  const { borderRadius, ageGroup } = useAgeAdaptiveUI();
  const [items, setItems] = useState(challenges);
  const [selectedAnswer, setSelectedAnswer] = useState<Record<string, number>>({});

  const submitAnswer = (challengeId: string, answerIndex: number) => {
    setSelectedAnswer(prev => ({ ...prev, [challengeId]: answerIndex }));
    setItems(prev => prev.map(c => {
      if (c.id === challengeId) {
        return { ...c, status: answerIndex === c.correctAnswer ? 'correct' : 'wrong' };
      }
      return c;
    }));
  };

  const completed = items.filter(c => c.status !== 'pending').length;
  const correct = items.filter(c => c.status === 'correct').length;
  const xpEarned = items.filter(c => c.status === 'correct').reduce((acc, c) => acc + c.xpReward, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-400" /> Today's Challenges
        </h1>
        <p className="text-gray-600 dark:text-white/70">{ageGroup === 'young' ? 'Quick brain teasers to earn XP!' : 'AI-generated micro-quizzes based on your learning'}</p>
      </div>

      {/* Progress */}
      <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <div><span className="text-gray-400 dark:text-white/40 text-sm">Completed</span><div className="text-gray-900 dark:text-white font-bold text-lg">{completed}/{items.length}</div></div>
          <div><span className="text-gray-400 dark:text-white/40 text-sm">Correct</span><div className="text-green-400 font-bold text-lg">{correct}</div></div>
          <div><span className="text-gray-400 dark:text-white/40 text-sm">XP Earned</span><div className="text-yellow-400 font-bold text-lg">+{xpEarned}</div></div>
        </div>
        <div className="w-32 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
        </div>
      </div>

      {/* Challenges */}
      <div className="space-y-4">
        {items.map((challenge, idx) => (
          <div key={challenge.id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border ${challenge.status === 'correct' ? 'border-green-500/30' : challenge.status === 'wrong' ? 'border-red-500/30' : 'border-gray-200 dark:border-[#22272B]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-400 dark:text-white/40 text-sm">#{idx + 1}</span>
              <span className={`px-2 py-0.5 ${borderRadius} text-xs ${difficultyColors[challenge.difficulty]}`}>{challenge.difficulty}</span>
              <span className="text-gray-400 dark:text-white/40 text-xs">{challenge.subject}</span>
              <span className="text-yellow-400 text-xs ml-auto">+{challenge.xpReward} XP</span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-4">{challenge.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {challenge.options.map((option, oi) => {
                const isSelected = selectedAnswer[challenge.id] === oi;
                const isCorrect = challenge.status !== 'pending' && oi === challenge.correctAnswer;
                const isWrong = challenge.status === 'wrong' && isSelected;
                return (
                  <button
                    key={oi}
                    onClick={() => challenge.status === 'pending' && submitAnswer(challenge.id, oi)}
                    disabled={challenge.status !== 'pending'}
                    className={`p-3 ${borderRadius} text-left flex items-center gap-3 transition-colors ${
                      isCorrect ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                      isWrong ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                      isSelected ? 'bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white' :
                      'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-6 h-6 ${borderRadius} border flex items-center justify-center text-xs ${isCorrect ? 'border-green-500 text-green-400' : isWrong ? 'border-red-500 text-red-400' : 'border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/40'}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {option}
                    {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    {isWrong && <XCircle className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {completed === items.length && (
        <div className={`p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 ${borderRadius} border border-yellow-500/30 text-center`}>
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-gray-900 dark:text-white font-bold text-lg">Challenges Complete!</h3>
          <p className="text-gray-500 dark:text-white/60 mt-1">You got {correct}/{items.length} correct and earned {xpEarned} XP</p>
        </div>
      )}
    </div>
  );
};

export default TodaysChallengesPage;
