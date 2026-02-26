/**
 * ChildSelector Component
 *
 * Global child selector dropdown for parent dashboard.
 * Allows parents to switch between viewing data for different children
 * or view combined family data.
 */

import React from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';

interface ChildSelectorProps {
  className?: string;
  showFamilyOption?: boolean;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  className = '',
  showFamilyOption = true,
}) => {
  const { selectedChildId, children, setSelectedChild } = useParentStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  const handleSelect = (childId: string | null) => {
    setSelectedChild(childId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg hover:border-[#E40000]/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {selectedChild ? selectedChild.full_name : 'All Children'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-white/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-20 overflow-hidden">
            {/* All Children Option */}
            {showFamilyOption && (
              <button
                onClick={() => handleSelect(null)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors ${
                  !selectedChildId ? 'bg-[#E40000]/10 border-l-2 border-[#E40000]' : ''
                }`}
              >
                <Users className="w-5 h-5 text-[#E40000]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    All Children
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/60">
                    Family overview
                  </div>
                </div>
              </button>
            )}

            {/* Divider */}
            {showFamilyOption && children.length > 0 && (
              <div className="border-t border-gray-200 dark:border-[#22272B]" />
            )}

            {/* Individual Children */}
            {children.map((child) => (
              <button
                key={child.student_id}
                onClick={() => handleSelect(child.student_id)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors ${
                  selectedChildId === child.student_id
                    ? 'bg-[#E40000]/10 border-l-2 border-[#E40000]'
                    : ''
                }`}
              >
                {/* Avatar or Initial */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-sm font-semibold">
                  {child.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Child Info */}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {child.full_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/60">
                    {child.grade_level} • {child.admission_number}
                  </div>
                </div>

                {/* Active Indicator */}
                {child.is_active && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </button>
            ))}

            {/* No Children State */}
            {children.length === 0 && (
              <div className="px-4 py-6 text-center">
                <Users className="w-8 h-8 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-white/60">No children linked</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                  Link a child using their admission number
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChildSelector;
