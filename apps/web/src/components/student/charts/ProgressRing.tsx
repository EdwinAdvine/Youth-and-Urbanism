/**
 * Progress Ring Component - Circular progress indicator
 */
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#E40000',
  bgColor = '#e5e7eb',
  label,
  sublabel,
  showPercent = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercent && (
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {Math.round(clampedProgress)}%
            </span>
          )}
          {label && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</span>
          )}
        </div>
      </div>
      {sublabel && (
        <span className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">{sublabel}</span>
      )}
    </div>
  );
}
