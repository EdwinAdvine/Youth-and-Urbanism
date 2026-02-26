import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Info,
} from 'lucide-react';

interface Collaborator {
  name: string;
  color: string;
}

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  collaborators?: Collaborator[];
  readOnly?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {icon}
  </button>
);

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  collaborators = [],
  readOnly = false,
}) => {
  const [showNotice] = useState(true);

  const toolbarActions = [
    { icon: <Bold className="w-4 h-4" />, label: 'Bold' },
    { icon: <Italic className="w-4 h-4" />, label: 'Italic' },
    { icon: <Heading1 className="w-4 h-4" />, label: 'Heading 1' },
    { icon: <Heading2 className="w-4 h-4" />, label: 'Heading 2' },
    { icon: <List className="w-4 h-4" />, label: 'Bullet List' },
    { icon: <ListOrdered className="w-4 h-4" />, label: 'Ordered List' },
    { icon: <Link className="w-4 h-4" />, label: 'Link' },
    { icon: <Image className="w-4 h-4" />, label: 'Image' },
    { icon: <Code className="w-4 h-4" />, label: 'Code Block' },
  ];

  const handleToolbarClick = (label: string) => {
    const wrappers: Record<string, [string, string]> = {
      Bold: ['**', '**'],
      Italic: ['_', '_'],
      'Heading 1': ['# ', ''],
      'Heading 2': ['## ', ''],
      'Bullet List': ['- ', ''],
      'Ordered List': ['1. ', ''],
      Link: ['[', '](url)'],
      Image: ['![alt](', ')'],
      'Code Block': ['```\n', '\n```'],
    };

    const wrapper = wrappers[label];
    if (wrapper) {
      onChange(`${content}${wrapper[0]}text${wrapper[1]}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Collaborators Strip */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-[#22272B] bg-[#1a1f23]">
          <span className="text-xs text-gray-400 dark:text-white/40 mr-1">Editing:</span>
          {collaborators.map((collaborator, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-[#181C1F]"
                style={{ backgroundColor: collaborator.color }}
              />
              <span className="text-xs text-gray-500 dark:text-white/60">{collaborator.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-[#22272B] bg-[#1a1f23]">
        {toolbarActions.map((action) => (
          <ToolbarButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            onClick={() => handleToolbarClick(action.label)}
            disabled={readOnly}
          />
        ))}
      </div>

      {/* TipTap Notice */}
      {showNotice && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-xs text-blue-400">
            TipTap + Yjs will be initialized when packages are installed. Using textarea fallback.
          </span>
        </div>
      )}

      {/* Editor Area */}
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Start writing your content..."
        className="w-full min-h-[300px] p-4 bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed resize-y outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 disabled:opacity-50"
        disabled={readOnly}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-[#22272B] bg-[#1a1f23]">
        <span className="text-xs text-gray-400 dark:text-white/30">
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-xs text-gray-400 dark:text-white/30">
          {content.length} characters
        </span>
      </div>
    </div>
  );
};

export default TipTapEditor;
