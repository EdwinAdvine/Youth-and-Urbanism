/**
 * TipTapEditor - Real rich text editor powered by TipTap + StarterKit.
 *
 * Features: Bold, Italic, Strike, Headings (H2/H3), Bullet + Ordered lists,
 * Code inline, Code block, Blockquote, Horizontal rule, Undo/Redo.
 */
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Code2,
  Quote,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon, label, onClick, isActive, disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-[#FF0000]/15 text-[#FF0000]'
        : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {icon}
  </button>
);

const Divider = () => (
  <span className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 self-center" />
);

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your content here...',
  minHeight = '220px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-prose focus:outline-none',
        style: `min-height: ${minHeight}; padding: 1rem;`,
        'data-placeholder': placeholder,
      },
    },
  });

  // Sync when parent resets content externally
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  if (!editor) return null;

  const sz = 'w-4 h-4';

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
          <ToolbarButton icon={<Bold className={sz} />} label="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')} />
          <ToolbarButton icon={<Italic className={sz} />} label="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')} />
          <ToolbarButton icon={<Strikethrough className={sz} />} label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')} />
          <Divider />
          <ToolbarButton icon={<Heading2 className={sz} />} label="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })} />
          <ToolbarButton icon={<Heading3 className={sz} />} label="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })} />
          <Divider />
          <ToolbarButton icon={<List className={sz} />} label="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')} />
          <ToolbarButton icon={<ListOrdered className={sz} />} label="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')} />
          <Divider />
          <ToolbarButton icon={<Code className={sz} />} label="Inline Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')} />
          <ToolbarButton icon={<Code2 className={sz} />} label="Code Block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')} />
          <ToolbarButton icon={<Quote className={sz} />} label="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')} />
          <ToolbarButton icon={<Minus className={sz} />} label="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()} />
          <Divider />
          <ToolbarButton icon={<Undo className={sz} />} label="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()} />
          <ToolbarButton icon={<Redo className={sz} />} label="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()} />
        </div>
      )}

      <style>{`
        .tiptap-prose { color: inherit; font-size: 0.875rem; line-height: 1.6; }
        .tiptap-prose:first-child:empty::before {
          content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0;
        }
        .tiptap-prose h2 { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0 0.4rem; }
        .tiptap-prose h3 { font-size: 1.05rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
        .tiptap-prose p { margin: 0.2rem 0; }
        .tiptap-prose ul, .tiptap-prose ol { padding-left: 1.5rem; margin: 0.4rem 0; }
        .tiptap-prose ul { list-style-type: disc; }
        .tiptap-prose ol { list-style-type: decimal; }
        .tiptap-prose code:not(pre code) {
          background: rgba(0,0,0,0.08); border-radius: 3px; padding: 0.1em 0.35em; font-size: 0.82em; font-family: monospace;
        }
        .dark .tiptap-prose code:not(pre code) { background: rgba(255,255,255,0.1); }
        .tiptap-prose pre {
          background: #1e1e1e; color: #d4d4d4; border-radius: 8px; padding: 0.875rem 1rem; overflow-x: auto; margin: 0.5rem 0;
        }
        .tiptap-prose pre code { background: none; padding: 0; font-size: 0.85em; }
        .tiptap-prose blockquote {
          border-left: 3px solid #FF0000; padding-left: 0.875rem; color: #6b7280; margin: 0.4rem 0; font-style: italic;
        }
        .tiptap-prose hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.75rem 0; }
        .dark .tiptap-prose hr { border-top-color: rgba(255,255,255,0.1); }
      `}</style>

      <div className="text-gray-900 dark:text-white">
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
        <span className="text-xs text-gray-400 dark:text-white/30">
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-xs text-gray-400 dark:text-white/30">
          {editor.getText().length} chars
        </span>
      </div>
    </div>
  );
};

export default TipTapEditor;
