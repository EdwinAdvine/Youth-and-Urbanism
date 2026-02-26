// AIJournalPage - Student page at /dashboard/student/ai-journal. Personal AI-powered learning
// journal where students record reflections and receive AI-generated insights on their entries.
// Layout: side-by-side top (2/3 new entry + 1/3 prompts), entry history below.
import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
} from '../../services/student/studentAIService';
import {
  BookHeart, Calendar, Sparkles, ChevronRight,
  AlertCircle, Loader2, Pen, X,
} from 'lucide-react';
import type { MoodType } from '../../types/student';

interface JournalEntry {
  id: string;
  date: string;
  rawDate: string;
  content: string;
  moodTag: string;
  moodValue: MoodType | '';
  aiInsight?: string;
}

const moodTags = [
  { label: 'Happy', emoji: '😊', value: 'happy' as MoodType, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Focused', emoji: '🎯', value: 'okay' as MoodType, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Tired', emoji: '😴', value: 'tired' as MoodType, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'Excited', emoji: '🚀', value: 'excited' as MoodType, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Confused', emoji: '🤔', value: 'frustrated' as MoodType, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const moodLabelMap: Record<string, string> = {
  happy: 'Happy',
  okay: 'Focused',
  tired: 'Tired',
  excited: 'Excited',
  frustrated: 'Confused',
};

const reflectionPrompts = [
  'What was the most interesting thing you learned today?',
  'What topic would you like to explore more?',
  'How did you overcome a challenge today?',
  'What are you proud of from today\'s learning?',
  'What would you do differently next time?',
];

const AIJournalPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  // New entry state
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Entries list state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const parseEntry = (e: any): JournalEntry => ({
    id: e.id || String(Date.now()),
    rawDate: e.created_at || '',
    date: e.created_at
      ? new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      : 'Unknown date',
    content: e.content || '',
    moodTag: moodLabelMap[e.mood_tag] || e.mood_tag || '',
    moodValue: (e.mood_tag as MoodType) || '',
    aiInsight:
      e.ai_insights?.summary ||
      e.ai_insights?.insight ||
      (typeof e.ai_insights === 'string' ? e.ai_insights : undefined),
  });

  const fetchEntries = async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const response = await getJournalEntries(20);
      const apiEntries = (Array.isArray(response) ? response : []).map(parseEntry);
      setEntries(apiEntries);
    } catch (err: any) {
      setEntriesError(err?.response?.data?.detail || err?.message || 'Failed to load journal entries.');
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const moodTag = moodTags.find(m => m.label === selectedMood);
      const response = await createJournalEntry({
        content: newContent,
        mood_tag: moodTag?.value || undefined,
      });
      const newEntry: JournalEntry = {
        id: response.id || String(Date.now()),
        rawDate: response.created_at ? String(response.created_at) : new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        content: response.content || newContent,
        moodTag: selectedMood || '',
        moodValue: moodTag?.value || '',
        aiInsight:
          (response.ai_insights as any)?.summary ||
          (response.ai_insights as any)?.insight ||
          (typeof response.ai_insights === 'string' ? response.ai_insights : undefined),
      };
      setEntries(prev => [newEntry, ...prev]);
      setNewContent('');
      setSelectedMood('');
      // Mark journal as written today for logout reminder
      localStorage.setItem('journal_written_today', new Date().toDateString());
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail || err?.message || 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditContent(entry.content);
    setEditMood(entry.moodTag);
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingEntry(null);
    setEditContent('');
    setEditMood('');
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !editContent.trim()) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const moodTag = moodTags.find(m => m.label === editMood);
      await updateJournalEntry(editingEntry.id, {
        content: editContent,
        mood_tag: moodTag?.value || undefined,
      });
      setEntries(prev =>
        prev.map(e =>
          e.id === editingEntry.id
            ? { ...e, content: editContent, moodTag: editMood, moodValue: moodTag?.value || '' }
            : e
        )
      );
      closeEditModal();
    } catch (err: any) {
      setEditError(err?.response?.data?.detail || err?.message || 'Failed to update entry. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setNewContent(prompt + '\n\n');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">AI Learning Journal</h1>
        <p className="text-gray-600 dark:text-white/70">Reflect on your learning journey and get AI insights</p>
      </div>

      {/* Top section — side-by-side grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: New Entry (2/3 width) */}
        <div className={`lg:col-span-2 p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What did you learn today?</h3>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write about what you learned, what was challenging, what was fun..."
            rows={6}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
          />

          <div className="mt-4">
            <p className="text-gray-500 dark:text-white/60 text-sm mb-2">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap">
              {moodTags.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(selectedMood === mood.label ? '' : mood.label)}
                  className={`px-3 py-1.5 ${borderRadius} border text-sm flex items-center gap-1.5 transition-colors ${
                    selectedMood === mood.label
                      ? mood.color
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/40 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{mood.emoji}</span> {mood.label}
                </button>
              ))}
            </div>
          </div>

          {saveError && (
            <div className={`mt-4 p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={handleSaveEntry}
              disabled={saving || !newContent.trim()}
              className={`px-6 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                'Save My Reflection'
              )}
            </button>
          </div>
        </div>

        {/* Right: Reflection Prompts (1/3 width) */}
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookHeart className="w-5 h-5 text-pink-400" /> Reflection Prompts
          </h3>
          <div className="space-y-2">
            {reflectionPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-left text-gray-600 dark:text-white/60 text-sm flex items-center justify-between gap-2 transition-colors`}
              >
                <span>{prompt}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries loading / error */}
      {entriesLoading && (
        <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-2 text-gray-500 dark:text-white/60`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading journal entries…</span>
        </div>
      )}

      {entriesError && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{entriesError}</span>
          <button onClick={fetchEntries} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Retry</button>
        </div>
      )}

      {/* Entry history */}
      {!entriesLoading && entries.length === 0 && !entriesError && (
        <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          <BookHeart className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-white/20" />
          <p>No journal entries yet. Write your first reflection above!</p>
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Entries</h2>
          <div className="space-y-4">
            {entries.map((entry) => {
              const mood = moodTags.find(m => m.label === entry.moodTag);
              return (
                <div
                  key={entry.id}
                  className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
                      <span className="text-gray-500 dark:text-white/60 text-sm">{entry.date}</span>
                      {mood && (
                        <span className={`px-2 py-1 ${borderRadius} border text-xs flex items-center gap-1 ${mood.color}`}>
                          {mood.emoji} {mood.label}
                        </span>
                      )}
                    </div>
                    {/* Edit (Pen) icon */}
                    <button
                      onClick={() => openEditModal(entry)}
                      title="Edit entry"
                      className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <Pen className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-gray-700 dark:text-white/80 mb-4 whitespace-pre-line">{entry.content}</p>

                  {entry.aiInsight && (
                    <div className={`p-3 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-purple-400 text-sm font-medium">AI Insight</p>
                          <p className="text-gray-600 dark:text-white/60 text-sm mt-1">{entry.aiInsight}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Reflection</h3>
              <button
                onClick={closeEditModal}
                className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-white/40 mb-3">{editingEntry.date}</p>

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
            />

            <div className="mt-4">
              <p className="text-gray-500 dark:text-white/60 text-sm mb-2">How were you feeling?</p>
              <div className="flex gap-2 flex-wrap">
                {moodTags.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => setEditMood(editMood === mood.label ? '' : mood.label)}
                    className={`px-3 py-1.5 ${borderRadius} border text-sm flex items-center gap-1.5 transition-colors ${
                      editMood === mood.label
                        ? mood.color
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/40 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{mood.emoji}</span> {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {editError && (
              <div className={`mt-4 p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || !editContent.trim()}
                className={`px-6 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {editSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  'Save My Reflection'
                )}
              </button>
              <button
                onClick={closeEditModal}
                className={`px-6 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white ${borderRadius} transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIJournalPage;
