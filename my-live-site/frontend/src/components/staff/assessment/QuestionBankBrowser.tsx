import React, { useState, useMemo } from 'react';
import { Search, Filter, Check, BookOpen, ChevronDown } from 'lucide-react';

type QuestionType = 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';

interface BankQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: number;
  topic: string;
  usageCount: number;
}

interface QuestionBankBrowserProps {
  onSelect: (questionId: string) => void;
  selectedIds?: string[];
}

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ',
  short_answer: 'Short Answer',
  essay: 'Essay',
  fill_blank: 'Fill Blank',
  matching: 'Matching',
  ordering: 'Ordering',
};

const TYPE_COLORS: Record<QuestionType, string> = {
  mcq: 'bg-blue-500/20 text-blue-400',
  short_answer: 'bg-green-500/20 text-green-400',
  essay: 'bg-purple-500/20 text-purple-400',
  fill_blank: 'bg-amber-500/20 text-amber-400',
  matching: 'bg-cyan-500/20 text-cyan-400',
  ordering: 'bg-pink-500/20 text-pink-400',
};

const DIFFICULTY_DOTS: Record<number, { color: string; label: string }> = {
  1: { color: 'bg-green-400', label: 'Easy' },
  2: { color: 'bg-lime-400', label: 'Below Avg' },
  3: { color: 'bg-amber-400', label: 'Average' },
  4: { color: 'bg-orange-400', label: 'Above Avg' },
  5: { color: 'bg-red-400', label: 'Hard' },
};

const MOCK_QUESTIONS: BankQuestion[] = [
  { id: 'q1', text: 'What is the process by which plants make their own food using sunlight?', type: 'mcq', difficulty: 2, topic: 'Science', usageCount: 45 },
  { id: 'q2', text: 'Solve: 3x + 7 = 22. Find the value of x.', type: 'short_answer', difficulty: 3, topic: 'Mathematics', usageCount: 32 },
  { id: 'q3', text: 'Write an essay discussing the importance of the Kenya CBC curriculum in modern education.', type: 'essay', difficulty: 5, topic: 'Social Studies', usageCount: 12 },
  { id: 'q4', text: 'The capital city of Kenya is _______.', type: 'fill_blank', difficulty: 1, topic: 'Social Studies', usageCount: 67 },
  { id: 'q5', text: 'Match each Kenyan county to its main economic activity.', type: 'matching', difficulty: 4, topic: 'Social Studies', usageCount: 23 },
  { id: 'q6', text: 'Arrange the following stages of the water cycle in correct order.', type: 'ordering', difficulty: 3, topic: 'Science', usageCount: 38 },
  { id: 'q7', text: 'Which of the following is a renewable source of energy?', type: 'mcq', difficulty: 2, topic: 'Science', usageCount: 55 },
  { id: 'q8', text: 'Calculate the area of a triangle with base 12cm and height 8cm.', type: 'short_answer', difficulty: 2, topic: 'Mathematics', usageCount: 41 },
  { id: 'q9', text: 'Explain the significance of Article 43 of the Constitution of Kenya.', type: 'essay', difficulty: 5, topic: 'Social Studies', usageCount: 8 },
  { id: 'q10', text: 'In Kiswahili, "Jambo" means _______ in English.', type: 'fill_blank', difficulty: 1, topic: 'Languages', usageCount: 72 },
  { id: 'q11', text: 'Match the Kenyan national symbols to their correct descriptions.', type: 'matching', difficulty: 3, topic: 'Social Studies', usageCount: 29 },
  { id: 'q12', text: 'Simplify: (2/3) + (4/5) - (1/6).', type: 'short_answer', difficulty: 4, topic: 'Mathematics', usageCount: 19 },
];

const QuestionBankBrowser: React.FC<QuestionBankBrowserProps> = ({
  onSelect,
  selectedIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<QuestionType | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const topics = useMemo(
    () => Array.from(new Set(MOCK_QUESTIONS.map((q) => q.topic))),
    []
  );

  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter((q) => {
      if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterDifficulty !== null && q.difficulty !== filterDifficulty) return false;
      if (filterType !== null && q.type !== filterType) return false;
      if (filterTopic !== null && q.topic !== filterTopic) return false;
      return true;
    });
  }, [searchQuery, filterDifficulty, filterType, filterTopic]);

  const clearFilters = () => {
    setFilterDifficulty(null);
    setFilterType(null);
    setFilterTopic(null);
    setSearchQuery('');
  };

  const hasActiveFilters = filterDifficulty !== null || filterType !== null || filterTopic !== null;

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Question Bank</h3>
        </div>
        <span className="text-xs text-gray-400 dark:text-white/40">
          {selectedIds.length} selected / {MOCK_QUESTIONS.length} total
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B] rounded-lg">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-[#E40000]/10 border-[#E40000]/30 text-[#E40000]'
                : 'bg-gray-100 dark:bg-[#22272B]/50 border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/30 border border-gray-200 dark:border-[#22272B] space-y-3">
            {/* Difficulty filter */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5">
                Difficulty
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDifficulty(filterDifficulty === d ? null : d)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors ${
                      filterDifficulty === d
                        ? 'bg-gray-100 dark:bg-white/10 border-white/30 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOTS[d].color}`} />
                    {DIFFICULTY_DOTS[d].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(filterType === t ? null : t)}
                    className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                      filterType === t
                        ? 'bg-gray-100 dark:bg-white/10 border-white/30 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic filter */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5">
                Topic
              </label>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setFilterTopic(filterTopic === topic ? null : topic)}
                    className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                      filterTopic === topic
                        ? 'bg-gray-100 dark:bg-white/10 border-white/30 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#E40000] hover:text-[#E40000]/80 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Question list */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-white/40 text-center py-8">No questions match your filters</p>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[#E40000]/10 border-[#E40000]/30'
                      : 'bg-gray-100 dark:bg-[#22272B]/30 border-gray-200 dark:border-[#22272B] hover:bg-gray-100 dark:hover:bg-[#22272B]/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox */}
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#E40000] border-[#E40000]'
                          : 'border-gray-300 dark:border-[#333] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-gray-900 dark:text-white" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Question text */}
                      <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-2">{q.text}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[q.type]}`}>
                          {TYPE_LABELS[q.type]}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((d) => (
                            <span
                              key={d}
                              className={`w-1.5 h-1.5 rounded-full ${
                                d <= q.difficulty
                                  ? DIFFICULTY_DOTS[q.difficulty].color
                                  : 'bg-gray-100 dark:bg-[#22272B]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">{q.topic}</span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30 ml-auto">
                          Used {q.usageCount}x
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-[#22272B]">
        <p className="text-xs text-gray-400 dark:text-white/40">
          Showing {filteredQuestions.length} of {MOCK_QUESTIONS.length} questions
        </p>
      </div>
    </div>
  );
};

export default QuestionBankBrowser;
