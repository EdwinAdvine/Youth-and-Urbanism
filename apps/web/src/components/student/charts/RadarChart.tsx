/**
 * Radar Chart Component - Skill visualization
 */
import { Radar } from 'react-chartjs-2';
import './ChartConfig';
import { defaultRadarOptions, chartColors } from './ChartConfig';

interface RadarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
  height?: number;
  maxValue?: number;
}

const colorPresets = [
  { bg: chartColors.primaryLight, border: chartColors.primary },
  { bg: chartColors.blueLight, border: chartColors.blue },
  { bg: chartColors.greenLight, border: chartColors.green },
  { bg: chartColors.purpleLight, border: chartColors.purple },
];

export default function RadarChart({ labels, datasets, height = 300, maxValue = 100 }: RadarChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color ? `${ds.color}33` : colorPresets[i % colorPresets.length].bg,
      borderColor: ds.color || colorPresets[i % colorPresets.length].border,
      borderWidth: 2,
      pointBackgroundColor: ds.color || colorPresets[i % colorPresets.length].border,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: ds.color || colorPresets[i % colorPresets.length].border,
    })),
  };

  const options = {
    ...defaultRadarOptions,
    scales: {
      ...defaultRadarOptions.scales,
      r: {
        ...defaultRadarOptions.scales.r,
        max: maxValue,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Radar data={chartData} options={options} />
    </div>
  );
}
