import React, { useState } from 'react';

interface ConfidenceRatingProps {
  onRate: (rating: number) => void;
  className?: string;
}

/**
 * 1-5 star confidence rating that appears after AI tutoring exchanges.
 * Used when Birdy asks "How confident do you feel? Rate yourself 1-5 stars."
 */
const ConfidenceRating: React.FC<ConfidenceRatingProps> = ({ onRate, className = '' }) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    onRate(rating);
  };

  const labels = ['Not at all', 'A little', 'Getting there', 'Pretty good', 'Super confident!'];

  if (selectedRating !== null) {
    return (
      <div className={`flex items-center gap-2 py-2 ${className}`}>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${star <= selectedRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {labels[selectedRating - 1]}
        </span>
      </div>
    );
  }

  return (
    <div className={`py-2 ${className}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        How confident do you feel?
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => handleRate(star)}
            className={`text-2xl transition-transform hover:scale-125 ${
              hoveredStar !== null && star <= hoveredStar
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
            title={labels[star - 1]}
            aria-label={`${star} star - ${labels[star - 1]}`}
          >
            ★
          </button>
        ))}
      </div>
      {hoveredStar !== null && (
        <p className="text-xs text-gray-400 mt-1">
          {labels[hoveredStar - 1]}
        </p>
      )}
    </div>
  );
};

export default ConfidenceRating;
