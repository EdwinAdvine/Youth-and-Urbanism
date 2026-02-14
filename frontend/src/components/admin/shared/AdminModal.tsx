import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0].focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`
              relative w-full ${sizeClasses[size]}
              bg-[#181C1F] border border-[#22272B] rounded-xl shadow-2xl
              max-h-[90vh] flex flex-col
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#22272B] flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-[#22272B] flex-shrink-0">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
