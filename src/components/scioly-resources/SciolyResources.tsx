'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { SciolyResourcesPageConfig } from '@/types/page';
import { parseMarkdown } from '@/lib/utils';

interface SciolyResourcesProps {
  config: SciolyResourcesPageConfig;
}

const categoryThemes: Record<number, { text: string, hoverText: string, bgLight: string, hoverBgLight: string }> = {
  1: {
    text: "text-red-500 dark:text-red-400",
    hoverText: "group-hover:text-red-600 dark:group-hover:text-red-300",
    bgLight: "bg-red-500/10 dark:bg-red-400/10",
    hoverBgLight: "group-hover:bg-red-500/20 dark:group-hover:bg-red-400/20",
  },
  2: {
    text: "text-green-500 dark:text-green-400",
    hoverText: "group-hover:text-green-600 dark:group-hover:text-green-300",
    bgLight: "bg-green-500/10 dark:bg-green-400/10",
    hoverBgLight: "group-hover:bg-green-500/20 dark:group-hover:bg-green-400/20",
  },
  3: {
    text: "text-blue-500 dark:text-blue-400",
    hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-300",
    bgLight: "bg-blue-500/10 dark:bg-blue-400/10",
    hoverBgLight: "group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20",
  },
  4: {
    text: "text-yellow-500 dark:text-yellow-400",
    hoverText: "group-hover:text-yellow-600 dark:group-hover:text-yellow-300",
    bgLight: "bg-yellow-500/10 dark:bg-yellow-400/10",
    hoverBgLight: "group-hover:bg-yellow-500/20 dark:group-hover:bg-yellow-400/20",
  }
};

export default function SciolyResources({ config }: SciolyResourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridMinHeight, setGridMinHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const calculateHeight = () => {
      if (gridRef.current && debouncedSearchQuery === '' && selectedCategory === null) {
        const oldMin = gridRef.current.style.minHeight;
        gridRef.current.style.minHeight = '0px';
        const height = gridRef.current.offsetHeight;
        gridRef.current.style.minHeight = oldMin;
        setGridMinHeight(height);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [debouncedSearchQuery, selectedCategory]);

  const filteredEvents = useMemo(() => {
    if (!config.events) return [];
    const query = debouncedSearchQuery.toLowerCase();
    return config.events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === null || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [config.events, debouncedSearchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12">

      {/* Header Section */}
      <div className="text-center mb-16 md:mb-24 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary tracking-tight"
        >
          {config.title}
        </motion.h1>

        {config.paragraphs && (
          <div className="mt-8 space-y-4">
            {config.paragraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(paragraph) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 max-w-5xl mx-auto"
      >
        <div className="relative w-full lg:w-1/2">
          <input
            type="text"
            placeholder={config.labels?.search_placeholder || "Search events..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full px-6 py-3.5 text-lg focus:outline-none focus:ring-2 focus:ring-accent shadow-sm transition-all"
          />
          {searchQuery.length > 0 ? (
            <XMarkIcon 
              className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" 
              onClick={() => setSearchQuery('')}
            />
          ) : (
            <MagnifyingGlassIcon className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-400 pointer-events-none" />
          )}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full font-bold transition-all duration-300 cursor-pointer focus:outline-none ${
              selectedCategory === null 
                ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-md scale-105'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {config.labels?.filter_all || 'All'}
          </button>
          {(config.categories || [
            { id: 1, label: 'Life' },
            { id: 2, label: 'Earth' },
            { id: 3, label: 'Physical' },
            { id: 4, label: 'Inquiry' },
          ]).map((cat) => {
            const colorClass = {
              1: 'text-red-700 bg-red-100 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
              2: 'text-green-700 bg-green-100 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
              3: 'text-blue-700 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
              4: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30'
            }[cat.id as 1 | 2 | 3 | 4] || 'text-neutral-700 bg-neutral-100 dark:bg-neutral-500/20 dark:text-neutral-400 border-neutral-200 dark:border-neutral-500/30';
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`px-5 py-2.5 rounded-full font-bold border transition-all duration-300 cursor-pointer focus:outline-none ${
                  selectedCategory === cat.id 
                    ? `${colorClass} shadow-md scale-105`
                    : 'bg-neutral-100 text-neutral-600 border-transparent dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Event Grid */}
      <div ref={gridRef} style={{ minHeight: gridMinHeight ? `${gridMinHeight}px` : 'auto' }} className="w-full">
        {filteredEvents.length > 0 ? (
          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 md:mt-20"
        >
          {filteredEvents.map((event) => {
            const theme = categoryThemes[event.category] || categoryThemes[3];
            return (
              <div
                key={event.title}
                className="h-full"
              >
                <Link href={event.link} className="block h-full">
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-800 h-full flex items-center justify-center text-center group">
                    <h4 className={`text-2xl font-extrabold ${theme.text} tracking-tight ${theme.hoverText} transition-colors duration-300`}>
                      {event.title}
                    </h4>
                  </div>
                </Link>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-20"
        >
          <p className="text-2xl text-neutral-500 dark:text-neutral-400 font-semibold">{config.messages?.no_events || "No events found matching your search."}</p>
        </motion.div>
      )}
      </div>

    </div>
  );
}
