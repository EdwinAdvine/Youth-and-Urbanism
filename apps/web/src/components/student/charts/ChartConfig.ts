/**
 * Chart.js Configuration - Registration and defaults
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options
export const defaultLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        font: { size: 12 },
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      ticks: { font: { size: 11 } },
    },
  },
};

export const defaultRadarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        font: { size: 10 },
      },
      pointLabels: {
        font: { size: 12 },
      },
    },
  },
};

export const defaultBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
  },
};

// Color palettes
export const chartColors = {
  primary: 'rgba(228, 0, 0, 1)',
  primaryLight: 'rgba(228, 0, 0, 0.2)',
  blue: 'rgba(59, 130, 246, 1)',
  blueLight: 'rgba(59, 130, 246, 0.2)',
  green: 'rgba(34, 197, 94, 1)',
  greenLight: 'rgba(34, 197, 94, 0.2)',
  purple: 'rgba(168, 85, 247, 1)',
  purpleLight: 'rgba(168, 85, 247, 0.2)',
  orange: 'rgba(249, 115, 22, 1)',
  orangeLight: 'rgba(249, 115, 22, 0.2)',
  yellow: 'rgba(234, 179, 8, 1)',
  yellowLight: 'rgba(234, 179, 8, 0.2)',
};

export default ChartJS;
