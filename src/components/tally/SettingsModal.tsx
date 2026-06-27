import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckIcon, MinusIcon, Cog6ToothIcon, FunnelIcon, MapPinIcon, TableCellsIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { SettingsModalConfig } from '@/types/page';

interface PitInfo {
  teamId: number;
  team: string;
  teamNumber: string;
  pit: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
  setSheetId: (id: string) => void;
  teams: string[];
  filter: string[];
  setFilter: (filter: string[]) => void;
  pitInfo: PitInfo[];
  config: SettingsModalConfig;
}

export default function SettingsModal({ isOpen, onClose, sheetId, setSheetId, teams, filter, setFilter, pitInfo, config }: SettingsModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [sheetIdError, setSheetIdError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'filter' | 'pits'>('setup');

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

  const handleSaveSheetId = () => {
    let raw = inputValue.trim();
    if (!raw) {
      setSheetIdError(config.errors.empty_sheet_id);
      return;
    }
    
    // Auto-extract ID if a full Google Sheets URL was pasted
    const urlMatch = raw.match(/\/d\/([a-zA-Z0-9-_]{40,})\//);
    if (urlMatch && urlMatch[1]) {
      raw = urlMatch[1];
      setInputValue(raw);
    }

    // Basic format validation for Google Sheet IDs
    if (!/^[a-zA-Z0-9-_]{40,}$/.test(raw)) {
      setSheetIdError(config.errors.invalid_sheet_id);
      return;
    }

    setSheetIdError(null);
    setSheetId(raw);
  };

  const handleReset = () => {
    setFilter(['All']);
    setSheetId('');
    setInputValue('');
  };

  // Filter Logic
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
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 text-success">
             <Cog6ToothIcon className="w-6 h-6" />
             <h2 className="hidden sm:block text-xl font-bold text-neutral-900 dark:text-white leading-none">{config.title}</h2>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
          {/* Sidebar (Desktop) */}
          <div className="hidden md:flex w-64 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex-shrink-0 p-4 flex-col gap-2">
             <button
                onClick={() => setActiveTab('setup')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-sm cursor-pointer ${activeTab === 'setup' ? 'bg-success text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
             >
                <TableCellsIcon className="w-5 h-5 flex-shrink-0" />
                <span>{config.tabs.data_source}</span>
             </button>
             <button
                onClick={() => setActiveTab('filter')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-sm cursor-pointer ${activeTab === 'filter' ? 'bg-success text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
             >
                <FunnelIcon className="w-5 h-5 flex-shrink-0" />
                <span>{config.tabs.filter_teams}</span>
             </button>
             <button
                onClick={() => setActiveTab('pits')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-sm cursor-pointer ${activeTab === 'pits' ? 'bg-success text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}
             >
                <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                <span>{config.tabs.pit_information}</span>
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-neutral-800 overflow-y-auto custom-scrollbar flex flex-col pb-20 md:pb-0">
            {activeTab === 'setup' && (
               <div className="p-4 md:p-8 max-w-2xl">
                 <div className="flex items-center min-h-[40px] mb-6">
                   <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{config.tabs.data_source}</h3>
                 </div>
                 <div className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="sheet-id" className="block text-sm font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
                        {config.labels.google_sheet_id}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                         <input 
                           id="sheet-id"
                           type="text" 
                           className={`flex-1 bg-neutral-50 dark:bg-neutral-900 border ${sheetIdError ? 'border-error focus:ring-error focus:border-error' : 'border-neutral-300 dark:border-neutral-600 focus:ring-accent focus:border-accent'} rounded-lg p-3 shadow-inner focus:ring-2 text-neutral-900 dark:text-white outline-none transition-all`}
                           placeholder={config.labels.sheet_id_placeholder}
                           value={inputValue}
                           onChange={(e) => {
                             setInputValue(e.target.value);
                             if (sheetIdError) setSheetIdError(null);
                           }}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') handleSaveSheetId();
                           }}
                         />
                         <button
                           onClick={handleSaveSheetId}
                           className="py-3 px-6 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-800 cursor-pointer"
                         >
                           {config.buttons.save}
                         </button>
                      </div>
                      {sheetIdError && (
                        <p className="text-sm font-semibold text-error mt-2">{sheetIdError}</p>
                      )}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                        {config.labels.find_this_in_url} <br/>
                        <span className="font-mono text-[10px] break-all opacity-80">{config.labels.url_example}</span>
                      </p>
                    </div>
                 </div>

                 <div className="mt-12">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-error/10 hover:bg-error text-error hover:text-white font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 dark:focus:ring-offset-neutral-800 cursor-pointer w-fit"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        {config.labels.reset_all_settings}
                    </button>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
                        {config.labels.reset_warning}
                    </p>
                 </div>
               </div>
            )}

            {activeTab === 'filter' && (
               <div className="p-4 md:p-8 flex flex-col h-full">
                 <div className="flex justify-between items-center flex-wrap gap-4 min-h-[40px] mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{config.tabs.filter_teams}</h3>
                    <button
                      onClick={handleToggleAll}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      <div className={`flex items-center justify-center w-5 h-5 rounded border ${isAllSelected || isIndeterminate ? 'bg-success border-success' : 'bg-white border-neutral-400 dark:bg-neutral-800 dark:border-neutral-500'} transition-colors`}>
                        {isAllSelected && <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        {isIndeterminate && <MinusIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      {isAllSelected ? config.labels.deselect_all : config.labels.select_all}
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2">
                        {actualTeams.map(team => {
                          const checked = isAllSelected || filter.includes(team);
                          return (
                            <div 
                              key={team}
                              onClick={() => handleToggleTeam(team)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-600"
                            >
                              <div className={`flex items-center justify-center w-5 h-5 rounded border flex-shrink-0 ${checked ? 'bg-success border-success' : 'bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600'} transition-colors`}>
                                {checked && <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                              </div>
                              <span className="text-neutral-800 dark:text-neutral-200 font-medium select-none truncate" title={team}>{team}</span>
                            </div>
                          );
                        })}
                    </div>
                    {actualTeams.length === 0 && (
                      <div className="h-40 flex items-center justify-center">
                         <p className="text-neutral-500 dark:text-neutral-400 italic font-medium">{config.messages.no_teams_available}</p>
                      </div>
                    )}
               </div>
            )}

            {activeTab === 'pits' && (
               <div className="p-4 md:p-8 flex flex-col h-full">
                 <div className="flex items-center min-h-[40px] mb-6">
                   <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{config.tabs.pit_information}</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2">
                        {pitInfo.map((info) => (
                          <div 
                            key={`pit-info-${info.teamId}`}
                            className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex-shrink-0 shadow-inner" 
                              style={{ backgroundColor: `hsla(var(--hue-${info.teamId % 64}), 80%, var(--border-lightness), 1)` }}
                            ></div>
                            <div className="flex flex-col min-w-0">
                               <span className="text-neutral-900 dark:text-white font-bold truncate" title={info.team}>{info.team}</span>
                               <div className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                  <span>#{info.teamNumber}</span>
                                  <span className="font-semibold text-accent dark:text-accent-light px-1.5 py-0.5 rounded-md bg-accent/10 dark:bg-accent/20">{config.labels.pit} {info.pit}</span>
                               </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {pitInfo.length === 0 && (
                      <div className="h-40 flex items-center justify-center">
                         <p className="text-neutral-500 dark:text-neutral-400 italic font-medium">{config.messages.no_teams_selected}</p>
                      </div>
                    )}
               </div>
            )}
          </div>

          {/* Floating Bottom Bar (Mobile) */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-1.5 flex justify-around items-center z-10">
             <button
                onClick={() => setActiveTab('setup')}
                className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-xl transition-all ${activeTab === 'setup' ? 'text-success bg-success/10' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
             >
                <TableCellsIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{config.tabs.data_source_mobile}</span>
             </button>
             <button
                onClick={() => setActiveTab('filter')}
                className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-xl transition-all ${activeTab === 'filter' ? 'text-success bg-success/10' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
             >
                <FunnelIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{config.tabs.filter_teams_mobile}</span>
             </button>
             <button
                onClick={() => setActiveTab('pits')}
                className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-xl transition-all ${activeTab === 'pits' ? 'text-success bg-success/10' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
             >
                <MapPinIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{config.tabs.pit_information_mobile}</span>
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
