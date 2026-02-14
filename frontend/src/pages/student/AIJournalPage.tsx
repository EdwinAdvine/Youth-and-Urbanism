import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookHeart, Plus, Calendar, Sparkles, ChevronRight } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  moodTag: string;
  aiInsight?: string;
}

const moodTags = [
  { label: 'Happy', emoji: '😊', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Focused', emoji: '🎯', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Tired', emoji: '😴', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'Excited', emoji: '🚀', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Confused', emoji: '🤔', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

const sampleEntries: JournalEntry[] = [
  { id: '1', date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "Today I learned about fractions and they're starting to make more sense. I practiced converting between mixed numbers and improper fractions.", moodTag: 'Focused', aiInsight: "Great progress on fractions! You've improved 15% this week." },
  { id: '2', date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "Science experiment on the water cycle was really fun! I drew a diagram showing evaporation, condensation, and precipitation.", moodTag: 'Excited', aiInsight: "Your diagram skills are excellent! Visual learning helps you remember concepts 40% better." },
  { id: '3', date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), content: "English essay was challenging today. I struggled with paragraph transitions but my teacher gave me some good tips.", moodTag: 'Tired', aiInsight: "Try using linking words like 'however', 'moreover'. I have practice exercises for you." },
];

const AIJournalPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

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
          <div className="flex gap-2 mt-4">
            <button className={`px-6 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}>Save Entry</button>
            <button onClick={() => setShowNewEntry(false)} className={`px-6 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius}`}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sampleEntries.map((entry) => {
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
