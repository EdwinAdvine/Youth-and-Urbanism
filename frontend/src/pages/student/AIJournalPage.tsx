// AIJournalPage - Student page at /dashboard/student/ai-journal. Personal AI-powered learning
// journal where students record reflections and receive AI-generated insights on their entries.
import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { getJournalEntries, createJournalEntry } from '../../services/student/studentAIService';
import { BookHeart, Plus, Calendar, Sparkles, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import type { MoodType } from '../../types/student';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  moodTag: string;
  aiInsight?: string;
}

const moodTags = [
  { label: 'Happy', emoji: '😊', value: 'happy' as MoodType, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Focused', emoji: '🎯', value: 'okay' as MoodType, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Tired', emoji: '😴', value: 'tired' as MoodType, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'Excited', emoji: '🚀', value: 'excited' as MoodType, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Confused', emoji: '🤔', value: 'frustrated' as MoodType, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const sampleEntries: JournalEntry[] = [
  { id: '1', date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "Today I learned about fractions and they're starting to make more sense. I practiced converting between mixed numbers and improper fractions.", moodTag: 'Happy', aiInsight: "Great progress on fractions! You've improved 15% this week." },
  { id: '2', date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "Science experiment on the water cycle was really fun! I drew a diagram showing evaporation, condensation, and precipitation.", moodTag: 'Excited', aiInsight: "Your diagram skills are excellent! Visual learning helps you remember concepts 40% better." },
  { id: '3', date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "English essay was challenging today. I struggled with paragraph transitions but my teacher gave me some good tips.", moodTag: 'Tired', aiInsight: "Try using linking words like 'however', 'moreover'. I have practice exercises for you." },
];

const moodLabelMap: Record<string, string> = {
  happy: 'Happy',
  okay: 'Focused',
  tired: 'Tired',
  excited: 'Excited',
  frustrated: 'Confused',
};

const AIJournalPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch journal entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const response = await getJournalEntries(20);
      const apiEntries: JournalEntry[] = (Array.isArray(response) ? response : []).map((e: any) => ({
        id: e.id || String(Date.now()),
        date: e.created_at
          ? new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
          : 'Unknown date',
        content: e.content || '',
        moodTag: moodLabelMap[e.mood_tag] || e.mood_tag || 'Happy',
        aiInsight: e.ai_insights?.summary || e.ai_insights?.insight || (typeof e.ai_insights === 'string' ? e.ai_insights : undefined),
      }));
      setEntries(apiEntries.length > 0 ? apiEntries : sampleEntries);
    } catch (err: any) {
      setEntriesError(err?.response?.data?.detail || err?.message || 'Failed to load journal entries.');
      // Keep sample entries visible as fallback
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

      // Add new entry to the top of the list
      const newEntry: JournalEntry = {
        id: response.id || String(Date.now()),
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        content: response.content || newContent,
        moodTag: selectedMood || 'Happy',
        aiInsight: response.ai_insights?.summary || response.ai_insights?.insight || (typeof response.ai_insights === 'string' ? response.ai_insights : undefined),
      };
      setEntries(prev => [newEntry, ...prev]);

      setNewContent('');
      setSelectedMood('');
      setShowNewEntry(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to save journal entry. Please try again.';
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Learning Journal</h1>
          <p className="text-gray-600 dark:text-white/70">Reflect on your learning journey with AI insights</p>
        </div>
        <button onClick={() => setShowNewEntry(!showNewEntry)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {showNewEntry && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-[#FF0000]/30`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What did you learn today?</h3>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write about what you learned, what was challenging, what was fun..." className={`w-full h-32 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`} />
          <div className="mt-4">
            <p className="text-gray-500 dark:text-white/60 text-sm mb-2">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap">
              {moodTags.map((mood) => (
                <button key={mood.label} onClick={() => setSelectedMood(mood.label)} className={`px-3 py-1.5 ${borderRadius} border text-sm flex items-center gap-1.5 transition-colors ${selectedMood === mood.label ? mood.color : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
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

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveEntry}
              disabled={saving || !newContent.trim()}
              className={`px-6 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2 disabled:opacity-50`}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Entry'}
            </button>
            <button onClick={() => { setShowNewEntry(false); setSaveError(null); }} className={`px-6 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius}`}>Cancel</button>
          </div>
        </div>
      )}

      {entriesLoading && (
        <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-2 text-gray-500 dark:text-white/60`}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading journal entries...</span>
        </div>
      )}

      {entriesError && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{entriesError}</span>
          <button onClick={fetchEntries} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Retry</button>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => {
          const mood = moodTags.find(m => m.label === entry.moodTag);
          return (
            <div key={entry.id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="text-gray-500 dark:text-white/60 text-sm">{entry.date}</span>
                </div>
                {mood && <span className={`px-2 py-1 ${borderRadius} border text-xs flex items-center gap-1 ${mood.color}`}>{mood.emoji} {mood.label}</span>}
              </div>
              <p className="text-gray-700 dark:text-white/80 mb-4">{entry.content}</p>
              {entry.aiInsight && (
                <div className={`p-3 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-purple-300 text-sm font-medium">AI Insight</p>
                      <p className="text-gray-500 dark:text-white/60 text-sm mt-1">{entry.aiInsight}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-pink-400" /> Reflection Prompts
        </h3>
        <div className="space-y-2">
          {['What was the most interesting thing you learned today?', 'What topic would you like to explore more?', 'How did you overcome a challenge today?'].map((prompt, i) => (
            <button key={i} onClick={() => { setNewContent(prompt + '\n\n'); setShowNewEntry(true); }} className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-left text-gray-500 dark:text-white/60 text-sm flex items-center justify-between`}>
              {prompt} <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIJournalPage;
