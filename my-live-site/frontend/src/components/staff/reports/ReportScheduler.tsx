import React, { useState } from 'react';
import { Calendar, Clock, Mail, Download, Repeat } from 'lucide-react';

interface ScheduleConfig {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel';
}

interface ReportSchedulerProps {
  reportId: string;
  currentSchedule?: ScheduleConfig;
  onSaveSchedule: (config: ScheduleConfig) => void;
  onCancelSchedule: () => void;
  isLoading?: boolean;
}

const ReportScheduler: React.FC<ReportSchedulerProps> = ({
  currentSchedule,
  onSaveSchedule,
  onCancelSchedule,
  isLoading,
}) => {
  const [config, setConfig] = useState<ScheduleConfig>(
    currentSchedule || {
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '09:00',
      recipients: [],
      format: 'pdf',
    }
  );
  const [emailInput, setEmailInput] = useState('');

  const handleAddRecipient = () => {
    if (emailInput.trim() && !config.recipients.includes(emailInput.trim())) {
      setConfig({ ...config, recipients: [...config.recipients, emailInput.trim()] });
      setEmailInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setConfig({ ...config, recipients: config.recipients.filter((r) => r !== email) });
  };

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-400" />
        Schedule Report
      </h3>

      <div className="space-y-4">
        {/* Frequency */}
        <div>
          <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Frequency</label>
          <div className="grid grid-cols-2 gap-2">
            {(['once', 'daily', 'weekly', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setConfig({ ...config, frequency: freq })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  config.frequency === freq
                    ? 'bg-[#E40000]/20 text-[#FF4444] border border-[#E40000]/30'
                    : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 border border-transparent hover:border-gray-200 dark:hover:border-[#2A2F34]'
                }`}
              >
                <Repeat className="w-3 h-3 inline mr-1" />
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Day selection */}
        {config.frequency === 'weekly' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Day of Week</label>
            <select
              value={config.dayOfWeek}
              onChange={(e) => setConfig({ ...config, dayOfWeek: Number(e.target.value) })}
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (day, i) => (
                  <option key={i} value={i + 1}>
                    {day}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {config.frequency === 'monthly' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Day of Month</label>
            <input
              type="number"
              min={1}
              max={31}
              value={config.dayOfMonth || 1}
              onChange={(e) => setConfig({ ...config, dayOfMonth: Number(e.target.value) })}
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Time */}
        <div>
          <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Time (24h)</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
            <input
              type="time"
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Export Format</label>
          <div className="flex gap-2">
            {(['pdf', 'csv', 'excel'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setConfig({ ...config, format: fmt })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  config.format === fmt
                    ? 'bg-[#E40000]/20 text-[#FF4444] border border-[#E40000]/30'
                    : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 border border-transparent hover:border-gray-200 dark:hover:border-[#2A2F34]'
                }`}
              >
                <Download className="w-3 h-3 inline mr-1" />
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div>
          <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Email Recipients</label>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
              placeholder="email@example.com"
              className="flex-1 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
            />
            <button
              onClick={handleAddRecipient}
              className="px-3 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 text-xs"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.recipients.map((email) => (
              <span
                key={email}
                className="px-2 py-1 bg-gray-100 dark:bg-[#22272B] text-xs text-gray-500 dark:text-white/60 rounded-full flex items-center gap-1"
              >
                {email}
                <button
                  onClick={() => handleRemoveRecipient(email)}
                  className="text-gray-400 dark:text-white/30 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSaveSchedule(config)}
            disabled={isLoading || config.recipients.length === 0}
            className="flex-1 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] text-sm font-medium rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </button>
          {currentSchedule && (
            <button
              onClick={onCancelSchedule}
              className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler;
