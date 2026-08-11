'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { parseMarkdownWithColor } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { SciolyEventItem, SciolyResourcesPageConfig } from '@/types/page';

interface SciolyResourcesEventProps {
  event: SciolyEventItem;
  config?: SciolyResourcesPageConfig;
}

interface SyllabusWeek {
  week: string;
  agenda: string;
  todayTasks: string;
  homework: string;
}

const categoryThemes: Record<number, string> = {
  1: "text-red-500 dark:text-red-400",
  2: "text-green-500 dark:text-green-400",
  3: "text-blue-500 dark:text-blue-400",
  4: "text-yellow-500 dark:text-yellow-400"
};

const categoryRingThemes: Record<number, string> = {
  1: "hover:border-red-500 dark:hover:border-red-400 hover:ring-2 hover:ring-red-500 dark:hover:ring-red-400",
  2: "hover:border-green-500 dark:hover:border-green-400 hover:ring-2 hover:ring-green-500 dark:hover:ring-green-400",
  3: "hover:border-blue-500 dark:hover:border-blue-400 hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400",
  4: "hover:border-yellow-500 dark:hover:border-yellow-400 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400"
};

export default function SciolyResourcesEvent({ event, config }: SciolyResourcesEventProps) {
  const parentTitle = config?.title || "Science Olympiad Resources";
  const noSyllabusError = config?.messages?.no_syllabus || 'No Syllabus Connected';
  const apiError = config?.messages?.google_sheets_error || 'Google Sheets API error';
  const noDataError = config?.messages?.no_data || 'No Data';

  const [syllabus, setSyllabus] = useState<SyllabusWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!config?.main_sheet_id) {
      setError(noSyllabusError);
      setIsLoading(false);
      return;
    }

    const tabName = event.sheet_name || event.title;

    const fetchSyllabus = async () => {
      setIsLoading(true);
      setError(null);
      
      const cacheKey = `syllabus_${config.main_sheet_id}_${tabName}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = new Date().getTime();
          // 10 minutes = 10 * 60 * 1000 = 600000 ms
          if (parsed.timestamp && (now - parsed.timestamp < 600000)) {
            setSyllabus(parsed.data);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Fall through to fetch
        }
      }

      try {
        const url = `https://docs.google.com/spreadsheets/d/${config.main_sheet_id}/gviz/tq?tqx=out:json&headers=2&sheet=${encodeURIComponent(tabName)}`;
        const res = await fetch(url);
        const text = await res.text();
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
        
        if (match && match[1]) {
          const json = JSON.parse(match[1]);
          
          if (json.status === 'error') {
            setError(json.errors?.[0]?.message || apiError);
            return;
          }
          
          if (!json.table || !json.table.rows) {
            setError(noDataError);
            return;
          }

          const rows = json.table.rows;
          
          const extractedSyllabus: SyllabusWeek[] = [];
          
          for (const row of rows) {
             // Access the first column using row.c[0]
             const weekVal = row.c[0]?.v;
             
             // If there's no week value, it's likely an empty row, skip it.
             if (!weekVal) continue;
             
             extractedSyllabus.push({
               week: String(weekVal),
               agenda: row.c[1]?.v || '',
               todayTasks: row.c[2]?.v || '',
               homework: row.c[3]?.v || ''
             });
          }
          
          if (extractedSyllabus.length === 0) {
            setError(noDataError);
            return;
          }

          setSyllabus(extractedSyllabus);
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: extractedSyllabus,
            timestamp: new Date().getTime()
          }));
        } else {
           throw new Error(noSyllabusError);
        }
      } catch (err: any) {
        console.error("Failed to fetch syllabus:", err);
        setError(err.message || noSyllabusError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSyllabus();
  }, [config?.main_sheet_id, event.sheet_name, event.title]);

  const toggleIndex = (idx: number) => {
    setOpenIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const expandAll = () => {
    setOpenIndices(syllabus.map((_, i) => i));
  };

  const collapseAll = () => {
    setOpenIndices([]);
  };

  const titleTheme = categoryThemes[event.category] || categoryThemes[3];
  const ringTheme = categoryRingThemes[event.category] || categoryRingThemes[3];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12 min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`mb-8 text-sm font-bold tracking-widest uppercase flex flex-wrap justify-center md:justify-start items-center gap-2 ${titleTheme}`}
      >
        <Link 
          href="/scioly-resources" 
          className="hover:underline"
        >
          {parentTitle}
        </Link>
        <span className="opacity-60">&gt;</span>
        <span className="opacity-80">
          {event.title}
        </span>
      </motion.div>
      <div className="text-center mb-8 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight ${titleTheme}`}
        >
          {event.title}
        </motion.h1>
      </div>

      {isLoading ? (
        <div className="space-y-4 w-full">
          {[1, 2, 3].map((i) => (
             <div key={i} className="animate-pulse bg-neutral-200 dark:bg-neutral-800 h-[88px] w-full rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 text-center shadow-inner w-full"
        >
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{error}</h2>
        </motion.div>
      ) : (
        <section className="w-full space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-end space-x-3 px-2 mb-6">
              <button 
                onClick={expandAll} 
                className="px-5 py-2.5 rounded-full font-bold transition-all duration-300 cursor-pointer focus:outline-none bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {config?.labels?.expand_all || 'Expand All'}
              </button>
              <button 
                onClick={collapseAll} 
                className="px-5 py-2.5 rounded-full font-bold transition-all duration-300 cursor-pointer focus:outline-none bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {config?.labels?.collapse_all || 'Collapse All'}
              </button>
            </div>
            {syllabus.map((item, idx) => {
              const isOpen = openIndices.includes(idx);

              return (
                <div
                  key={idx}
                  className={`bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-200 ${ringTheme}`}
                >
                  <button
                    onClick={() => toggleIndex(idx)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer group"
                  >
                    <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white pr-4">
                      {item.week}
                    </span>
                    
                    <div 
                      className={`shrink-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                        isOpen 
                          ? `rotate-180 ${titleTheme}` 
                          : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                      }`}
                    >
                      <ChevronDownIcon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-neutral-600 dark:text-neutral-300 text-base md:text-lg leading-relaxed space-y-6">
                           
                           {item.agenda && (
                             <div>
                               <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-widest text-sm mb-2">{config?.syllabus_headers?.agenda || 'Agenda'}</h4>
                               <div dangerouslySetInnerHTML={{ __html: parseMarkdownWithColor(item.agenda, titleTheme) }} className="space-y-2" />
                             </div>
                           )}

                           {item.todayTasks && (
                             <div>
                               <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-widest text-sm mb-2">{config?.syllabus_headers?.today_tasks || "Today's Tasks"}</h4>
                               <div dangerouslySetInnerHTML={{ __html: parseMarkdownWithColor(item.todayTasks, titleTheme) }} className="space-y-2" />
                             </div>
                           )}

                           {item.homework && (
                             <div>
                               <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-widest text-sm mb-2">{config?.syllabus_headers?.homework || 'Homework Tasks'}</h4>
                               <div dangerouslySetInnerHTML={{ __html: parseMarkdownWithColor(item.homework, titleTheme) }} className="space-y-2" />
                             </div>
                           )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </section>
      )}
    </div>
  );
}
