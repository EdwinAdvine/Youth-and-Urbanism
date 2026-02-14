import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Save, Clock, Globe, Timer, Users, Coffee, CheckCircle, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface AvailabilitySettings {
  schedule: Record<string, DaySchedule>;
  timezone: string;
  booking_buffer_minutes: number;
  max_sessions_per_day: number;
  break_between_sessions_minutes: number;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TIMEZONES = [
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Casablanca',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const BUFFER_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

const MAX_SESSIONS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const BREAK_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

const defaultAvailability: AvailabilitySettings = {
  schedule: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '13:00' },
    sunday: { enabled: false, start: '09:00', end: '13:00' },
  },
  timezone: 'Africa/Nairobi',
  booking_buffer_minutes: 30,
  max_sessions_per_day: 6,
  break_between_sessions_minutes: 15,
};

export const AvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySettings>(defaultAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/account/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setAvailability({
          schedule: response.data.schedule ?? defaultAvailability.schedule,
          timezone: response.data.timezone ?? 'Africa/Nairobi',
          booking_buffer_minutes: response.data.booking_buffer_minutes ?? 30,
          max_sessions_per_day: response.data.max_sessions_per_day ?? 6,
          break_between_sessions_minutes: response.data.break_between_sessions_minutes ?? 15,
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Retain defaults on error so the form is still usable
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      const token = localStorage.getItem('access_token');

      await axios.put(
        `${API_URL}/api/v1/instructor/account/availability`,
        {
          schedule: availability.schedule,
          timezone: availability.timezone,
          booking_buffer_minutes: availability.booking_buffer_minutes,
          max_sessions_per_day: availability.max_sessions_per_day,
          break_between_sessions_minutes: availability.break_between_sessions_minutes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFeedback({ type: 'success', message: 'Availability settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving availability:', error);
      const message =
        error.response?.data?.detail || 'Failed to save availability settings. Please try again.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (day: string, updates: Partial<DaySchedule>) => {
    setAvailability({
      ...availability,
      schedule: {
        ...availability.schedule,
        [day]: { ...availability.schedule[day], ...updates },
      },
    });
  };

  const totalWeeklyHours = useMemo(() => {
    let totalMinutes = 0;
    for (const day of DAYS) {
      const schedule = availability.schedule[day];
      if (schedule.enabled) {
        const [startH, startM] = schedule.start.split(':').map(Number);
        const [endH, endM] = schedule.end.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        if (endTotal > startTotal) {
          totalMinutes += endTotal - startTotal;
        }
      }
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return { hours, mins, totalMinutes };
  }, [availability.schedule]);

  const enabledDaysCount = useMemo(() => {
    return DAYS.filter((day) => availability.schedule[day].enabled).length;
  }, [availability.schedule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Availability & Scheduling"
        description="Set your availability for live sessions and booking"
        icon={<Calendar className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-200">Weekly Hours</p>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalWeeklyHours.hours}h {totalWeeklyHours.mins > 0 ? `${totalWeeklyHours.mins}m` : ''}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">
            across {enabledDaysCount} day{enabledDaysCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Max Sessions/Day</p>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {availability.max_sessions_per_day}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">sessions limit</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Booking Buffer</p>
            <Timer className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {availability.booking_buffer_minutes}m
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">advance notice</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Break Time</p>
            <Coffee className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {availability.break_between_sessions_minutes}m
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60 mt-1">between sessions</p>
        </div>
      </div>

      {/* Timezone & Booking Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timezone */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timezone</h3>
          </div>
          <select
            value={availability.timezone}
            onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
            All times in your schedule are shown in this timezone
          </p>
        </div>

        {/* Booking Settings */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Booking Buffer Time
            </label>
            <select
              value={availability.booking_buffer_minutes}
              onChange={(e) =>
                setAvailability({ ...availability, booking_buffer_minutes: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              {BUFFER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
              Minimum advance notice required for bookings
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Max Sessions Per Day
            </label>
            <select
              value={availability.max_sessions_per_day}
              onChange={(e) =>
                setAvailability({ ...availability, max_sessions_per_day: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              {MAX_SESSIONS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} session{n !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Break Between Sessions
            </label>
            <select
              value={availability.break_between_sessions_minutes}
              onChange={(e) =>
                setAvailability({
                  ...availability,
                  break_between_sessions_minutes: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              {BREAK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
              Automatic buffer between consecutive sessions
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h3>
        </div>

        {DAYS.map((day) => {
          const schedule = availability.schedule[day];
          return (
            <div
              key={day}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                schedule.enabled ? 'bg-gray-100/50 dark:bg-white/[0.03]' : ''
              }`}
            >
              <div className="w-36">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => updateDay(day, { enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <span
                    className={`text-sm font-medium ${
                      schedule.enabled
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-white/40'
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </span>
                </label>
              </div>

              {schedule.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-white/60" />
                  <input
                    type="time"
                    value={schedule.start}
                    onChange={(e) => updateDay(day, { start: e.target.value })}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  <span className="text-gray-500 dark:text-white/60">to</span>
                  <input
                    type="time"
                    value={schedule.end}
                    onChange={(e) => updateDay(day, { end: e.target.value })}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  {/* Per-day hours */}
                  {(() => {
                    const [sH, sM] = schedule.start.split(':').map(Number);
                    const [eH, eM] = schedule.end.split(':').map(Number);
                    const diff = eH * 60 + eM - (sH * 60 + sM);
                    if (diff > 0) {
                      const h = Math.floor(diff / 60);
                      const m = diff % 60;
                      return (
                        <span className="text-xs text-gray-500 dark:text-white/40 ml-2">
                          {h}h{m > 0 ? ` ${m}m` : ''}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-white/30 italic">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <p className="text-sm text-purple-200">
          <strong>Note:</strong> This schedule determines when students can book live sessions with
          you. You can always manually schedule sessions outside these hours. All times are displayed
          in your selected timezone ({availability.timezone.replace(/_/g, ' ')}).
        </p>
      </div>
    </div>
  );
};
