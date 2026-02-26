import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  date: number;
  title: string;
  color: string;
}

interface SessionCalendarProps {
  events?: CalendarEvent[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SessionCalendar: React.FC<SessionCalendarProps> = ({ events = [] }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-white/60" />
        </button>
        <h3 className="text-gray-900 dark:text-white font-semibold">{monthName}</h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-white/60" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-gray-400 dark:text-white/40 text-xs py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const event = events.find((e) => e.date === day);
          const isToday = isCurrentMonth && day === today;
          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg relative ${
                isToday ? 'bg-[#FF0000] text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {day}
              {event && (
                <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${event.color}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionCalendar;
