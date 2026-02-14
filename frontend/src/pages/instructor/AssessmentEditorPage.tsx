import React, { useEffect, useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  points: number;
  order: number;
}

interface AssessmentFormData {
  title: string;
  description: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'exam';
  course_id: string;
  max_score: number;
  time_limit?: number;
  due_date?: string;
  instructions: string;
  questions: Question[];
  status: 'draft' | 'published';
}

export const AssessmentEditorPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    assessment_type: 'quiz',
    course_id: '',
    max_score: 100,
    instructions: '',
    questions: [],
    status: 'draft',
  });

  useEffect(() => {
    if (assessmentId && assessmentId !== 'create') {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/v1/instructor/assessments/${assessmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      alert('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.course_id) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      const dataToSave = { ...formData, status };

      if (assessmentId && assessmentId !== 'create') {
        await axios.put(
          `${API_URL}/api/v1/instructor/assessments/${assessmentId}`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_URL}/api/v1/instructor/assessments`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert(`Assessment ${status === 'published' ? 'published' : 'saved'} successfully!`);
      navigate('/dashboard/instructor/assessments');
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: '',
      question_type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: '',
      points: 10,
      order: formData.questions.length + 1,
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== questionId),
    });
  };

  const handleUpdateQuestion = (questionId: string, field: string, value: any) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    });
  };

  const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    });
  };

  const questionTypeLabels = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay',
  };

  const isNewAssessment = assessmentId === 'create' || !assessmentId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title={isNewAssessment ? 'Create Assessment' : 'Edit Assessment'}
        description="Design quizzes, assignments, and exams with AI assistance"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/assessments')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Publish
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Algebra Unit Test"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the assessment"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Instructions for students (how to complete, submission guidelines, etc.)"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions ({formData.questions.length})</h3>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Q{index + 1}</span>
                      <select
                        value={question.question_type}
                        onChange={(e) =>
                          handleUpdateQuestion(question.id, 'question_type', e.target.value)
                        }
                        className="px-3 py-1 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                      >
                        {Object.entries(questionTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          handleUpdateQuestion(question.id, 'points', Number(e.target.value))
                        }
                        min="1"
                        className="w-20 px-2 py-1 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                      />
                      <span className="text-sm text-gray-500 dark:text-white/60">pts</span>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={question.question_text}
                    onChange={(e) =>
                      handleUpdateQuestion(question.id, 'question_text', e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={2}
                    className="w-full px-3 py-2 mb-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                  />

                  {/* Options for multiple choice */}
                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct_answer === option}
                            onChange={() =>
                              handleUpdateQuestion(question.id, 'correct_answer', option)
                            }
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleUpdateOption(question.id, optIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-2">
                        Select the correct answer
                      </p>
                    </div>
                  )}

                  {/* True/False */}
                  {question.question_type === 'true_false' && (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct_answer === 'true'}
                          onChange={() =>
                            handleUpdateQuestion(question.id, 'correct_answer', 'true')
                          }
                          className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">True</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct_answer === 'false'}
                          onChange={() =>
                            handleUpdateQuestion(question.id, 'correct_answer', 'false')
                          }
                          className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">False</span>
                      </label>
                    </div>
                  )}

                  {/* Short Answer / Essay */}
                  {(question.question_type === 'short_answer' ||
                    question.question_type === 'essay') && (
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, 'correct_answer', e.target.value)
                      }
                      placeholder="Model answer or grading rubric keywords"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  )}
                </div>
              ))}

              {formData.questions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-white/60 mb-4">No questions yet. Add your first question.</p>
                  <button
                    onClick={handleAddQuestion}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                  >
                    Add First Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Type</label>
                <select
                  value={formData.assessment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assessment_type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Course ID *
                </label>
                <input
                  type="text"
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  placeholder="Course ID"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={formData.time_limit || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_limit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  min="1"
                  placeholder="Optional"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Question Generator
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
              Generate questions automatically based on your course content
            </p>
            <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium">
              Generate Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
