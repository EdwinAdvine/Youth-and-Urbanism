import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { ChevronRight, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizPlayerProps {
  title: string;
  questions: Question[];
  onComplete: (score: number, total: number) => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ title, questions, onComplete }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQ];

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      const score = newAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      onComplete(score, questions.length);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  if (finished) {
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length;
    return (
      <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
        <p className="text-gray-500 dark:text-white/60 mb-2">You scored {score} out of {questions.length}</p>
        <div className="text-4xl font-bold text-green-400">{Math.round((score / questions.length) * 100)}%</div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 dark:text-white font-semibold">{title}</h3>
        <span className="text-gray-400 dark:text-white/40 text-sm">Q{currentQ + 1}/{questions.length}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mb-6">
        <div className="h-full bg-[#FF0000] rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>
      <p className="text-gray-900 dark:text-white text-lg mb-4">{question.text}</p>
      <div className="space-y-2 mb-6">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full p-3 ${borderRadius} text-left text-sm transition-colors ${
              selected === i
                ? 'bg-[#FF0000]/20 border-[#FF0000]/50 text-gray-900 dark:text-white border'
                : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={selected === null}
        className={`w-full py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {currentQ + 1 >= questions.length ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuizPlayer;
