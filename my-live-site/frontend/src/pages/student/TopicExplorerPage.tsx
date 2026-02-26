import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, ChevronRight, ChevronDown, Search } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  subject: string;
  color: string;
  subtopics: { id: string; name: string; lessons: number }[];
}

const topics: Topic[] = [
  {
    id: '1', name: 'Numbers & Operations', subject: 'Mathematics', color: 'from-blue-500 to-cyan-500',
    subtopics: [
      { id: '1a', name: 'Fractions', lessons: 8 },
      { id: '1b', name: 'Decimals', lessons: 6 },
      { id: '1c', name: 'Percentages', lessons: 5 },
    ],
  },
  {
    id: '2', name: 'Living Things', subject: 'Science', color: 'from-green-500 to-emerald-500',
    subtopics: [
      { id: '2a', name: 'Plants', lessons: 7 },
      { id: '2b', name: 'Animals', lessons: 9 },
      { id: '2c', name: 'Human Body', lessons: 10 },
    ],
  },
  {
    id: '3', name: 'Grammar & Writing', subject: 'English', color: 'from-purple-500 to-pink-500',
    subtopics: [
      { id: '3a', name: 'Parts of Speech', lessons: 6 },
      { id: '3b', name: 'Sentence Structure', lessons: 5 },
      { id: '3c', name: 'Creative Writing', lessons: 8 },
    ],
  },
  {
    id: '4', name: 'Kenya & Africa', subject: 'Social Studies', color: 'from-orange-500 to-red-500',
    subtopics: [
      { id: '4a', name: 'Kenya History', lessons: 10 },
      { id: '4b', name: 'Geography', lessons: 7 },
      { id: '4c', name: 'Government', lessons: 4 },
    ],
  },
  {
    id: '5', name: 'Fasihi na Lugha', subject: 'Kiswahili', color: 'from-teal-500 to-cyan-500',
    subtopics: [
      { id: '5a', name: 'Sarufi', lessons: 6 },
      { id: '5b', name: 'Insha', lessons: 5 },
      { id: '5c', name: 'Ushairi', lessons: 4 },
    ],
  },
];

const TopicExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.subtopics.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Topic Explorer</h1>
        <p className="text-gray-600 dark:text-white/70">Browse CBC-aligned topics by subject</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((topic) => (
          <div key={topic.id} className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-hidden`}>
            <button
              onClick={() => toggle(topic.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${topic.color} ${borderRadius} flex items-center justify-center flex-shrink-0`}>
                <BookOpen className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-900 dark:text-white font-semibold">{topic.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{topic.subject} · {topic.subtopics.length} subtopics</p>
              </div>
              {expanded.has(topic.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-white/40" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/40" />
              )}
            </button>
            {expanded.has(topic.id) && (
              <div className="border-t border-gray-100 dark:border-white/5 px-4 pb-3">
                {topic.subtopics.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => navigate(`/dashboard/student/browse/course/${sub.id}`)}
                    className={`w-full p-3 mt-2 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
                  >
                    <span className="text-gray-700 dark:text-white/80 text-sm">{sub.name}</span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">{sub.lessons} lessons</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicExplorerPage;
