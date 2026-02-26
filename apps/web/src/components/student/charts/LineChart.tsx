/**
 * Line Chart Component - Trend visualization
 */
import { Line } from 'react-chartjs-2';
import './ChartConfig';
import { defaultLineOptions, chartColors } from './ChartConfig';

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }[];
  height?: number;
  showLegend?: boolean;
}

const colorPresets = [
  { bg: chartColors.primaryLight, border: chartColors.primary },
  { bg: chartColors.blueLight, border: chartColors.blue },
  { bg: chartColors.greenLight, border: chartColors.green },
  { bg: chartColors.purpleLight, border: chartColors.purple },
  { bg: chartColors.orangeLight, border: chartColors.orange },
];

export default function LineChart({ labels, datasets, height = 300, showLegend = true }: LineChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color || colorPresets[i % colorPresets.length].border,
      backgroundColor: ds.color ? `${ds.color}33` : colorPresets[i % colorPresets.length].bg,
      fill: ds.fill ?? false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
    })),
  };

  const options = {
    ...defaultLineOptions,
    plugins: {
      ...defaultLineOptions.plugins,
      legend: {
        ...defaultLineOptions.plugins.legend,
        display: showLegend,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
