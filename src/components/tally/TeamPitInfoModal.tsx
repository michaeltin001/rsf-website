import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PitInfo {
  teamId: number;
  team: string;
  teamNumber: string;
  pit: string;
}

interface TeamPitInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitInfo: PitInfo[];
}

export default function TeamPitInfoModal({ isOpen, onClose, pitInfo }: TeamPitInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose} 
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="w-8"></div>
          
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Pit Information</h2>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Scrollable List */}
        <div className="overflow-y-auto p-3 flex-1 custom-scrollbar">
          {pitInfo.map((info) => (
            <div 
              key={`pit-info-${info.teamId}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" 
                style={{ backgroundColor: `hsla(var(--hue-${info.teamId % 64}), 80%, var(--border-lightness), 1)` }}
              ></div>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium text-base">
                <span className="font-bold text-primary dark:text-primary-light">{info.team}</span> ({info.teamNumber}): <span className="font-bold">Pit {info.pit}</span>
              </span>
            </div>
          ))}
          
          {pitInfo.length === 0 && (
            <p className="text-center text-neutral-500 dark:text-neutral-400 p-6 italic font-medium">No teams currently selected.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
