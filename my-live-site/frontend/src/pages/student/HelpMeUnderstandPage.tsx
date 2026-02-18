import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { explainConcept } from '../../services/student/studentAIService';
import { HelpCircle, Send, Lightbulb, BookOpen, Image, Volume2, AlertCircle, Loader2 } from 'lucide-react';

const quickTopics = [
  { label: 'Fractions', subject: 'Math' },
  { label: 'Water Cycle', subject: 'Science' },
  { label: 'Parts of Speech', subject: 'English' },
  { label: 'Kenya Geography', subject: 'Social Studies' },
  { label: 'Photosynthesis', subject: 'Science' },
  { label: 'Multiplication', subject: 'Math' },
];

const HelpMeUnderstandPage: React.FC = () => {
  const { borderRadius, ageGroup } = useAgeAdaptiveUI();
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explainLevel, setExplainLevel] = useState<'simple' | 'detailed' | 'visual'>('simple');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async (topicText?: string) => {
    const t = topicText || topic;
    if (!t.trim()) return;

    setLoading(true);
    setError(null);
    setExplanation('');

    try {
      const response = await explainConcept({
        concept: t,
        context: `Explain at a ${explainLevel} level${explainLevel === 'visual' ? ' using visual descriptions and analogies' : ''}`,
      });
      setExplanation(response.explanation);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to get an explanation. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Me Understand</h1>
        <p className="text-gray-600 dark:text-white/70">{ageGroup === 'young' ? "Tell me what's confusing and I'll explain it simply!" : "Get clear explanations for any topic"}</p>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <label className="text-gray-900 dark:text-white font-medium mb-3 block">What would you like me to explain?</label>
        <div className="flex gap-2">
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleExplain()} placeholder="e.g., How do fractions work?" className={`flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
          <button onClick={() => handleExplain()} disabled={loading || !topic.trim()} className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2 disabled:opacity-50`}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</> : <><Send className="w-4 h-4" /> Explain</>}
          </button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {([
            { key: 'simple' as const, label: 'Simple', icon: <Lightbulb className="w-4 h-4" /> },
            { key: 'detailed' as const, label: 'Detailed', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'visual' as const, label: 'Visual', icon: <Image className="w-4 h-4" /> },
          ]).map((level) => (
            <button key={level.key} onClick={() => setExplainLevel(level.key)} className={`px-4 py-2 ${borderRadius} flex items-center gap-2 text-sm ${explainLevel === level.key ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
              {level.icon} {level.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Quick Topics</h3>
        <div className="flex gap-2 flex-wrap">
          {quickTopics.map((qt, i) => (
            <button key={i} onClick={() => { setTopic(qt.label); handleExplain(qt.label); }} disabled={loading} className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius} text-sm border border-gray-200 dark:border-white/10 disabled:opacity-50`}>
              {qt.label} <span className="text-gray-400 dark:text-white/30 ml-1">({qt.subject})</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={`p-4 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Dismiss</button>
        </div>
      )}

      {loading && !explanation && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-3`}>
          <Loader2 className="w-6 h-6 animate-spin text-[#FF0000]" />
          <span className="text-gray-500 dark:text-white/60">Generating explanation...</span>
        </div>
      )}

      {explanation && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-400" /><h3 className="text-gray-900 dark:text-white font-medium">Explanation</h3></div>
            <button className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius} text-sm flex items-center gap-1`}><Volume2 className="w-4 h-4" /> Read Aloud</button>
          </div>
          <div className="text-gray-700 dark:text-white/80 whitespace-pre-line leading-relaxed">{explanation}</div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <button className={`px-4 py-2 bg-green-500/20 text-green-400 ${borderRadius} text-sm`}>I understand now!</button>
            <button onClick={() => handleExplain()} disabled={loading} className={`px-4 py-2 bg-orange-500/20 text-orange-400 ${borderRadius} text-sm disabled:opacity-50`}>Explain differently</button>
            <button className={`px-4 py-2 bg-purple-500/20 text-purple-400 ${borderRadius} text-sm`}>Give me an example</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpMeUnderstandPage;
