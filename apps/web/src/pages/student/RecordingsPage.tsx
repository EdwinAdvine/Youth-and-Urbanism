import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { PlayCircle, Calendar, Search, Download } from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  duration: string;
  date: string;
  views: number;
  thumbnail: string;
}

const recordings: Recording[] = [
  { id: '1', title: 'Mathematics: Fractions Deep Dive', instructor: 'Ms. Wanjiku', subject: 'Math', duration: '45:22', date: '2 days ago', views: 34, thumbnail: '' },
  { id: '2', title: 'Science: Water Cycle Experiment', instructor: 'Mr. Ochieng', subject: 'Science', duration: '58:10', date: '4 days ago', views: 28, thumbnail: '' },
  { id: '3', title: 'English: Grammar Workshop', instructor: 'Mrs. Kamau', subject: 'English', duration: '40:15', date: '1 week ago', views: 45, thumbnail: '' },
  { id: '4', title: 'Kiswahili: Sarufi Basics', instructor: 'Mwl. Otieno', subject: 'Kiswahili', duration: '35:30', date: '1 week ago', views: 22, thumbnail: '' },
  { id: '5', title: 'Social Studies: Kenya Geography', instructor: 'Ms. Njeri', subject: 'Social Studies', duration: '50:45', date: '2 weeks ago', views: 38, thumbnail: '' },
];

const RecordingsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');

  const filtered = recordings.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Session Recordings</h1>
        <p className="text-gray-600 dark:text-white/70">Watch past live sessions at your own pace</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recordings..." className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec) => (
          <div key={rec.id} className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors overflow-hidden`}>
            {/* Thumbnail placeholder */}
            <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 h-40 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-gray-500 dark:text-white/60" />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-gray-900 dark:text-white text-xs rounded">{rec.duration}</span>
            </div>
            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white font-semibold">{rec.title}</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{rec.instructor} · {rec.subject}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {rec.date}</span>
                  <span>{rec.views} views</span>
                </div>
                <div className="flex gap-2">
                  <button className={`px-3 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}>
                    <PlayCircle className="w-3 h-3" /> Watch
                  </button>
                  <button className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 text-sm ${borderRadius}`}>
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingsPage;
