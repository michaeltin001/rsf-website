import React, { useState, useEffect, useRef, Fragment } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import {
  generateScheduleData,
  GeneratorParams,
  Slot,
  formatTime,
  parseTime,
  SchedulerError,
} from "@/lib/tally/scheduler";
import { exportToXLSX } from "@/lib/tally/exportXlsx";
import { exportToPDF } from "@/lib/tally/exportPdf";
import { Menu, Transition } from "@headlessui/react";
import ScheduleForm from "./ScheduleForm";
import SchedulePreview from "./SchedulePreview";
import type { ScheduleModalConfig } from "@/types/page";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScheduleModalConfig;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  config,
}: ScheduleModalProps) {
  const [params, setParams] = useState<GeneratorParams>({
    tournamentName: config.defaults.tournament_name,
    tournamentDate: new Date().toISOString().split("T")[0],
    basePeriod: config.defaults.base_period,
    judgingMultiplier: config.defaults.judging_multiplier,
    numFields: config.defaults.num_fields,
    numJudging: config.defaults.num_judging,
    numRounds: config.defaults.num_rounds,
    startTime: config.defaults.start_time,
    endTime: config.defaults.end_time,
    lunchOption: config.defaults.lunch_option,
    lunchDuration: config.defaults.lunch_duration,
    lunchStart: config.defaults.lunch_start,
    lunchEnd: config.defaults.lunch_end,
    volunteersArriveTime: config.defaults.volunteers_arrive,
    teamCheckInTime: config.defaults.team_check_in,
    openingCeremoniesTime: config.defaults.opening_ceremonies,
    teamList: config.defaults.team_list,
  });

  const [schedule, setSchedule] = useState<Slot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"vertical" | "horizontal">(
    "horizontal",
  );
  const [activeView, setActiveView] = useState<"form" | "schedule">("form");
  const [isExporting, setIsExporting] = useState(false);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!schedule) return;
    setIsExporting(true);
    try {
      exportToPDF(params, schedule, config, viewMode);
    } catch (err: any) {
      setError(config.messages.export_failed_pdf + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  if (!isOpen) return null;



  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleGenerate = () => {
    setError(null);
    setErrorFields([]);
    try {
      const newSchedule = generateScheduleData(params);
      setSchedule(newSchedule);
      setActiveView("schedule");
    } catch (err: any) {
      setError(err.message || config.messages.generation_failed);
      if (err instanceof SchedulerError || err.name === "SchedulerError") {
        setErrorFields(err.fields || []);
      }
      setSchedule(null);
    }
  };

  const handleExport = () => {
    if (!schedule) return;
    try {
      exportToXLSX(params, schedule);
    } catch (err: any) {
      setError(err.message || config.messages.export_failed_xlsx);
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
          <div className="flex items-center gap-3 text-success min-w-0 pr-4">
            <DocumentPlusIcon className="w-6 h-6 flex-shrink-0" />
            <h2 className="hidden sm:block text-xl font-bold text-neutral-900 dark:text-white leading-none truncate">
              {config.title}
            </h2>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {activeView === "schedule" && schedule && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveView("form")}
                  className="text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm hover:border-accent dark:hover:border-accent transition-all cursor-pointer whitespace-nowrap"
                  title={config.buttons.go_back_title}
                >
                  {config.buttons.go_back}
                </button>
                <button
                  onClick={() =>
                    setViewMode((prev) =>
                      prev === "horizontal" ? "vertical" : "horizontal",
                    )
                  }
                  className="text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm hover:border-accent dark:hover:border-accent transition-all cursor-pointer whitespace-nowrap"
                  title={config.buttons.switch_view_title}
                >
                  {config.buttons.switch_view}
                </button>
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button
                    disabled={isExporting}
                    className="text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 px-2 sm:px-3 py-1.5 rounded-lg shadow-sm hover:border-accent dark:hover:border-accent transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isExporting ? config.buttons.exporting : config.buttons.export}
                    <ChevronDownIcon className="w-3 h-3 ml-0.5 stroke-[3]" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-neutral-800 shadow-xl ring-1 ring-black ring-opacity-5 border border-neutral-200 dark:border-neutral-700 focus:outline-none z-50 overflow-hidden">
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleExport}
                              className={`${
                                active
                                  ? "bg-accent text-white"
                                  : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors`}
                            >
                              {config.buttons.export_xlsx}
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleExportPDF}
                              className={`${
                                active
                                  ? "bg-accent text-white"
                                  : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              } group flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors mt-0.5`}
                            >
                              {config.buttons.export_pdf}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
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
                    {config.messages.generation_failed}
                  </p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form View */}
          {activeView === "form" && (
            <ScheduleForm
              params={params}
              setParams={setParams}
              handleChange={handleChange}
              errorFields={errorFields}
              config={config}
              handleGenerate={handleGenerate}
            />
          )}

          {/* Output View */}
          {activeView === "schedule" && (
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
