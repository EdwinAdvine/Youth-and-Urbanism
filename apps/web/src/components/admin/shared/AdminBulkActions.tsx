import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

interface AdminBulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (actionKey: string) => void;
  onClearSelection: () => void;
}

const AdminBulkActions: React.FC<AdminBulkActionsProps> = ({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#181C1F] border border-[#333] rounded-xl shadow-2xl"
        >
          {/* Selected count */}
          <span className="text-sm font-medium text-white/70 whitespace-nowrap">
            {selectedCount} selected
          </span>

          <div className="w-px h-5 bg-[#333]" />

          {/* Action buttons */}
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => onAction(action.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                action.variant === 'danger'
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          <div className="w-px h-5 bg-[#333]" />

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminBulkActions;
