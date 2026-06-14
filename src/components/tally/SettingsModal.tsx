import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
  setSheetId: (id: string) => void;
}

export default function SettingsModal({ isOpen, onClose, sheetId, setSheetId }: SettingsModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      setInputValue(sheetId);
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen, sheetId]);

  if (!isOpen) return null;

  const handleSave = () => {
    setSheetId(inputValue.trim());
    onClose();
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
          <div className="w-8"></div>
          
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Settings</h2>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label htmlFor="sheet-id" className="block text-sm font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
              Google Sheet ID
            </label>
            <input 
              id="sheet-id"
              type="text" 
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 shadow-inner focus:ring-2 focus:ring-accent focus:border-accent text-neutral-900 dark:text-white outline-none transition-all"
              placeholder="Paste your Sheet ID here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
              Find this in your Google Sheet URL: <br/>
              <span className="font-mono text-[10px] break-all opacity-80">docs.google.com/spreadsheets/d/<span className="font-bold text-accent dark:text-accent-light">YOUR_ID_HERE</span>/edit</span>
            </p>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 mt-2 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-800 cursor-pointer"
          >
            Apply Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
