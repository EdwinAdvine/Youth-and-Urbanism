/**
 * CBC Radar Chart Component
 *
 * Displays 7 CBC competencies on a radar chart using Recharts.
 */

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { CBCCompetencyScore } from '../../../types/parent';

interface CBCRadarChartProps {
  competencies: CBCCompetencyScore[];
  showLegend?: boolean;
}

const CBCRadarChart: React.FC<CBCRadarChartProps> = ({ competencies, showLegend = true }) => {
  // Transform data for Recharts
  const chartData = competencies.map((comp) => ({
    subject: comp.name,
    score: comp.score,
    fullMark: 100,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{payload[0].payload.subject}</p>
          <p className="text-lg font-bold text-[#E40000]">{payload[0].value.toFixed(0)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Radar Chart */}
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#22272B" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#ffffff80', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#ffffff40', fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#E40000"
              fill="#E40000"
              fillOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Competency Details */}
      {showLegend && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {competencies.map((comp) => (
            <div
              key={comp.name}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{comp.name}</h4>
                <span className="text-lg font-bold text-[#E40000]">
                  {comp.score.toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                  style={{ width: `${comp.score}%` }}
                />
              </div>

              {/* Description */}
              {comp.description && (
                <p className="text-xs text-gray-500 dark:text-white/60">{comp.description}</p>
              )}

              {/* Trend */}
              {comp.trend && (
                <div className="mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      comp.trend === 'improving'
                        ? 'bg-green-500/20 text-green-500'
                        : comp.trend === 'declining'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-gray-500/20 text-gray-500'
                    }`}
                  >
                    {comp.trend}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CBCRadarChart;
