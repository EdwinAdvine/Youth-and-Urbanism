import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, RefreshCw, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

const quotes = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
];

const DailyQuotePage: React.FC = () => {
  const { borderRadius, ageGroup } = useAgeAdaptiveUI();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentIndex(dayOfYear % quotes.length);
  }, []);

  const quote = quotes[currentIndex];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Quote & Inspiration</h1>
        <p className="text-gray-600 dark:text-white/70">A little wisdom to brighten your learning journey</p>
      </div>

      {/* Featured Quote */}
      <div className={`p-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} border border-purple-500/30`}>
        <BookOpen className="w-10 h-10 text-purple-400 mb-4" />
        <blockquote className="text-2xl text-gray-900 dark:text-white italic mb-4 leading-relaxed">
          "{quote.text}"
        </blockquote>
        <p className="text-gray-500 dark:text-white/60 text-lg">— {quote.author}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setLiked(prev => { const n = new Set(prev); n.has(currentIndex) ? n.delete(currentIndex) : n.add(currentIndex); return n; })}
            className={`px-4 py-2 ${borderRadius} flex items-center gap-2 ${liked.has(currentIndex) ? 'bg-red-500/20 text-red-400' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            <Heart className={`w-4 h-4 ${liked.has(currentIndex) ? 'fill-red-400' : ''}`} />
            {liked.has(currentIndex) ? 'Liked' : 'Like'}
          </button>
          <button className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius} flex items-center gap-2`}>
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length)}
          className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-gray-400 dark:text-white/40 text-sm">{currentIndex + 1} of {quotes.length}</span>
        <button
          onClick={() => setCurrentIndex(prev => (prev + 1) % quotes.length)}
          className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quote Archive */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quote Archive</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-left hover:border-purple-500/30 transition-colors ${i === currentIndex ? 'border-purple-500/50 bg-purple-500/10' : ''}`}
            >
              <p className="text-gray-700 dark:text-white/80 text-sm italic mb-2">"{q.text.substring(0, 80)}..."</p>
              <p className="text-gray-400 dark:text-white/40 text-xs">— {q.author}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Micro-lesson */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {ageGroup === 'young' ? '🧠 Fun Fact!' : "Today's Micro-Lesson"}
        </h3>
        <p className="text-gray-600 dark:text-white/70">
          Did you know? The human brain can process images in as little as 13 milliseconds —
          that's faster than the blink of an eye! This is why visual learning can be so effective.
        </p>
        <button className={`mt-3 px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
          <RefreshCw className="w-4 h-4" /> New Fact
        </button>
      </div>
    </div>
  );
};

export default DailyQuotePage;
