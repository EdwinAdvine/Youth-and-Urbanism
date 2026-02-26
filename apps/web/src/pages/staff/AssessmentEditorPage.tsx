import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getAssessment,
  updateAssessment,
  addQuestion,
  deleteQuestion as deleteQuestionApi,
} from '@/services/staff/staffAssessmentService';

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

interface RubricEntry {
  criterion: string;
  description: string;
  max_score: number;
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
  rubric: RubricEntry[];
  created_at: string;
  updated_at: string;
}

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

// Map API question types to local display types
const mapQuestionTypeFromApi = (apiType: string): Question['type'] => {
  const mapping: Record<string, Question['type']> = {
    mcq: 'multiple_choice',
    short_answer: 'short_answer',
    essay: 'essay',
    matching: 'matching',
    fill_blank: 'short_answer',
    ordering: 'matching',
  };
  return mapping[apiType] || 'short_answer';
};

const mapQuestionTypeToApi = (localType: Question['type']): string => {
  const mapping: Record<string, string> = {
    multiple_choice: 'mcq',
    short_answer: 'short_answer',
    essay: 'essay',
    matching: 'matching',
    true_false: 'mcq',
  };
  return mapping[localType] || 'short_answer';
};

const mapAssessmentTypeFromApi = (apiType: string): Assessment['type'] => {
  const mapping: Record<string, Assessment['type']> = {
    quiz: 'quiz',
    exam: 'exam',
    formative: 'assignment',
    diagnostic: 'practice',
  };
  return mapping[apiType] || 'quiz';
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const AssessmentEditorPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment>({
    id: '',
    title: '',
    type: 'quiz',
    status: 'draft',
    subject: '',
    grade_level: '',
    time_limit_minutes: 45,
    passing_score: 60,
    adaptive_enabled: false,
    ai_grading_enabled: false,
    shuffle_questions: false,
    show_feedback: true,
    questions: [],
    rubric: [],
    created_at: '',
    updated_at: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'multiple_choice' as Question['type'],
    difficulty: 2,
    points: 5,
  });

  const fetchAssessment = useCallback(async () => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getAssessment(assessmentId);
      setAssessment({
        id: data.id,
        title: data.title || '',
        type: mapAssessmentTypeFromApi(data.assessment_type),
        status: data.status,
        subject: data.learning_area || '',
        grade_level: data.grade_level || '',
        time_limit_minutes: data.time_limit_minutes || 45,
        passing_score: data.adaptive_config?.step_up_threshold || 60,
        adaptive_enabled: data.adaptive_config?.initial_difficulty > 0,
        ai_grading_enabled: data.is_ai_graded,
        shuffle_questions: false,
        show_feedback: true,
        questions: [],
        rubric: data.rubric
          ? Object.entries(data.rubric).map(([key, val]) => ({
              criterion: key,
              description: String(val || ''),
              max_score: 10,
            }))
          : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  // Clear save messages after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleTitleChange = (title: string) => {
    setAssessment({ ...assessment, title });
  };

  const handleTypeChange = (type: Assessment['type']) => {
    setAssessment({ ...assessment, type });
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) return;
    if (assessmentId) {
      try {
        const created = await addQuestion(assessmentId, {
          question_text: newQuestion.text,
          question_type: mapQuestionTypeToApi(newQuestion.type) as 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering',
          difficulty: newQuestion.difficulty as 1 | 2 | 3 | 4 | 5,
          points: newQuestion.points,
        });
        const q: Question = {
          id: created.id,
          text: created.question_text,
          type: mapQuestionTypeFromApi(created.question_type),
          difficulty: created.difficulty,
          points: created.points,
          adaptive_paths: [],
        };
        setAssessment({ ...assessment, questions: [...assessment.questions, q] });
      } catch (err) {
        setSaveMessage(`Failed to add question: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      const q: Question = {
        id: `Q-${String(assessment.questions.length + 1).padStart(3, '0')}`,
        text: newQuestion.text,
        type: newQuestion.type,
        difficulty: newQuestion.difficulty,
        points: newQuestion.points,
        adaptive_paths: [],
      };
      setAssessment({ ...assessment, questions: [...assessment.questions, q] });
    }
    setNewQuestion({ text: '', type: 'multiple_choice', difficulty: 2, points: 5 });
    setShowAddForm(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (assessmentId) {
      try {
        await deleteQuestionApi(questionId);
      } catch (err) {
        setSaveMessage(`Failed to delete question: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
      }
    }
    setAssessment({
      ...assessment,
      questions: assessment.questions.filter((q) => q.id !== questionId),
    });
  };

  const handleCopyQuestion = (question: Question) => {
    const copiedQuestion: Question = {
      ...question,
      id: `Q-COPY-${Date.now()}`,
      text: `${question.text} (copy)`,
      adaptive_paths: [...question.adaptive_paths],
    };
    const index = assessment.questions.findIndex((q) => q.id === question.id);
    const newQuestions = [...assessment.questions];
    newQuestions.splice(index + 1, 0, copiedQuestion);
    setAssessment({ ...assessment, questions: newQuestions });
  };

  const handleSaveDraft = async () => {
    if (!assessmentId) return;
    try {
      setSaving(true);
      await updateAssessment(assessmentId, {
        title: assessment.title,
        time_limit_minutes: assessment.time_limit_minutes,
        is_ai_graded: assessment.ai_grading_enabled,
        status: 'draft',
        rubric: assessment.rubric.length > 0
          ? Object.fromEntries(assessment.rubric.map((r) => [r.criterion, r.description]))
          : undefined,
      });
      setSaveMessage('Draft saved successfully');
    } catch (err) {
      setSaveMessage(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!assessmentId) return;
    try {
      setActivating(true);
      await updateAssessment(assessmentId, { status: 'active' });
      setAssessment({ ...assessment, status: 'active' });
      setSaveMessage('Assessment activated');
    } catch (err) {
      setSaveMessage(`Failed to activate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActivating(false);
    }
  };

  const handleAddRubric = () => {
    setAssessment({
      ...assessment,
      rubric: [
        ...assessment.rubric,
        { criterion: '', description: '', max_score: 10 },
      ],
    });
  };

  const handleUpdateRubric = (index: number, field: keyof RubricEntry, value: string | number) => {
    const updatedRubric = [...assessment.rubric];
    updatedRubric[index] = { ...updatedRubric[index], [field]: value };
    setAssessment({ ...assessment, rubric: updatedRubric });
  };

  const handleRemoveRubric = (index: number) => {
    setAssessment({
      ...assessment,
      rubric: assessment.rubric.filter((_, i) => i !== index),
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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-white/40 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAssessment}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 text-sm"
          >
            Retry
          </button>
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
      {/* Save status message */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm ${saveMessage.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
          {saveMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
        <span
          onClick={() => navigate('/dashboard/staff/learning/assessments')}
          className="hover:text-gray-500 dark:hover:text-white/60 cursor-pointer transition-colors"
        >
          Assessment Builder
        </span>
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
                  <button
                    onClick={() => handleCopyQuestion(question)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                    title="Duplicate question"
                  >
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

          {/* Rubric */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500 dark:text-white/50" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rubric</h3>
            </div>
            {assessment.rubric.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-white/30">No rubric attached. Click below to create or upload one.</p>
            ) : (
              <div className="space-y-2 mb-2">
                {assessment.rubric.map((entry, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg space-y-1">
                    <input
                      type="text"
                      value={entry.criterion}
                      onChange={(e) => handleUpdateRubric(index, 'criterion', e.target.value)}
                      placeholder="Criterion name"
                      className="w-full px-2 py-1 bg-transparent text-xs text-gray-900 dark:text-white border-b border-transparent focus:border-[#E40000]/50 focus:outline-none placeholder-white/30"
                    />
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleUpdateRubric(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 py-1 bg-transparent text-[10px] text-gray-500 dark:text-white/60 border-b border-transparent focus:border-[#E40000]/50 focus:outline-none placeholder-white/30"
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={entry.max_score}
                        onChange={(e) => handleUpdateRubric(index, 'max_score', Number(e.target.value))}
                        className="w-16 px-2 py-0.5 bg-transparent text-[10px] text-gray-400 dark:text-white/40 border border-gray-300 dark:border-[#333] rounded focus:outline-none"
                        min={1}
                      />
                      <button
                        onClick={() => handleRemoveRubric(index)}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAddRubric}
              className="mt-2 text-xs text-[#E40000] hover:text-[#E40000]/80 transition-colors"
            >
              + Add Rubric
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving || !assessmentId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            <button
              onClick={handleActivate}
              disabled={activating || !assessmentId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Activate
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AssessmentEditorPage;
