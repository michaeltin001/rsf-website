import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TeamFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: string[];
  filter: string[];
  setFilter: (filter: string[]) => void;
}

export default function TeamFilterModal({ isOpen, onClose, teams, filter, setFilter }: TeamFilterModalProps) {
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

  const actualTeams = teams.filter(t => t !== 'All');
  const isAllSelected = filter.includes('All') || filter.length === actualTeams.length;
  const selectedCount = filter.includes('All') ? actualTeams.length : filter.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < actualTeams.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setFilter([]); 
    } else {
      setFilter(['All']); 
    }
  };

  const handleToggleTeam = (team: string) => {
    if (isAllSelected) {
      setFilter(actualTeams.filter(t => t !== team));
    } else {
      const newFilter = filter.includes(team)
        ? filter.filter(t => t !== team)
        : [...filter, team];

      if (newFilter.length === actualTeams.length) {
        setFilter(['All']);
      } else {
        setFilter(newFilter);
      }
    }
  };

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
          <button
            onClick={handleToggleAll}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label={isAllSelected ? "Deselect All" : "Select All"}
          >
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${isAllSelected || isIndeterminate ? 'bg-accent border-accent' : 'bg-white border-neutral-400 dark:bg-neutral-800 dark:border-neutral-500'} transition-colors`}>
              {isAllSelected && <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              {isIndeterminate && <MinusIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
          </button>
          
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Select Teams</h2>
          
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
          {actualTeams.map(team => {
            const checked = isAllSelected || filter.includes(team);
            return (
              <div 
                key={team}
                onClick={() => handleToggleTeam(team)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors"
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded border ${checked ? 'bg-accent border-accent' : 'bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600'} transition-colors`}>
                  {checked && <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium select-none">{team}</span>
              </div>
            );
          })}
          
          {actualTeams.length === 0 && (
            <p className="text-center text-neutral-500 dark:text-neutral-400 p-6 italic font-medium">No teams available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
