import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Eye, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import {
  getAssessments,
  createAssessment,
} from '@/services/staff/staffAssessmentService';
import type { AdaptiveAssessment } from '@/types/staff';
import type { CreateAssessmentPayload } from '@/services/staff/staffAssessmentService';

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const typeColors: Record<string, string> = {
  quiz: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  exam: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  formative: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  diagnostic: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const AssessmentBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<AdaptiveAssessment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewAssessment, setPreviewAssessment] = useState<AdaptiveAssessment | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newAssessment, setNewAssessment] = useState<CreateAssessmentPayload>({
    title: '',
    description: '',
    assessment_type: 'quiz',
    grade_level: '',
    learning_area: '',
    time_limit_minutes: 30,
    is_ai_graded: false,
  });

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAssessments({ page: 1, page_size: 50 });
      setAssessments(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleCreateAssessment = async () => {
    if (!newAssessment.title.trim()) return;
    try {
      setCreating(true);
      setCreateError(null);
      const created = await createAssessment(newAssessment);
      setAssessments((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewAssessment({
        title: '',
        description: '',
        assessment_type: 'quiz',
        grade_level: '',
        learning_area: '',
        time_limit_minutes: 30,
        is_ai_graded: false,
      });
      // Navigate to editor for the newly created assessment
      navigate(`/dashboard/staff/learning/assessments/editor/${created.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create assessment');
    } finally {
      setCreating(false);
    }
  };

  const handlePreview = (assessment: AdaptiveAssessment) => {
    setPreviewAssessment(assessment);
    setShowPreviewModal(true);
  };

  const handleCardClick = (assessmentId: string) => {
    navigate(`/dashboard/staff/learning/assessments/editor/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-white/40 text-sm mb-4">{error}</p>
              <button
                onClick={fetchAssessments}
                className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Builder</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
            >
              <Save className="w-4 h-4" />
              New Assessment
            </button>
          </div>
        </div>

        {/* Assessment Cards Grid */}
        {assessments.length === 0 ? (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Assessment Title</label>
                <input
                  type="text"
                  placeholder="Enter assessment title..."
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
                  onFocus={() => setShowCreateModal(true)}
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-dashed border-gray-200 dark:border-[#2A2F34] rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:border-[#E40000]/30"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                onClick={() => handleCardClick(assessment.id)}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{assessment.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                      {assessment.learning_area || 'No subject'} {assessment.grade_level ? `- ${assessment.grade_level}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ml-2 ${statusColors[assessment.status]}`}>
                    {assessment.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${typeColors[assessment.assessment_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {assessment.assessment_type}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-white/40">
                    {assessment.total_questions} question{assessment.total_questions !== 1 ? 's' : ''}
                  </span>
                  {assessment.time_limit_minutes && (
                    <span className="text-[10px] text-gray-400 dark:text-white/40">
                      {assessment.time_limit_minutes} min
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#22272B]">
                  <span className="text-[10px] text-gray-400 dark:text-white/30">
                    by {assessment.author?.name ?? 'Unknown'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(assessment);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Assessment Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center justify-center gap-2 p-5 border border-dashed border-gray-300 dark:border-[#333] rounded-xl text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:border-[#E40000]/40 transition-colors min-h-[160px]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Create New Assessment</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Assessment</h2>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Title *</label>
                <input
                  type="text"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  placeholder="Enter assessment title..."
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 placeholder-white/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Description</label>
                <textarea
                  value={newAssessment.description || ''}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 resize-none placeholder-white/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Type</label>
                  <select
                    value={newAssessment.assessment_type}
                    onChange={(e) => setNewAssessment({ ...newAssessment, assessment_type: e.target.value as CreateAssessmentPayload['assessment_type'] })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="formative">Formative</option>
                    <option value="diagnostic">Diagnostic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Time Limit (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={newAssessment.time_limit_minutes || 30}
                    onChange={(e) => setNewAssessment({ ...newAssessment, time_limit_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Learning Area</label>
                  <input
                    type="text"
                    value={newAssessment.learning_area || ''}
                    onChange={(e) => setNewAssessment({ ...newAssessment, learning_area: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={newAssessment.grade_level || ''}
                    onChange={(e) => setNewAssessment({ ...newAssessment, grade_level: e.target.value })}
                    placeholder="e.g. Grade 4"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAssessment.is_ai_graded || false}
                    onChange={(e) => setNewAssessment({ ...newAssessment, is_ai_graded: e.target.checked })}
                    className="accent-[#E40000]"
                  />
                  <span className="text-xs text-gray-500 dark:text-white/60">Enable AI Grading</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssessment}
                disabled={creating || !newAssessment.title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{previewAssessment.title}</h3>
                {previewAssessment.description && (
                  <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{previewAssessment.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Type</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{previewAssessment.assessment_type}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Status</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{previewAssessment.status}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Questions</p>
                  <p className="text-sm text-gray-900 dark:text-white">{previewAssessment.total_questions}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Time Limit</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {previewAssessment.time_limit_minutes ? `${previewAssessment.time_limit_minutes} min` : 'None'}
                  </p>
                </div>
              </div>

              {previewAssessment.learning_area && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="text-sm text-gray-500 dark:text-white/60">
                    {previewAssessment.learning_area}
                    {previewAssessment.grade_level ? ` - ${previewAssessment.grade_level}` : ''}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {previewAssessment.is_ai_graded && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    AI Graded
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400 dark:text-white/30">
                Created: {new Date(previewAssessment.created_at).toLocaleDateString('en-KE')} | Updated: {new Date(previewAssessment.updated_at).toLocaleDateString('en-KE')}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleCardClick(previewAssessment.id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
              >
                Open Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentBuilderPage;
