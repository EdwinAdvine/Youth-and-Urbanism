import React from 'react';

interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

interface DifficultyLevel {
  label: string;
  color: string;
  trackColor: string;
  bgColor: string;
}

const DIFFICULTY_LEVELS: Record<number, DifficultyLevel> = {
  1: {
    label: 'Easy',
    color: 'text-green-400',
    trackColor: '#4ade80',
    bgColor: 'bg-green-500/20',
  },
  2: {
    label: 'Below Average',
    color: 'text-lime-400',
    trackColor: '#a3e635',
    bgColor: 'bg-lime-500/20',
  },
  3: {
    label: 'Average',
    color: 'text-amber-400',
    trackColor: '#fbbf24',
    bgColor: 'bg-amber-500/20',
  },
  4: {
    label: 'Above Average',
    color: 'text-orange-400',
    trackColor: '#fb923c',
    bgColor: 'bg-orange-500/20',
  },
  5: {
    label: 'Hard',
    color: 'text-red-400',
    trackColor: '#f87171',
    bgColor: 'bg-red-500/20',
  },
};

const DifficultySlider: React.FC<DifficultySliderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const currentLevel = DIFFICULTY_LEVELS[value] || DIFFICULTY_LEVELS[3];
  const percentage = ((value - 1) / 4) * 100;

  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-white/60">Difficulty</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold tabular-nums ${currentLevel.color}`}
          >
            {value}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentLevel.bgColor} ${currentLevel.color}`}
          >
            {currentLevel.label}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative py-2">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, ${currentLevel.trackColor} ${percentage}%, #22272B ${percentage}%)`,
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between px-[2px] mt-1">
          {[1, 2, 3, 4, 5].map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onChange(tick)}
              disabled={disabled}
              className={`w-2 h-2 rounded-full transition-all ${
                tick <= value
                  ? `opacity-100`
                  : 'bg-gray-100 dark:bg-[#22272B] opacity-60'
              }`}
              style={{
                backgroundColor: tick <= value ? currentLevel.trackColor : undefined,
              }}
            />
          ))}
        </div>

        {/* Labels under ticks */}
        <div className="flex justify-between mt-1">
          {[1, 2, 3, 4, 5].map((tick) => (
            <span
              key={tick}
              className={`text-[9px] text-center ${
                tick === value ? currentLevel.color : 'text-gray-400 dark:text-white/30'
              }`}
              style={{ width: '20%' }}
            >
              {DIFFICULTY_LEVELS[tick].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultySlider;
