import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Default dark theme color palette
const CHART_COLORS = [
  '#E40000', // primary red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

interface AdminChartProps {
  type: 'area' | 'bar' | 'line' | 'pie';
  data: Record<string, unknown>[];
  dataKeys: { key: string; color?: string; name?: string }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  stacked?: boolean;
}

const customTooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

const AdminChart: React.FC<AdminChartProps> = ({
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  className = '',
  stacked = false,
}) => {
  const commonAxisProps = {
    stroke: '#333',
    tick: { fill: '#666', fontSize: 11 },
    tickLine: false,
    axisLine: false,
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip contentStyle={customTooltipStyle} />}
            {showLegend && <Legend />}
            {dataKeys.map((dk, idx) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name || dk.key}
                stroke={dk.color || CHART_COLORS[idx % CHART_COLORS.length]}
                fill={dk.color || CHART_COLORS[idx % CHART_COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip contentStyle={customTooltipStyle} />}
            {showLegend && <Legend />}
            {dataKeys.map((dk, idx) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name || dk.key}
                fill={dk.color || CHART_COLORS[idx % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip contentStyle={customTooltipStyle} />}
            {showLegend && <Legend />}
            {dataKeys.map((dk, idx) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name || dk.key}
                stroke={dk.color || CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: dk.color || CHART_COLORS[idx % CHART_COLORS.length], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            {showTooltip && <Tooltip contentStyle={customTooltipStyle} />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKeys[0]?.key || 'value'}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius="50%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
};

export default AdminChart;
