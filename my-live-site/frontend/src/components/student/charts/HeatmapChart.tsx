/**
 * Heatmap Chart Component - Activity/streak visualization
 * CSS-based heatmap (no additional Chart.js dependency)
 */

interface HeatmapData {
  date: string; // YYYY-MM-DD
  value: number; // 0-4 intensity
}

interface HeatmapChartProps {
  data: HeatmapData[];
  weeks?: number;
  colorScheme?: 'green' | 'red' | 'blue' | 'purple';
  showLabels?: boolean;
}

const colorSchemes = {
  green: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  red: ['#ebedf0', '#fca5a5', '#f87171', '#ef4444', '#b91c1c'],
  blue: ['#ebedf0', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'],
  purple: ['#ebedf0', '#c4b5fd', '#a78bfa', '#8b5cf6', '#6d28d9'],
};

const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export default function HeatmapChart({
  data,
  weeks = 12,
  colorScheme = 'green',
  showLabels = true,
}: HeatmapChartProps) {
  const colors = colorSchemes[colorScheme];
  const totalDays = weeks * 7;
  const today = new Date();

  // Build grid data
  const gridData: { date: string; value: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const found = data.find(d => d.date === dateStr);
    gridData.push({
      date: dateStr,
      value: found ? Math.min(4, Math.max(0, found.value)) : 0,
    });
  }

  // Group into weeks (columns)
  const weekColumns: typeof gridData[] = [];
  for (let i = 0; i < gridData.length; i += 7) {
    weekColumns.push(gridData.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5">
        {showLabels && (
          <div className="flex flex-col gap-0.5 mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-3 w-6 text-[9px] text-gray-400 flex items-center">
                {label}
              </div>
            ))}
          </div>
        )}
        {weekColumns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-3 h-3 rounded-sm transition-colors cursor-pointer"
                style={{ backgroundColor: colors[day.value] }}
                title={`${day.date}: ${day.value} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
        <span>Less</span>
        {colors.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
