import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Heart, MessageSquare, Eye, Star } from 'lucide-react';

const projects = [
  { id: '1', title: 'Solar System Diorama', student: 'Kevin M.', subject: 'Science', likes: 24, comments: 8, grade: 'Grade 7', featured: true },
  { id: '2', title: 'Kenya Wildlife Poster', student: 'Amina K.', subject: 'Art & Science', likes: 18, comments: 5, grade: 'Grade 7', featured: false },
  { id: '3', title: 'Water Filtration System', student: 'James O.', subject: 'Science', likes: 31, comments: 12, grade: 'Grade 8', featured: true },
  { id: '4', title: 'Poetry Booklet', student: 'Grace W.', subject: 'English', likes: 15, comments: 3, grade: 'Grade 7', featured: false },
  { id: '5', title: 'Math Board Game', student: 'David N.', subject: 'Mathematics', likes: 22, comments: 7, grade: 'Grade 6', featured: false },
  { id: '6', title: 'Community Map', student: 'Faith A.', subject: 'Social Studies', likes: 19, comments: 6, grade: 'Grade 7', featured: true },
];

const PeerGalleryPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');

  const toggleLike = (id: string) => {
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filtered = filter === 'featured' ? projects.filter(p => p.featured) : projects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Peer Gallery</h1>
          <p className="text-gray-600 dark:text-white/70">Amazing projects from your classmates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-2 ${borderRadius} text-sm ${filter === 'all' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}>All</button>
          <button onClick={() => setFilter('featured')} className={`px-3 py-2 ${borderRadius} text-sm flex items-center gap-1 ${filter === 'featured' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}>
            <Star className="w-3 h-3" /> Featured
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <div key={project.id} className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors overflow-hidden`}>
            {/* Thumbnail */}
            <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 h-40 flex items-center justify-center">
              {project.featured && <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400" /> Featured</span>}
              <Eye className="w-8 h-8 text-gray-400 dark:text-gray-300 dark:text-white/20" />
            </div>
            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white font-semibold">{project.title}</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{project.student} · {project.subject}</p>
              <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{project.grade}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-3">
                  <button onClick={() => toggleLike(project.id)} className={`flex items-center gap-1 text-sm ${liked.has(project.id) ? 'text-red-400' : 'text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'}`}>
                    <Heart className={`w-4 h-4 ${liked.has(project.id) ? 'fill-red-400' : ''}`} />
                    {project.likes + (liked.has(project.id) ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1 text-sm text-gray-400 dark:text-white/40"><MessageSquare className="w-4 h-4" /> {project.comments}</span>
                </div>
                <button className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius}`}>View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeerGalleryPage;
