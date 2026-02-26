import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Brain, ChevronRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: 'When learning something new, I prefer to:',
    options: [
      { label: 'Watch a video or look at diagrams', style: 'visual' },
      { label: 'Listen to an explanation', style: 'auditory' },
      { label: 'Try it hands-on', style: 'kinesthetic' },
      { label: 'Read about it', style: 'reading' },
    ],
  },
  {
    id: 2,
    text: 'I remember things best when I:',
    options: [
      { label: 'See pictures or charts', style: 'visual' },
      { label: 'Hear them explained', style: 'auditory' },
      { label: 'Practice or do activities', style: 'kinesthetic' },
      { label: 'Write notes about them', style: 'reading' },
    ],
  },
  {
    id: 3,
    text: 'During class, I focus best when:',
    options: [
      { label: 'The teacher uses the whiteboard', style: 'visual' },
      { label: 'There is group discussion', style: 'auditory' },
      { label: 'We do experiments or projects', style: 'kinesthetic' },
      { label: 'I can take detailed notes', style: 'reading' },
    ],
  },
];

interface LearningStyleQuizProps {
  onComplete: (result: string) => void;
}

const LearningStyleQuiz: React.FC<LearningStyleQuizProps> = ({ onComplete }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (current + 1 >= questions.length) {
      const counts: Record<string, number> = {};
      newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
      const result = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      onComplete(result);
    } else {
      setCurrent(current + 1);
    }
  };

  const q = questions[current];

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">Learning Style Quiz</h3>
        <span className="text-gray-400 dark:text-white/30 text-sm ml-auto">Q{current + 1}/{questions.length}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mb-5">
        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>
      <p className="text-gray-900 dark:text-white text-lg mb-4">{q.text}</p>
      <div className="space-y-2 mb-5">
        {q.options.map((opt) => (
          <button
            key={opt.style}
            onClick={() => setSelected(opt.style)}
            className={`w-full p-3 ${borderRadius} text-left text-sm transition-colors ${
              selected === opt.style
                ? 'bg-purple-500/20 border-purple-500/50 text-gray-900 dark:text-white border'
                : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={!selected}
        className={`w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {current + 1 >= questions.length ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LearningStyleQuiz;
