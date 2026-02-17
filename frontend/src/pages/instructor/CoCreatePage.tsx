import React, { useCallback, useState } from 'react';
import { Users, FileText, Save, Download, Clock, Wifi, WifiOff } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useYjsCollaboration } from '../../hooks/useYjsCollaboration';

export const CoCreatePage: React.FC = () => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [docId] = useState(() => `cocreate-${Date.now()}`);

  const {
    isConnected,
    collaborators,
    content,
    connect,
    disconnect,
    sendUpdate,
    sendCursorUpdate,
  } = useYjsCollaboration({
    docId,
    userName: 'Instructor',
    userColor: '#8B5CF6',
  });

  const [localContent, setLocalContent] = useState('');

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      if (isConnected) {
        sendUpdate(newContent);
      }
    },
    [isConnected, sendUpdate]
  );

  const handleCursorChange = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      if (isConnected) {
        sendCursorUpdate(target.selectionStart, target.selectionEnd - target.selectionStart);
      }
    },
    [isConnected, sendCursorUpdate]
  );

  // Use remote content if connected, otherwise local
  const displayContent = isConnected && content ? content : localContent;

  const collaboratorColors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Co-Create Workspace"
        description="Real-time collaborative document editing with fellow instructors"
        icon={<FileText className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connect}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-colors"
              >
                <Wifi className="w-4 h-4" />
                Connect
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                <WifiOff className="w-4 h-4" />
                Disconnect
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />

      {/* Document Header */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-2xl font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none"
            placeholder="Document title..."
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                  <span className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40">Offline</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-white/60" />
              <span className="text-sm text-gray-500 dark:text-white/60">Auto-saving</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-white/60" />
              <span className="text-sm text-gray-500 dark:text-white/60">{collaborators.length + 1} editing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Collaborators */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-white/60">Active collaborators:</span>
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-gray-900">
              <span className="text-xs font-medium text-gray-900 dark:text-white">You</span>
            </div>
            {collaborators.map((collab, i) => (
              <div
                key={collab.userId}
                className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-gray-900"
                style={{ backgroundColor: collab.color || collaboratorColors[i % collaboratorColors.length] }}
                title={collab.name}
              >
                <span className="text-xs font-medium text-gray-900 dark:text-white">{collab.name.charAt(0)}</span>
              </div>
            ))}
          </div>
          {collaborators.length === 0 && !isConnected && (
            <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">Connect to see active collaborators</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 min-h-[500px]">
        <textarea
          value={displayContent}
          onChange={handleContentChange}
          onSelect={handleCursorChange}
          onClick={handleCursorChange}
          placeholder="Start typing here... Connect to collaborate in real-time with other instructors using Yjs CRDT."
          className="w-full h-full min-h-[450px] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none resize-none font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">About Co-Create</h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Click "Connect" to join the real-time editing session via Yjs CRDT</li>
          <li>See collaborators' cursors and edits in real-time</li>
          <li>Work together on lesson plans, assessments, and course materials</li>
          <li>All changes are automatically saved and synced every 5 seconds</li>
          <li>Export to PDF, DOCX, or Markdown when done</li>
        </ul>
      </div>
    </div>
  );
};
