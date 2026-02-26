import React from 'react';
import { BarChart3, Table2, Gauge, Type, TrendingUp, PieChart, Users, Clock } from 'lucide-react';

interface WidgetTemplate {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  name: string;
  icon: React.ElementType;
  description: string;
  defaultConfig: Record<string, any>;
}

interface ReportWidgetPaletteProps {
  onAddWidget: (type: string, config: Record<string, any>) => void;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'metric',
    type: 'metric',
    name: 'Metric Card',
    icon: Gauge,
    description: 'Display a single number',
    defaultConfig: { value: '0', label: 'Metric' },
  },
  {
    id: 'bar-chart',
    type: 'chart',
    name: 'Bar Chart',
    icon: BarChart3,
    description: 'Compare values',
    defaultConfig: { chartType: 'bar', data: [] },
  },
  {
    id: 'pie-chart',
    type: 'chart',
    name: 'Pie Chart',
    icon: PieChart,
    description: 'Show proportions',
    defaultConfig: { chartType: 'pie', data: [] },
  },
  {
    id: 'line-chart',
    type: 'chart',
    name: 'Line Chart',
    icon: TrendingUp,
    description: 'Show trends over time',
    defaultConfig: { chartType: 'line', data: [] },
  },
  {
    id: 'data-table',
    type: 'table',
    name: 'Data Table',
    icon: Table2,
    description: 'Detailed data view',
    defaultConfig: { columns: [], rows: [] },
  },
  {
    id: 'text-block',
    type: 'text',
    name: 'Text Block',
    icon: Type,
    description: 'Add context and notes',
    defaultConfig: { content: 'Enter your text...' },
  },
  {
    id: 'user-list',
    type: 'table',
    name: 'User List',
    icon: Users,
    description: 'Display user data',
    defaultConfig: { type: 'users', columns: ['name', 'email', 'role'] },
  },
  {
    id: 'time-series',
    type: 'chart',
    name: 'Time Series',
    icon: Clock,
    description: 'Time-based data',
    defaultConfig: { chartType: 'timeSeries', interval: 'day' },
  },
];

const ReportWidgetPalette: React.FC<ReportWidgetPaletteProps> = ({ onAddWidget }) => {
  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Widget Palette</h3>
      <div className="space-y-2">
        {WIDGET_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onAddWidget(template.type, template.defaultConfig)}
              className="w-full flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/50 hover:bg-gray-100 dark:hover:bg-[#22272B] border border-transparent hover:border-[#E40000]/30 transition-all text-left"
            >
              <div className="p-2 rounded-lg bg-[#2A2F34]">
                <Icon className="w-4 h-4 text-gray-500 dark:text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium">{template.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportWidgetPalette;
