import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Calendar, Clock, Users, Bell, Video, BookOpen, CheckCircle } from 'lucide-react';

const sessions = [
  { id: '1', title: 'Mathematics: Algebra Introduction', instructor: 'Ms. Wanjiku', date: 'Today', time: '2:00 PM', duration: '45 min', participants: 28, subject: 'Math', hasPrep: true },
  { id: '2', title: 'Science: Chemical Reactions', instructor: 'Mr. Ochieng', date: 'Tomorrow', time: '10:00 AM', duration: '60 min', participants: 22, subject: 'Science', hasPrep: true },
  { id: '3', title: 'English: Book Discussion', instructor: 'Mrs. Kamau', date: 'Wed, Feb 19', time: '11:30 AM', duration: '45 min', participants: 30, subject: 'English', hasPrep: false },
  { id: '4', title: 'Kiswahili: Insha Practice', instructor: 'Mwl. Otieno', date: 'Thu, Feb 20', time: '9:00 AM', duration: '40 min', participants: 18, subject: 'Kiswahili', hasPrep: false },
];

const UpcomingSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upcoming Sessions</h1>
          <p className="text-gray-600 dark:text-white/70">{sessions.length} sessions scheduled</p>
        </div>
        <button onClick={() => navigate('/dashboard/student/live/calendar')} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Calendar className="w-4 h-4" /> Calendar View
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs ${borderRadius} ${session.date === 'Today' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : session.date === 'Tomorrow' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/10'}`}>
                {session.date}
              </span>
              <span className="text-gray-400 dark:text-white/40 text-sm">{session.time}</span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold">{session.title}</h3>
            <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{session.instructor}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.participants} expected</span>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {session.date === 'Today' && (
                <button onClick={() => navigate('/dashboard/student/live/join')} className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                  <Video className="w-4 h-4" /> Join Now
                </button>
              )}
              <button
                onClick={() => setReminders(prev => ({ ...prev, [session.id]: true }))}
                className={`px-4 py-2 ${reminders[session.id] ? 'bg-green-500/20 text-green-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60'} text-sm ${borderRadius} flex items-center gap-2`}
              >
                {reminders[session.id] ? <><CheckCircle className="w-4 h-4" /> Reminded</> : <><Bell className="w-4 h-4" /> Remind Me</>}
              </button>
              {session.hasPrep && (
                <button onClick={() => navigate(`/dashboard/student/live/upcoming`)} className={`px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm ${borderRadius} flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4" /> Prep Tips
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingSessionsPage;
