import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KBEditor from '../../components/staff/knowledge/KBEditor';

const KBArticleEditorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </button>

        <KBEditor
          onSave={(data) => console.log('Save:', data)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default KBArticleEditorPage;
