import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { TrendingUp, Calendar } from 'lucide-react';
import LineChart from '../../components/student/charts/LineChart';
import HeatmapChart from '../../components/student/charts/HeatmapChart';

const VisualTrendsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term'>('month');

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const heatmapData = Array.from({ length: 84 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    return { date: date.toISOString().split('T')[0], value: Math.floor(Math.random() * 5) };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-400" /> Visual Trends
          </h1>
          <p className="text-gray-600 dark:text-white/70">See your learning progress over time</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'term'] as const).map(range => (
            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-2 ${borderRadius} text-sm capitalize ${timeRange === range ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* XP Progress */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">XP Earned Over Time</h3>
        <LineChart
          labels={timeRange === 'week' ? weekLabels : monthLabels}
          datasets={[
            { label: 'XP Earned', data: timeRange === 'week' ? [80, 120, 60, 150, 90, 40, 110] : [580, 620, 540, 700], fill: true }
          ]}
          height={250}
        />
      </div>

      {/* Subject Performance */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">Subject Performance Trends</h3>
        <LineChart
          labels={monthLabels}
          datasets={[
            { label: 'Mathematics', data: [70, 75, 72, 78], color: '#3B82F6' },
            { label: 'Science', data: [60, 58, 65, 65], color: '#22C55E' },
            { label: 'English', data: [80, 82, 80, 82], color: '#A855F7' },
          ]}
          height={250}
        />
      </div>

      {/* Activity Heatmap */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" /> Activity Heatmap
        </h3>
        <HeatmapChart data={heatmapData} weeks={12} colorScheme="green" />
      </div>

      {/* Study Time */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">Daily Study Time (minutes)</h3>
        <LineChart
          labels={weekLabels}
          datasets={[
            { label: 'Study Minutes', data: [45, 60, 30, 75, 50, 20, 55], fill: true }
          ]}
          height={200}
        />
      </div>
    </div>
  );
};

export default VisualTrendsPage;
