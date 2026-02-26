import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, ChevronRight, ChevronDown, Search, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';

interface Subtopic {
  id: string;
  name: string;
  lessons: number;
  course_id?: string;
}

interface Topic {
  id: string;
  name: string;
  subject: string;
  color: string;
  subtopics: Subtopic[];
}

const TopicExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/learning/browse/topics');
        setTopics(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load topics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Topic Explorer</h1>
        <p className="text-gray-600 dark:text-white/70">Browse CBC-aligned topics by subject</p>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

      {topics.length === 0 && !error && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <BookOpen className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-3">No topics found. Enroll in courses to explore topics.</p>
          <button
            onClick={() => navigate('/dashboard/student/courses/browse')}
            className={`px-5 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} text-sm`}
          >
            Browse Courses
          </button>
        </div>
      )}

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
                <p className="text-gray-400 dark:text-white/40 text-sm">{topic.subject} · {topic.subtopics.length} topic{topic.subtopics.length !== 1 ? 's' : ''}</p>
              </div>
              {expanded.has(topic.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-white/40" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/40" />
              )}
            </button>
            {expanded.has(topic.id) && (
              <div className="border-t border-gray-100 dark:border-white/5 px-4 pb-3">
                {topic.subtopics.length === 0 ? (
                  <p className="text-gray-400 dark:text-white/30 text-sm py-3 text-center">No topics listed for this subject yet.</p>
                ) : (
                  topic.subtopics.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => sub.course_id
                        ? navigate(`/dashboard/student/courses/${sub.course_id}`)
                        : undefined
                      }
                      className={`w-full p-3 mt-2 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
                    >
                      <span className="text-gray-700 dark:text-white/80 text-sm">{sub.name}</span>
                      <span className="text-gray-400 dark:text-white/40 text-xs">{sub.lessons} lesson{sub.lessons !== 1 ? 's' : ''}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && topics.length > 0 && (
          <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
            No topics match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicExplorerPage;
