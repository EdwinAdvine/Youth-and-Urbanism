import React, { useState } from 'react';
import { Save, Eye, X, Tag, Folder, Star } from 'lucide-react';

interface KBEditorProps {
  articleId?: string;
  initialData?: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isFeatured: boolean;
  };
  onSave: (data: ArticleData) => void;
  onCancel: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
}

interface ArticleData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
}

const KBEditor: React.FC<KBEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isSaving,
}) => {
  const [data, setData] = useState<ArticleData>(
    initialData || {
      title: '',
      content: '',
      category: 'technical',
      tags: [],
      isFeatured: false,
    }
  );
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData({ ...data, tags: [...data.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setData({ ...data, tags: data.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-white">
          {initialData ? 'Edit Article' : 'New Article'}
        </h3>
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/60 rounded-lg hover:bg-white/5"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
          <button
            onClick={onCancel}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-white/50 block mb-1.5">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Article title..."
            className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#E40000]/30 outline-none"
          />
        </div>

        {/* Category & Featured */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5 flex items-center gap-1">
              <Folder className="w-3 h-3" />
              Category
            </label>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="technical">Technical</option>
              <option value="policy">Policy</option>
              <option value="support">Support</option>
              <option value="training">Training</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Options</label>
            <label className="flex items-center gap-2 p-2 bg-[#22272B] border border-[#2A2F34] rounded-lg cursor-pointer hover:border-[#2A2F34]">
              <input
                type="checkbox"
                checked={data.isFeatured}
                onChange={(e) => setData({ ...data, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded bg-[#181C1F] border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
              />
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-sm text-white">Featured</span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-white/50 block mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag..."
              className="flex-1 bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-[#22272B] text-white/60 rounded-lg hover:bg-[#2A2F34]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[#22272B] text-xs text-white/60 rounded-full flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-white/30 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-xs text-white/50 block mb-1.5">Content (Markdown supported)</label>
          <textarea
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            placeholder="Write your article content here..."
            className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#E40000]/30 outline-none resize-none font-mono"
            rows={15}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave(data)}
            disabled={!data.title.trim() || !data.content.trim() || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000]/20 text-[#FF4444] text-sm font-medium rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Article'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-white/5 text-white/50 text-sm rounded-lg hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default KBEditor;
