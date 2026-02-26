/**
 * HelpMeUnderstandPage — /dashboard/student/ai-tutor/explain
 *
 * Full AI-powered concept explanation page.
 * - Student types any concept or question
 * - Optional "use current screen as context" toggle
 * - AI provides a grade-appropriate explanation with markdown rendering
 * - Follow-up chat using the student's AI tutor
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HelpCircle, Send, Lightbulb, Loader2, AlertCircle, Monitor, Bot, Sparkles, RotateCcw } from 'lucide-react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useScreenContext } from '../../hooks/useScreenContext';
import { explainConcept, chatWithAIExtended } from '../../services/student/studentAIService';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// ──────────────────────────────────────────────
// Safe markdown renderer
// ──────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="bg-black/20 rounded-lg p-3 my-2 text-sm overflow-x-auto whitespace-pre-wrap font-mono"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/20 px-1 rounded font-mono text-sm">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-2">${m}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ──────────────────────────────────────────────
// Quick topic chips
// ──────────────────────────────────────────────
const quickTopics = [
  { label: 'Fractions', subject: 'Math' },
  { label: 'Water Cycle', subject: 'Science' },
  { label: 'Parts of Speech', subject: 'English' },
  { label: 'Kenya Geography', subject: 'Social Studies' },
  { label: 'Photosynthesis', subject: 'Science' },
  { label: 'Multiplication', subject: 'Math' },
];

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
const HelpMeUnderstandPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const getScreenContext = useScreenContext();

  const [concept, setConcept] = useState('');
  const [useScreenCtx, setUseScreenCtx] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [conceptAsked, setConceptAsked] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Follow-up conversation
  const [followUps, setFollowUps] = useState<FollowUpMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const followUpEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    followUpEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [followUps, followUpLoading]);

  // ── Get explanation ──
  const handleExplain = useCallback(async (topicText?: string) => {
    const text = (topicText ?? concept).trim();
    if (!text) return;

    setLoading(true);
    setError(null);
    setExplanation(null);
    setFollowUps([]);
    setConceptAsked(text);

    try {
      const ctx = useScreenCtx ? getScreenContext() : undefined;
      const data = await explainConcept({ concept: text, context: ctx });
      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [concept, useScreenCtx, getScreenContext]);

  // ── Follow-up question ──
  const handleFollowUp = useCallback(async () => {
    const text = followUpInput.trim();
    if (!text || followUpLoading) return;

    setFollowUpInput('');
    const userMsg: FollowUpMessage = { id: Date.now().toString(), role: 'user', content: text };
    setFollowUps((prev) => [...prev, userMsg]);
    setFollowUpLoading(true);

    try {
      // Build context from the initial explanation + previous follow-ups
      const conversationHistory: Array<{ role: string; content: string }> = [];
      if (explanation) {
        conversationHistory.push({ role: 'assistant', content: explanation });
      }
      for (const m of followUps) {
        conversationHistory.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
      }

      const response = await chatWithAIExtended({
        message: text,
        conversation_history: conversationHistory,
      });

      const aiMsg: FollowUpMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
      };
      setFollowUps((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setFollowUps((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I had trouble answering that. Please try again.',
        },
      ]);
    } finally {
      setFollowUpLoading(false);
    }
  }, [followUpInput, followUpLoading, explanation, followUps]);

  const handleReset = () => {
    setConcept('');
    setExplanation(null);
    setConceptAsked('');
    setFollowUps([]);
    setError(null);
  };

  const followUpSuggestions = [
    'Explain in simpler terms',
    'Give me an example',
    'Show me a practice question',
    'What is related to this topic?',
  ];

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Help Me Understand</h1>
        <p className="text-gray-500 dark:text-white/60 text-sm">Ask your AI tutor to explain any concept, topic, or question</p>
      </div>

      {/* ── Search / input area ── */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
              placeholder="What do you need explained? e.g. 'fractions', 'the water cycle'…"
              disabled={loading}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50`}
            />
          </div>
          <button
            onClick={() => handleExplain()}
            disabled={loading || !concept.trim()}
            className={`px-4 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} disabled:opacity-50 flex items-center gap-2`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Explain
          </button>
        </div>

        {/* Screen context toggle */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setUseScreenCtx((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 ${borderRadius} border text-xs transition-colors ${
              useScreenCtx
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/50'
            }`}
          >
            <Monitor className="w-3 h-3" />
            Include current screen as context
          </button>
          {useScreenCtx && (
            <span className="text-xs text-blue-400/70 italic">
              The AI will use what's visible on your screen
            </span>
          )}
        </div>

        {/* Quick topic chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickTopics.map((qt) => (
            <button
              key={qt.label}
              onClick={() => {
                setConcept(qt.label);
                handleExplain(qt.label);
              }}
              disabled={loading}
              className={`px-3 py-1 text-xs ${borderRadius} bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 transition-colors disabled:opacity-50`}
            >
              {qt.label}
              <span className="ml-1 text-gray-400 dark:text-white/30">· {qt.subject}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs underline">Dismiss</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white text-sm font-medium">Birdy is thinking…</p>
            <div className="flex gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Explanation result ── */}
      {explanation && !loading && (
        <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          {/* Explanation header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-900 dark:text-white text-sm font-semibold">
                Explaining: <em className="font-normal text-gray-500 dark:text-white/70">{conceptAsked}</em>
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              New question
            </button>
          </div>

          {/* Explanation body */}
          <div className="p-5">
            <div
              className="prose-sm max-w-none text-gray-700 dark:text-white/90 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(explanation) }}
            />
          </div>

          {/* Follow-up suggestions */}
          {followUps.length === 0 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {followUpSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFollowUpInput(s);
                    setTimeout(() => {
                      setFollowUpInput('');
                      setFollowUps((prev) => [...prev]);
                      handleFollowUp();
                    }, 0);
                    // Directly call with text
                    setFollowUpInput(s);
                  }}
                  className={`px-3 py-1.5 text-xs ${borderRadius} bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors flex items-center gap-1`}
                >
                  <Sparkles className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Follow-up conversation */}
          {(followUps.length > 0 || followUpLoading) && (
            <div className="border-t border-gray-100 dark:border-white/5">
              <div className="px-5 pt-4 pb-2 space-y-3">
                {followUps.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2 text-sm ${borderRadius} ${
                        msg.role === 'user'
                          ? 'bg-[#FF0000]/90 text-white'
                          : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/90'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <span>{msg.content}</span>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      )}
                    </div>
                  </div>
                ))}
                {followUpLoading && (
                  <div className="flex justify-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className={`px-3 py-2 ${borderRadius} bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex gap-1`}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={followUpEndRef} />
              </div>
            </div>
          )}

          {/* Follow-up input */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                placeholder="Ask a follow-up question…"
                disabled={followUpLoading}
                className={`flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50`}
              />
              <button
                onClick={handleFollowUp}
                disabled={followUpLoading || !followUpInput.trim()}
                className={`px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 ${borderRadius} disabled:opacity-50 transition-colors`}
              >
                {followUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpMeUnderstandPage;
