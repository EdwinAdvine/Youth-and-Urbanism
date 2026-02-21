/**
 * LessonEditor - Rich lesson editing panel for CreateCoursePage.
 *
 * Displays title, type, duration, video URL (for video lessons),
 * and a TipTap rich text editor for the lesson body content.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, GripVertical, Video, FileText } from 'lucide-react';
import TipTapEditor from '../staff/content/TipTapEditor';
import type { Lesson } from '../../types/course';

interface LessonEditorProps {
  lesson: Lesson & { content?: string; video_url?: string };
  index: number;
  onUpdate: (updates: Partial<Lesson & { content?: string; video_url?: string }>) => void;
  onRemove: () => void;
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  reading: 'Reading',
  quiz: 'Quiz',
  assignment: 'Assignment',
  interactive: 'Interactive',
  live_session: 'Live Session',
};

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 dark:border-[#22272B] rounded-lg bg-white dark:bg-[#0F1112] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm';

const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, index, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden bg-white dark:bg-[#181C1F]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#0F1112] border-b border-gray-200 dark:border-[#22272B]">
        <GripVertical className="w-4 h-4 text-gray-400 dark:text-white/30 shrink-0 cursor-grab" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-400 dark:text-white/40 shrink-0">
            #{index + 1}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
              lesson.type === 'video'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                : lesson.type === 'quiz'
                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60'
            }`}
          >
            {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
          </span>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {lesson.title || <span className="text-gray-400 italic">Untitled lesson</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          title="Remove lesson"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors shrink-0"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Title + Type + Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
                Lesson Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="e.g. Introduction to Fractions"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={lesson.duration_minutes || ''}
                onChange={(e) => onUpdate({ duration_minutes: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 15"
                min={1}
                className={inputCls}
              />
            </div>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
              Lesson Type
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onUpdate({ type: value as Lesson['type'] })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    lesson.type === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                      : 'border-gray-200 dark:border-[#22272B] text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  {value === 'video' ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Video URL (shown for video type) */}
          {lesson.type === 'video' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={(lesson as any).video_url || ''}
                onChange={(e) => onUpdate({ video_url: e.target.value } as any)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className={inputCls}
              />
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                YouTube, Vimeo, or direct MP4 links are supported.
              </p>
            </div>
          )}

          {/* Content URL (for non-video types with external resources) */}
          {lesson.type !== 'video' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
                Resource URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={lesson.content_url || ''}
                onChange={(e) => onUpdate({ content_url: e.target.value })}
                placeholder="Link to external resource, PDF, or file"
                className={inputCls}
              />
            </div>
          )}

          {/* Rich text content */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-1">
              Lesson Content{' '}
              <span className="text-gray-400 font-normal">
                (rich text — student-facing body)
              </span>
            </label>
            <TipTapEditor
              content={(lesson as any).content || ''}
              onChange={(html) => onUpdate({ content: html } as any)}
              placeholder="Write the lesson body here — explanations, instructions, examples..."
              minHeight="180px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonEditor;
