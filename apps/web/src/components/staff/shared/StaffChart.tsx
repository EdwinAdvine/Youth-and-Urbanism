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

const FALLBACK_COLORS = [
  '#E40000',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];

interface StaffChartProps {
  type: 'area' | 'bar' | 'line' | 'pie';
  data: Record<string, unknown>[];
  dataKeys: { key: string; color: string; name?: string }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
}

const customTooltipStyle: React.CSSProperties = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

const StaffChart: React.FC<StaffChartProps> = ({
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className = '',
}) => {
  const commonAxisProps = {
    stroke: '#333',
    tick: { fill: '#666', fontSize: 11 },
    tickLine: false,
    axisLine: false,
  };

  const getColor = (dk: { color: string }, idx: number) =>
    dk.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
            )}
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
                stroke={getColor(dk, idx)}
                fill={getColor(dk, idx)}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
            )}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            {showTooltip && <Tooltip contentStyle={customTooltipStyle} />}
            {showLegend && <Legend />}
            {dataKeys.map((dk, idx) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name || dk.key}
                fill={getColor(dk, idx)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
            )}
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
                stroke={getColor(dk, idx)}
                strokeWidth={2}
                dot={{ fill: getColor(dk, idx), r: 3 }}
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
                <Cell
                  key={idx}
                  fill={
                    dataKeys[idx]?.color ||
                    FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
                  }
                />
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

export default StaffChart;
