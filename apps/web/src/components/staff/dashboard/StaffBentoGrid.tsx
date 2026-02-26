import React from 'react';

interface StaffBentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const StaffBentoGrid: React.FC<StaffBentoGridProps> = ({ children, columns = 3, className = '' }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default StaffBentoGrid;
