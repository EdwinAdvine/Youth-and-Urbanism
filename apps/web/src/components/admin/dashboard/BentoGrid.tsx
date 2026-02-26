import React from 'react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min ${className}`}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
