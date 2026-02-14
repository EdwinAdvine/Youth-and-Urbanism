import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  GripVertical,
  Plus,
  Save,
  Zap,
  Brain,
  Settings,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  FileText,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AdaptivePath {
  condition: string;
  next_question_id: string;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'matching' | 'true_false';
  difficulty: number;
  points: number;
  adaptive_paths: AdaptivePath[];
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'exam' | 'assignment' | 'practice';
  status: 'draft' | 'active' | 'archived';
  subject: string;
  grade_level: string;
  time_limit_minutes: number;
  passing_score: number;
  adaptive_enabled: boolean;
  ai_grading_enabled: boolean;
  shuffle_questions: boolean;
  show_feedback: boolean;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_ASSESSMENT: Assessment = {
  id: 'ASM-001',
  title: 'Grade 4 Mathematics - Fractions & Decimals',
  type: 'quiz',
  status: 'draft',
  subject: 'Mathematics',
  grade_level: 'Grade 4',
  time_limit_minutes: 45,
  passing_score: 60,
  adaptive_enabled: true,
  ai_grading_enabled: true,
  shuffle_questions: false,
  show_feedback: true,
  questions: [
    { id: 'Q-001', text: 'What is 1/4 + 1/2? Express your answer as a fraction.', type: 'short_answer', difficulty: 2, points: 5, adaptive_paths: [{ condition: 'correct', next_question_id: 'Q-003' }, { condition: 'incorrect', next_question_id: 'Q-002' }] },
    { id: 'Q-002', text: 'Which of the following fractions is equivalent to 1/2?', type: 'multiple_choice', difficulty: 1, points: 3, adaptive_paths: [] },
    { id: 'Q-003', text: 'Convert 0.75 to a fraction in its simplest form.', type: 'short_answer', difficulty: 3, points: 5, adaptive_paths: [{ condition: 'correct', next_question_id: 'Q-005' }] },
    { id: 'Q-004', text: 'True or False: 3/4 is greater than 0.8', type: 'true_false', difficulty: 2, points: 2, adaptive_paths: [] },
    { id: 'Q-005', text: 'Explain why 1/3 cannot be expressed exactly as a decimal. Use mathematical reasoning.', type: 'essay', difficulty: 4, points: 10, adaptive_paths: [] },
    { id: 'Q-006', text: 'Match each fraction with its decimal equivalent.', type: 'matching', difficulty: 3, points: 8, adaptive_paths: [] },
    { id: 'Q-007', text: 'A farmer has 3/5 of an acre. He plants maize on 2/3 of that land. What fraction of the total acre is planted with maize?', type: 'short_answer', difficulty: 4, points: 8, adaptive_paths: [] },
    { id: 'Q-008', text: 'Arrange the following in ascending order: 0.5, 1/3, 0.25, 3/8', type: 'short_answer', difficulty: 3, points: 5, adaptive_paths: [] },
  ],
  created_at: '2025-01-10T08:00:00Z',
  updated_at: '2025-01-15T14:30:00Z',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const typeColors: Record<string, string> = {
  multiple_choice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  short_answer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  essay: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  matching: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  true_false: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const difficultyLabels = ['', 'Easy', 'Medium', 'Hard', 'Advanced', 'Expert'];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const AssessmentEditorPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment>(MOCK_ASSESSMENT);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'multiple_choice' as Question['type'],
    difficulty: 2,
    points: 5,
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleTitleChange = (title: string) => {
    setAssessment({ ...assessment, title });
  };

  const handleTypeChange = (type: Assessment['type']) => {
    setAssessment({ ...assessment, type });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    const q: Question = {
      id: `Q-${String(assessment.questions.length + 1).padStart(3, '0')}`,
      text: newQuestion.text,
      type: newQuestion.type,
      difficulty: newQuestion.difficulty,
      points: newQuestion.points,
      adaptive_paths: [],
    };
    setAssessment({ ...assessment, questions: [...assessment.questions, q] });
    setNewQuestion({ text: '', type: 'multiple_choice', difficulty: 2, points: 5 });
    setShowAddForm(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setAssessment({
      ...assessment,
      questions: assessment.questions.filter((q) => q.id !== questionId),
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse w-64" />
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
        <span className="hover:text-gray-500 dark:hover:text-white/60 cursor-pointer transition-colors">Assessment Builder</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">Edit Assessment</span>
        {assessmentId && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-500 dark:text-white/60 font-mono text-xs">{assessmentId}</span>
          </>
        )}
      </motion.div>

      {/* Assessment Header */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={assessment.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-xl font-semibold bg-transparent text-gray-900 dark:text-white border-b border-transparent hover:border-gray-300 dark:hover:border-[#333] focus:border-[#E40000]/50 focus:outline-none pb-1 transition-colors"
              placeholder="Assessment Title"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={assessment.type}
                onChange={(e) => handleTypeChange(e.target.value as Assessment['type'])}
                className="px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
              >
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="practice">Practice</option>
              </select>
              <span className="text-sm text-gray-500 dark:text-white/50">{assessment.subject} - {assessment.grade_level}</span>
              <span className="text-sm text-gray-400 dark:text-white/40">{assessment.questions.length} questions</span>
              <span className="text-sm text-gray-400 dark:text-white/40">{assessment.questions.reduce((s, q) => s + q.points, 0)} points total</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[assessment.status]}`}>
            {assessment.status}
          </span>
        </div>
      </motion.div>

      {/* Main content: Questions + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Questions List */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-3">
          {assessment.questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl hover:border-gray-300 dark:hover:border-[#333] transition-colors"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex items-center gap-2 mt-1">
                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/20 cursor-grab" />
                  <span className="text-xs font-mono text-gray-400 dark:text-white/30 w-6">{index + 1}.</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{question.text}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${typeColors[question.type]}`}>
                      {question.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-white/40">{question.points} pts</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-3 rounded-full ${
                            level <= question.difficulty ? 'bg-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B]'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-gray-400 dark:text-white/30 ml-1">{difficultyLabels[question.difficulty]}</span>
                    </div>
                    {question.adaptive_paths.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400">
                        <Zap className="w-3 h-3" />
                        {question.adaptive_paths.length} path{question.adaptive_paths.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                  >
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 dark:text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedQuestion === question.id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-[#22272B] mt-0">
                  <div className="pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 dark:text-white/40 mb-1">Question Type</label>
                        <span className="text-xs text-gray-500 dark:text-white/60 capitalize">{question.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 dark:text-white/40 mb-1">Points</label>
                        <span className="text-xs text-gray-500 dark:text-white/60">{question.points}</span>
                      </div>
                    </div>
                    {question.adaptive_paths.length > 0 && (
                      <div>
                        <label className="block text-[10px] text-gray-400 dark:text-white/40 mb-1">Adaptive Paths</label>
                        <div className="space-y-1">
                          {question.adaptive_paths.map((path, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${path.condition === 'correct' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {path.condition}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-300 dark:text-white/20" />
                              <span className="text-gray-500 dark:text-white/50 font-mono">{path.next_question_id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Question Button / Form */}
          {showAddForm ? (
            <div className="bg-white dark:bg-[#181C1F] border border-[#E40000]/30 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Add New Question</h4>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="Enter question text..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 resize-none placeholder-white/30"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="matching">Matching</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Difficulty (1-5)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: Number(e.target.value) })}
                    className="w-full mt-2 accent-[#E40000]"
                  />
                  <span className="text-xs text-gray-500 dark:text-white/50">{difficultyLabels[newQuestion.difficulty]}</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Points</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 dark:border-[#333] rounded-xl text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:border-[#E40000]/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          )}
        </motion.div>

        {/* Sidebar: Config */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Assessment Config */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-gray-500 dark:text-white/50" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Configuration</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Time Limit (min)</label>
                <input
                  type="number"
                  value={assessment.time_limit_minutes}
                  onChange={(e) => setAssessment({ ...assessment, time_limit_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  value={assessment.passing_score}
                  onChange={(e) => setAssessment({ ...assessment, passing_score: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Adaptive Config */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Adaptive Config</h3>
            </div>
            <div className="space-y-3">
              {([
                { key: 'adaptive_enabled' as const, label: 'Adaptive Paths', desc: 'Route students by performance' },
                { key: 'ai_grading_enabled' as const, label: 'AI Grading', desc: 'Auto-grade using AI' },
                { key: 'shuffle_questions' as const, label: 'Shuffle Questions', desc: 'Randomize order per student' },
                { key: 'show_feedback' as const, label: 'Show Feedback', desc: 'Display results after completion' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-900 dark:text-white">{label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-white/30">{desc}</div>
                  </div>
                  <button
                    onClick={() => setAssessment({ ...assessment, [key]: !assessment[key] })}
                    className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {assessment[key] ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400 dark:text-white/30" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rubric placeholder */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500 dark:text-white/50" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rubric</h3>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/30">No rubric attached. Click below to create or upload one.</p>
            <button className="mt-2 text-xs text-[#E40000] hover:text-[#E40000]/80 transition-colors">
              + Add Rubric
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm hover:border-gray-300 dark:hover:border-[#444] transition-colors">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
              <Zap className="w-4 h-4" />
              Activate
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AssessmentEditorPage;
