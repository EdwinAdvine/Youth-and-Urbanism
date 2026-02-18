import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import KBEditor from '../../components/staff/knowledge/KBEditor';
import {
  getArticle,
  createArticle,
  updateArticle,
} from '@/services/staff/staffKnowledgeBaseService';

const KBArticleEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const isEditing = Boolean(articleId);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    isFeatured: boolean;
  } | undefined>(undefined);

  useEffect(() => {
    if (!articleId) return;

    const loadArticle = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const article = await getArticle(articleId);
        setInitialData({
          title: article.title,
          content: article.body,
          category: article.category?.name || 'technical',
          tags: article.tags,
          isFeatured: false,
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  const handleSave = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isFeatured: boolean;
  }) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isEditing && articleId) {
        await updateArticle(articleId, {
          title: data.title,
          body: data.content,
          tags: data.tags,
        });
      } else {
        await createArticle({
          title: data.title,
          body: data.content,
          tags: data.tags,
          status: 'draft',
        });
      }
      navigate('/dashboard/staff/support/kb');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#FF4444] animate-spin" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load article</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{loadError}</p>
          <button
            onClick={() => navigate('/dashboard/staff/support/kb')}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            Back to Knowledge Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/staff/support/kb')}
          className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </button>

        {saveError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{saveError}</p>
          </div>
        )}

        <KBEditor
          articleId={articleId}
          initialData={initialData}
          onSave={handleSave}
          onCancel={() => navigate('/dashboard/staff/support/kb')}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default KBArticleEditorPage;
