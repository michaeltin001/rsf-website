import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { GeneratorParams, Slot } from "@/lib/tally/scheduler";
import { parseSheetToSchedule } from "@/lib/tally/importXlsx";
import SchedulePreview from "./SchedulePreview";
import type { ScheduleModalConfig } from "@/types/page";

interface SchedulePreviewFromSheetProps {
  isOpen: boolean;
  onClose: () => void;
  rawSheetData: { settings: any[]; teams: any[]; judging: any[]; rounds: any[] } | null;
  config: ScheduleModalConfig;
}

export default function SchedulePreviewFromSheet({
  isOpen,
  onClose,
  rawSheetData,
  config,
}: SchedulePreviewFromSheetProps) {
  const [params, setParams] = useState<GeneratorParams | null>(null);
  const [schedule, setSchedule] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"vertical" | "horizontal">("horizontal");
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      try {
        const parsed = parseSheetToSchedule(rawSheetData, config.defaults);
        if (parsed) {
          setParams(parsed.params);
          setSchedule(parsed.schedule);
          setError(null);
        } else {
          setError(config.messages?.no_data_found || "No data found to parse.");
        }
      } catch (err: any) {
        setError(err.message || config.messages?.failed_parse || "Failed to parse schedule data from Google Sheets.");
      }
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen, rawSheetData, config]);

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
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 text-success min-w-0 pr-4">
            <CalendarDaysIcon className="w-6 h-6 flex-shrink-0" />
            <h2 className="hidden sm:block text-xl font-bold text-neutral-900 dark:text-white leading-none truncate">
              {config.labels?.view_schedule_title || "View Schedule"}
            </h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {schedule && params && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() =>
                    setViewMode((prev) =>
                      prev === "horizontal" ? "vertical" : "horizontal",
                    )
                  }
                  className="text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm hover:border-accent dark:hover:border-accent transition-all cursor-pointer whitespace-nowrap"
                  title={config.buttons?.switch_view_title || "Switch View"}
                >
                  {config.buttons?.switch_view || "Switch View"}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col overflow-hidden flex-1">
          {/* Error Banner */}
          {error && (
            <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 flex-shrink-0 z-10 bg-white dark:bg-neutral-800">
              <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">
                    {config.messages?.error_loading || "Error loading schedule"}
                  </p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Output View */}
          {schedule && params && (
            <SchedulePreview
              ref={scheduleContainerRef}
              schedule={schedule}
              params={params}
              viewMode={viewMode}
              config={config}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
