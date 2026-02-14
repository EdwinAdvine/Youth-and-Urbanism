import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  CheckCircle,
  Circle,
} from 'lucide-react';

type QuestionType = 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  text: string;
  type: QuestionType;
  difficulty: number;
  options?: MCQOption[];
  aiGradingEnabled: boolean;
  aiGradingPrompt?: string;
}

interface QuestionEditorProps {
  question?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' },
];

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Easy', color: 'text-green-400' },
  2: { label: 'Below Average', color: 'text-lime-400' },
  3: { label: 'Average', color: 'text-amber-400' },
  4: { label: 'Above Average', color: 'text-orange-400' },
  5: { label: 'Hard', color: 'text-red-400' },
};

const DIFFICULTY_TRACK_COLORS: Record<number, string> = {
  1: 'bg-green-400',
  2: 'bg-lime-400',
  3: 'bg-amber-400',
  4: 'bg-orange-400',
  5: 'bg-red-400',
};

const generateId = (): string => Math.random().toString(36).substring(2, 10);

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [text, setText] = useState(question?.text || '');
  const [type, setType] = useState<QuestionType>(question?.type || 'mcq');
  const [difficulty, setDifficulty] = useState(question?.difficulty || 3);
  const [options, setOptions] = useState<MCQOption[]>(
    question?.options || [
      { id: generateId(), text: '', isCorrect: true },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false },
    ]
  );
  const [aiGradingEnabled, setAiGradingEnabled] = useState(question?.aiGradingEnabled || false);
  const [aiGradingPrompt, setAiGradingPrompt] = useState(question?.aiGradingPrompt || '');

  useEffect(() => {
    if (question) {
      setText(question.text);
      setType(question.type);
      setDifficulty(question.difficulty);
      if (question.options) setOptions(question.options);
      setAiGradingEnabled(question.aiGradingEnabled);
      if (question.aiGradingPrompt) setAiGradingPrompt(question.aiGradingPrompt);
    }
  }, [question]);

  const handleAddOption = () => {
    setOptions([...options, { id: generateId(), text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleOptionTextChange = (id: string, newText: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text: newText } : o)));
  };

  const handleSetCorrect = (id: string) => {
    setOptions(options.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  const handleSave = () => {
    const questionData: Question = {
      id: question?.id || generateId(),
      text,
      type,
      difficulty,
      aiGradingEnabled,
      aiGradingPrompt: aiGradingEnabled ? aiGradingPrompt : undefined,
      options: type === 'mcq' ? options : undefined,
    };
    onSave(questionData);
  };

  const isValid = text.trim().length > 0 && (type !== 'mcq' || options.some((o) => o.text.trim()));

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#22272B]">
        <h3 className="text-sm font-semibold text-white">
          {question ? 'Edit Question' : 'New Question'}
        </h3>
        <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Question Text */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Question Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question..."
            rows={3}
            className="w-full px-3 py-2.5 bg-[#22272B]/50 border border-[#22272B] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-[#E40000]/50 resize-none transition-colors"
          />
        </div>

        {/* Type & Difficulty Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Question Type */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Question Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full px-3 py-2.5 bg-[#22272B]/50 border border-[#22272B] rounded-lg text-sm text-white outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer transition-colors"
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.value} value={qt.value} className="bg-[#22272B]">
                  {qt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Slider */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Difficulty:{' '}
              <span className={DIFFICULTY_LABELS[difficulty]?.color}>
                {difficulty} - {DIFFICULTY_LABELS[difficulty]?.label}
              </span>
            </label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    DIFFICULTY_TRACK_COLORS[difficulty] === 'bg-green-400' ? '#4ade80' :
                    DIFFICULTY_TRACK_COLORS[difficulty] === 'bg-lime-400' ? '#a3e635' :
                    DIFFICULTY_TRACK_COLORS[difficulty] === 'bg-amber-400' ? '#fbbf24' :
                    DIFFICULTY_TRACK_COLORS[difficulty] === 'bg-orange-400' ? '#fb923c' : '#f87171'
                  } ${((difficulty - 1) / 4) * 100}%, #22272B ${((difficulty - 1) / 4) * 100}%)`,
                }}
              />
              <span className={`text-sm font-bold ${DIFFICULTY_LABELS[difficulty]?.color}`}>
                {difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* MCQ Options */}
        {type === 'mcq' && (
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <GripVertical className="w-3.5 h-3.5 text-white/20 flex-shrink-0 cursor-grab" />
                  <button
                    type="button"
                    onClick={() => handleSetCorrect(option.id)}
                    className="flex-shrink-0"
                    title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {option.isCorrect ? (
                      <CheckCircle className="w-4.5 h-4.5 text-green-400" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-white/20 hover:text-white/40 transition-colors" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 bg-[#22272B]/50 border border-[#22272B] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-[#E40000]/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    disabled={options.length <= 2}
                    className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </button>
          </div>
        )}

        {/* AI Grading Toggle */}
        <div className="pt-2 border-t border-[#22272B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white font-medium">AI Auto-Grading</span>
            </div>
            <button
              type="button"
              onClick={() => setAiGradingEnabled(!aiGradingEnabled)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                aiGradingEnabled ? 'bg-[#E40000]' : 'bg-[#22272B]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  aiGradingEnabled ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {aiGradingEnabled && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                AI Grading Prompt
              </label>
              <textarea
                value={aiGradingPrompt}
                onChange={(e) => setAiGradingPrompt(e.target.value)}
                placeholder="Instructions for the AI grader (e.g., 'Grade based on understanding of photosynthesis concepts. Award partial marks for correct steps.')"
                rows={3}
                className="w-full px-3 py-2.5 bg-[#22272B]/50 border border-[#22272B] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-[#E40000]/50 resize-none transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[#22272B]">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-[#22272B]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#E40000] rounded-lg hover:bg-[#E40000]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          {question ? 'Update Question' : 'Save Question'}
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;
