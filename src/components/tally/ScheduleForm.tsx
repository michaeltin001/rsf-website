import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { GeneratorParams } from "@/lib/tally/scheduler";

interface ScheduleInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  errorFields: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function ScheduleInput({ label, name, type = "text", value, errorFields, onChange }: ScheduleInputProps) {
  const isError = errorFields.includes(name);
  const baseClass =
    "w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border rounded-xl shadow-sm text-sm text-neutral-900 dark:text-white dark:[color-scheme:dark] transition-all duration-200 outline-none";
  const inputClass = isError
    ? `${baseClass} border-error ring-2 ring-error/50 focus:border-error focus:ring-4 focus:ring-error/20`
    : `${baseClass} border-neutral-200 dark:border-neutral-700 hover:border-accent dark:hover:border-accent focus:border-accent focus:ring-4 focus:ring-accent/10`;

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
      />
    </div>
  );
}

interface ScheduleFormProps {
  params: GeneratorParams;
  setParams: React.Dispatch<React.SetStateAction<GeneratorParams>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  errorFields: string[];
  config: any;
  handleGenerate: () => void;
}

export default function ScheduleForm({
  params,
  setParams,
  handleChange,
  errorFields,
  config,
  handleGenerate,
}: ScheduleFormProps) {
  return (
    <div className="w-full flex-1 min-h-0 bg-white dark:bg-neutral-800 p-4 md:p-6 flex flex-col">
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScheduleInput
              label={config.labels.tournament_name}
              name="tournamentName"
              value={params.tournamentName}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.tournament_date}
              name="tournamentDate"
              type="date"
              value={params.tournamentDate}
              errorFields={errorFields}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScheduleInput
              label={config.labels.base_period}
              name="basePeriod"
              type="number"
              value={params.basePeriod}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.judging_multiplier}
              name="judgingMultiplier"
              type="number"
              value={params.judgingMultiplier}
              errorFields={errorFields}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ScheduleInput
              label={config.labels.num_fields}
              name="numFields"
              type="number"
              value={params.numFields}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.num_judging}
              name="numJudging"
              type="number"
              value={params.numJudging}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.num_rounds}
              name="numRounds"
              type="number"
              value={params.numRounds}
              errorFields={errorFields}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ScheduleInput
              label={config.labels.volunteers_arrive}
              name="volunteersArriveTime"
              type="time"
              value={params.volunteersArriveTime}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.team_check_in}
              name="teamCheckInTime"
              type="time"
              value={params.teamCheckInTime}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.opening_ceremonies}
              name="openingCeremoniesTime"
              type="time"
              value={params.openingCeremoniesTime}
              errorFields={errorFields}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScheduleInput
              label={config.labels.start_time}
              name="startTime"
              type="time"
              value={params.startTime}
              errorFields={errorFields}
              onChange={handleChange}
            />
            <ScheduleInput
              label={config.labels.end_time}
              name="endTime"
              type="time"
              value={params.endTime}
              errorFields={errorFields}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                {config.labels.lunch_option}
              </label>
              <Listbox
                value={params.lunchOption || "after_round_1"}
                onChange={(val) =>
                  setParams((prev) => ({ ...prev, lunchOption: val as any }))
                }
              >
                {({ open }) => (
                  <div className="relative">
                    <Listbox.Button
                      className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-neutral-800 border rounded-xl shadow-sm hover:border-accent dark:hover:border-accent focus:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 text-sm text-neutral-900 dark:text-white dark:[color-scheme:dark] transition-all duration-200 text-left ${
                        open ? "border-accent ring-4 ring-accent/10" : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <span className="block truncate">
                        {params.lunchOption === "none"
                          ? config.lunch_options.no_lunch
                          : params.lunchOption === "after_round_1"
                          ? config.lunch_options.after_round_1
                          : params.lunchOption === "after_round_2"
                          ? config.lunch_options.after_round_2
                          : config.lunch_options.specific_time}
                      </span>
                      <ChevronDownIcon
                        className="w-4 h-4 ml-2 text-neutral-500"
                        aria-hidden="true"
                      />
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-50 mt-2 w-full rounded-xl bg-white dark:bg-neutral-800 shadow-xl ring-1 ring-black ring-opacity-5 border border-neutral-200 dark:border-neutral-700 focus:outline-none overflow-hidden">
                        <div className="p-1">
                          {[
                            {
                              id: "none",
                              name: config.lunch_options.no_lunch,
                            },
                            {
                              id: "time",
                              name: config.lunch_options.specific_time,
                            },
                            {
                              id: "after_round_1",
                              name: config.lunch_options.after_round_1,
                            },
                            {
                              id: "after_round_2",
                              name: config.lunch_options.after_round_2,
                            },
                          ].map((option) => (
                            <Listbox.Option
                              key={option.id}
                              className={({ active }) =>
                                `${
                                  active
                                    ? "bg-accent text-white"
                                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer transition-colors mt-0.5 first:mt-0`
                              }
                              value={option.id}
                            >
                              {({ selected, active }) => (
                                <span className="block truncate flex items-center justify-between w-full">
                                  {option.name}
                                  {selected && (
                                    <span
                                      className={active ? "text-white" : "text-accent"}
                                    >
                                      ✓
                                    </span>
                                  )}
                                </span>
                              )}
                            </Listbox.Option>
                          ))}
                        </div>
                      </Listbox.Options>
                    </Transition>
                  </div>
                )}
              </Listbox>
            </div>
            {params.lunchOption === "time" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ScheduleInput
                  label={config.labels.lunch_start}
                  name="lunchStart"
                  type="time"
                  value={params.lunchStart}
                  errorFields={errorFields}
                  onChange={handleChange}
                />
                <ScheduleInput
                  label={config.labels.lunch_end}
                  name="lunchEnd"
                  type="time"
                  value={params.lunchEnd}
                  errorFields={errorFields}
                  onChange={handleChange}
                />
              </div>
            )}
            {(!params.lunchOption ||
              params.lunchOption === "after_round_1" ||
              params.lunchOption === "after_round_2") && (
              <ScheduleInput
                label={config.labels.lunch_duration}
                name="lunchDuration"
                type="number"
                value={params.lunchDuration || 0}
                errorFields={errorFields}
                onChange={handleChange}
              />
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              {config.labels.team_list}
            </label>
            <textarea
              name="teamList"
              value={params.teamList}
              onChange={handleChange}
              spellCheck="false"
              className={`flex-1 w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono whitespace-pre resize-none ${
                errorFields.includes("teamList")
                  ? "border-error focus:border-error focus:ring-error ring-2 ring-error/50"
                  : "border-neutral-300 dark:border-neutral-600 focus:ring-primary focus:border-primary"
              }`}
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-success hover:bg-success/90 text-white font-bold rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 dark:focus:ring-offset-neutral-800 cursor-pointer flex items-center justify-center gap-2"
          >
            {config.buttons.generate}
          </button>
        </div>
      </div>
    </div>
  );
}
