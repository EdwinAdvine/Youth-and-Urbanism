import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ChevronLeft, ChevronRight, Video, BookOpen, FileText } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarEvent {
  date: number;
  title: string;
  time: string;
  type: 'live' | 'assignment' | 'quiz';
  color: string;
}

const events: CalendarEvent[] = [
  { date: 3, title: 'Math Live Session', time: '10:00 AM', type: 'live', color: 'bg-green-500' },
  { date: 5, title: 'Science Assignment Due', time: '11:59 PM', type: 'assignment', color: 'bg-orange-500' },
  { date: 7, title: 'English Quiz', time: '2:00 PM', type: 'quiz', color: 'bg-purple-500' },
  { date: 10, title: 'Science Live Lab', time: '9:00 AM', type: 'live', color: 'bg-green-500' },
  { date: 12, title: 'Math Quiz', time: '10:00 AM', type: 'quiz', color: 'bg-purple-500' },
  { date: 14, title: 'Essay Due', time: '5:00 PM', type: 'assignment', color: 'bg-orange-500' },
  { date: 17, title: 'Kiswahili Session', time: '11:00 AM', type: 'live', color: 'bg-green-500' },
  { date: 21, title: 'Social Studies Project', time: '11:59 PM', type: 'assignment', color: 'bg-orange-500' },
  { date: 24, title: 'Math Live Review', time: '2:00 PM', type: 'live', color: 'bg-green-500' },
  { date: 28, title: 'Monthly Assessment', time: '9:00 AM', type: 'quiz', color: 'bg-purple-500' },
];

const typeIcons = { live: <Video className="w-3 h-3" />, assignment: <FileText className="w-3 h-3" />, quiz: <BookOpen className="w-3 h-3" /> };

const ClassCalendarPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

  const getEventsForDay = (day: number) => events.filter(e => e.date === day);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Class Calendar</h1>
        <p className="text-gray-600 dark:text-white/70">Your schedule at a glance</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-gray-900 dark:text-white`}><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
        <button onClick={nextMonth} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-gray-900 dark:text-white`}><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Calendar Grid */}
      <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] p-4`}>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-gray-400 dark:text-white/40 text-sm py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="p-2 h-24" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = isCurrentMonth && day === today;
            return (
              <div key={day} className={`p-2 h-24 ${borderRadius} ${isToday ? 'bg-[#FF0000]/10 border border-[#FF0000]/30' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                <span className={`text-sm ${isToday ? 'text-[#FF0000] font-bold' : 'text-gray-500 dark:text-white/60'}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev, ei) => (
                    <div key={ei} className={`flex items-center gap-1 text-[10px] text-gray-700 dark:text-white/80 px-1 py-0.5 ${borderRadius} ${ev.color}/20`}>
                      {typeIcons[ev.type]}<span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && <span className="text-[10px] text-gray-400 dark:text-white/40">+{dayEvents.length - 2} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60"><span className="w-3 h-3 bg-green-500 rounded-full" /> Live Sessions</span>
        <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60"><span className="w-3 h-3 bg-orange-500 rounded-full" /> Assignments</span>
        <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60"><span className="w-3 h-3 bg-purple-500 rounded-full" /> Quizzes</span>
      </div>
    </div>
  );
};

export default ClassCalendarPage;
