import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getContentItem,
  createContent,
  updateContent,
} from '@/services/staff/staffContentService';
import type { CreateContentPayload, UpdateContentPayload } from '@/services/staff/staffContentService';

const ContentEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const isEditing = Boolean(contentId);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState<CreateContentPayload['content_type']>('lesson');
  const [gradeLevels, setGradeLevels] = useState('');
  const [learningArea, setLearningArea] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) return;

    const loadContent = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const item = await getContentItem(contentId);
        setTitle(item.title);
        setBody(item.body || '');
        setContentType(item.content_type);
        setGradeLevels(item.grade_levels.join(', '));
        setLearningArea(item.learning_area || '');
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const parsedGrades = gradeLevels
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      if (isEditing && contentId) {
        const payload: UpdateContentPayload = {
          title,
          body,
          grade_levels: parsedGrades.length > 0 ? parsedGrades : undefined,
          learning_area: learningArea || undefined,
        };
        await updateContent(contentId, payload);
      } else {
        const payload: CreateContentPayload = {
          title,
          content_type: contentType,
          body,
          grade_levels: parsedGrades.length > 0 ? parsedGrades : undefined,
          learning_area: learningArea || undefined,
        };
        await createContent(payload);
      }
      navigate('/dashboard/staff/learning/content');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF4444] animate-spin" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load content</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{loadError}</p>
          <button
            onClick={() => navigate('/dashboard/staff/learning/content')}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            Back to Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard/staff/learning/content')}
            className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Content'}
          </button>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{saveError}</p>
          </div>
        )}

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Content title..."
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
              />
            </div>
            {!isEditing && (
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as CreateContentPayload['content_type'])}
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                >
                  <option value="lesson">Lesson</option>
                  <option value="quiz">Quiz</option>
                  <option value="worksheet">Worksheet</option>
                  <option value="activity">Activity</option>
                  <option value="resource">Resource</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Grade Levels (comma-separated)</label>
                <input
                  type="text"
                  value={gradeLevels}
                  onChange={(e) => setGradeLevels(e.target.value)}
                  placeholder="e.g. Grade 4, Grade 5"
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Learning Area</label>
                <input
                  type="text"
                  value={learningArea}
                  onChange={(e) => setLearningArea(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Description</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Content description..."
                rows={4}
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorPage;
