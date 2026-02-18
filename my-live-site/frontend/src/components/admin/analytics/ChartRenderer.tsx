import React from 'react';
import AdminChart from '../shared/AdminChart';

interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  x_key: string;
  y_key: string;
  title: string;
}

interface ChartRendererProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  height?: number;
  className?: string;
}

/**
 * Generic chart renderer that wraps AdminChart with dynamic
 * type selection based on a chart configuration object.
 *
 * Used by AIQueryBuilder and anywhere else that needs to
 * render charts from backend-provided config.
 */
const ChartRenderer: React.FC<ChartRendererProps> = ({
  data,
  config,
  height = 320,
  className = '',
}) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No data to display
      </div>
    );
  }

  // Map config type to AdminChart type (area is not in config, bar/line/pie are)
  const chartType: 'area' | 'bar' | 'line' | 'pie' = config.type === 'bar'
    ? 'bar'
    : config.type === 'line'
      ? 'line'
      : config.type === 'pie'
        ? 'pie'
        : 'bar';

  return (
    <div className={className}>
      {config.title && (
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          {config.title}
        </h4>
      )}
      <AdminChart
        type={chartType}
        data={data}
        dataKeys={[{ key: config.y_key, name: config.y_key.replace(/_/g, ' ') }]}
        xAxisKey={config.x_key}
        height={height}
        showGrid
        showTooltip
        showLegend={chartType === 'pie'}
      />
    </div>
  );
};

export default ChartRenderer;
