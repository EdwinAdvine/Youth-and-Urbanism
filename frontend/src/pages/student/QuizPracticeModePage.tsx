import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Brain, CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';

interface PracticeQuestion {
  id: string | number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject?: string;
  assessment_title?: string;
}

const QuizPracticeModePage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/assessments/quizzes/practice');
        const data = Array.isArray(res.data) ? res.data : [];
        setQuestions(data);
        if (data.length === 0) {
          setError('No practice questions available yet. Enroll in courses to unlock practice mode.');
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load practice questions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const restart = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setShowExplanation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Practice Mode</h1>
        </div>
        <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60">{error || 'No practice questions available.'}</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const isAnswered = answers[question.id] !== undefined;
  const isCorrect = answers[question.id] === question.correct;
  const totalCorrect = Object.entries(answers).filter(([id, ans]) => {
    const q = questions.find(q => String(q.id) === String(id));
    return q?.correct === ans;
  }).length;

  const selectAnswer = (index: number) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [question.id]: index }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const percentage = Math.round((totalCorrect / questions.length) * 100);
    return (
      <div className="space-y-6">
        <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 80 ? 'text-yellow-400' : percentage >= 60 ? 'text-blue-400' : 'text-gray-400 dark:text-white/40'}`} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Practice Complete!</h1>
          <p className="text-5xl font-bold text-gray-900 dark:text-white my-4">{percentage}%</p>
          <p className="text-gray-500 dark:text-white/60">{totalCorrect} out of {questions.length} correct</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={restart} className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Practice Mode</h1>
          {question.subject && <p className="text-gray-600 dark:text-white/70">{question.subject}</p>}
        </div>
        <span className="text-gray-400 dark:text-white/40">Question {currentQ + 1} of {questions.length}</span>
      </div>

      <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#FF0000] rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-gray-400 dark:text-white/40 text-sm">Question {currentQ + 1}</span>
          {question.assessment_title && (
            <span className="text-gray-300 dark:text-white/20 text-xs">· {question.assessment_title}</span>
          )}
        </div>
        <h2 className="text-xl text-gray-900 dark:text-white font-medium mb-6">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option, i) => {
            const selected = answers[question.id] === i;
            const correct = isAnswered && i === question.correct;
            const wrong = selected && !isCorrect;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={isAnswered}
                className={`w-full p-4 ${borderRadius} text-left flex items-center gap-3 transition-colors ${
                  correct ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                  wrong ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                  'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                <span className={`w-8 h-8 ${borderRadius} border flex items-center justify-center text-sm font-medium ${correct ? 'border-green-500' : wrong ? 'border-red-500' : 'border-gray-300 dark:border-white/20'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {correct && <CheckCircle2 className="w-5 h-5" />}
                {wrong && <XCircle className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        {showExplanation && question.explanation && (
          <div className={`mt-4 p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
            <p className="text-blue-300 text-sm font-medium mb-1">Explanation</p>
            <p className="text-gray-600 dark:text-white/70 text-sm">{question.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <button onClick={nextQuestion} className={`mt-4 px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
            {currentQ < questions.length - 1 ? <>Next Question <ChevronRight className="w-4 h-4" /></> : <>View Results <Trophy className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPracticeModePage;
