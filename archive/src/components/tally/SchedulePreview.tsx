import React, { forwardRef } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { GeneratorParams, Slot, formatTime, parseTime } from "@/lib/tally/scheduler";
import { getRoundStartSlots, getPreambleEvents, getParsedTeams, calculateBlocks } from "@/lib/tally/helper";

interface SchedulePreviewProps {
  schedule: Slot[] | null;
  params: GeneratorParams;
  viewMode: "vertical" | "horizontal";
  config: any;
}

const SchedulePreview = forwardRef<HTMLDivElement, SchedulePreviewProps>(
  ({ schedule, params, viewMode, config }, ref) => {
    if (!schedule) {
      return (
        <div className="w-full flex-1 min-h-0 bg-neutral-50 dark:bg-neutral-900 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 md:pb-6 pt-2 flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar pr-2 h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 text-center">
              <CalendarDaysIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">{config.messages.no_schedule_title}</p>
              <p className="text-sm mt-1 max-w-[250px]">{config.messages.no_schedule_subtitle}</p>
            </div>
          </div>
        </div>
      );
    }

    const roundStartSlots = getRoundStartSlots(schedule, params.numRounds, params.numFields);
    const preambleEvents = getPreambleEvents(config.labels, params);
    const parsedTeams = getParsedTeams(params.teamList);

    return (
      <div className="w-full flex-1 min-h-0 bg-neutral-50 dark:bg-neutral-900 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 md:pb-6 pt-2 flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar pr-2">
            <div
              ref={ref}
              className="w-max min-w-full bg-neutral-50 dark:bg-neutral-900 pb-4 pr-4 pt-2"
            >
              {viewMode === "horizontal" ? (
                <div className="pb-4">
                  <table className="w-full border-collapse min-w-max text-sm text-left">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-neutral-100 dark:bg-neutral-800 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#525252]">
                        <th className="p-3 sticky left-0 top-0 bg-neutral-100 dark:bg-neutral-800 z-30 border-r border-neutral-300 dark:border-neutral-600 shadow-[1px_0_0_0_#d1d5db] dark:shadow-[1px_0_0_0_#525252]">
                          {config.labels.team_table_header}
                        </th>
                        {preambleEvents.map((event, idx) => {
                          if (!event.time) return null;
                          let nextTime = params.startTime;
                          for (let j = idx + 1; j < preambleEvents.length; j++) {
                            if (preambleEvents[j].time) {
                              nextTime = preambleEvents[j].time;
                              break;
                            }
                          }
                          const numBlocks = calculateBlocks(event.time, nextTime, params.basePeriod);
                          return (
                            <React.Fragment key={`preamble-frag-${idx}`}>
                              <th
                                className="p-2 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-700 text-center text-neutral-500 min-w-[40px]"
                                title={event.label}
                              >
                                <div
                                  style={{
                                    writingMode: "vertical-rl",
                                    transform: "rotate(180deg)",
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-widest mx-auto whitespace-nowrap"
                                >
                                  {event.label}
                                </div>
                              </th>
                              {Array.from({ length: numBlocks }).map((_, bIdx) => (
                                <th
                                  key={`preamble-blank-th-${idx}-${bIdx}`}
                                  className="p-3 border-r border-neutral-200 dark:border-neutral-700 text-center min-w-[120px]"
                                >
                                  <div className="font-bold text-primary dark:text-primary-light">
                                    {formatTime(parseTime(event.time) + bIdx * params.basePeriod)}
                                  </div>
                                </th>
                              ))}
                            </React.Fragment>
                          );
                        })}
                        {schedule.map((slot, idx) => {
                          const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
                          const isRoundStart = roundStartSlots[idx];
                          const lunchBlocks = isLunchBreak
                            ? Math.max(0, Math.floor((slot.time - (schedule[idx - 1].time + params.basePeriod)) / params.basePeriod))
                            : 0;
                          return (
                            <React.Fragment key={`th-${idx}`}>
                              {isLunchBreak && (
                                <React.Fragment>
                                  <th
                                    className="p-2 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-700 text-center text-neutral-500 min-w-[40px]"
                                    title={config.labels.lunch_break}
                                  >
                                    <div
                                      style={{
                                        writingMode: "vertical-rl",
                                        transform: "rotate(180deg)",
                                      }}
                                      className="text-[10px] font-bold uppercase tracking-widest mx-auto whitespace-nowrap"
                                    >
                                      {config.labels.lunch_break}
                                    </div>
                                  </th>
                                  {Array.from({ length: lunchBlocks }).map((_, bIdx) => (
                                    <th
                                      key={`lunch-blank-th-${idx}-${bIdx}`}
                                      className="p-3 border-r border-neutral-200 dark:border-neutral-700 text-center min-w-[120px]"
                                    >
                                      <div className="font-bold text-primary dark:text-primary-light">
                                        {formatTime(schedule[idx - 1].time + params.basePeriod + bIdx * params.basePeriod)}
                                      </div>
                                    </th>
                                  ))}
                                </React.Fragment>
                              )}
                              {isRoundStart && (
                                <th
                                  className="p-2 border-r border-neutral-200 dark:border-neutral-700 bg-warning/20 text-center text-warning min-w-[40px]"
                                  title={isRoundStart}
                                >
                                  <div
                                    style={{
                                      writingMode: "vertical-rl",
                                      transform: "rotate(180deg)",
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-widest mx-auto whitespace-nowrap"
                                  >
                                    {isRoundStart}
                                  </div>
                                </th>
                              )}
                              <th className="p-3 border-r border-neutral-200 dark:border-neutral-700 text-center min-w-[120px]">
                                <div className="font-bold text-primary dark:text-primary-light">
                                  {formatTime(slot.time)}
                                </div>
                              </th>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTeams.map((team) => (
                        <tr
                          key={`row-team-${team.teamId}`}
                          className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        >
                          <td className="p-3 sticky left-0 bg-white dark:bg-neutral-900 z-10 border-r border-neutral-300 dark:border-neutral-600 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#404040]">
                            <div
                              style={{ "--team-hue": `var(--hue-${team.teamId % 64})` } as any}
                              className="team-bg rounded p-1.5 border border-neutral-200 dark:border-neutral-700 w-40"
                            >
                              <span className="font-semibold block truncate text-neutral-900 dark:text-neutral-100">
                                {team.name}
                              </span>
                              <span className="team-badge inline-block px-1.5 py-0.5 rounded text-[10px] mt-0.5">
                                {team.id}
                              </span>
                            </div>
                          </td>
                          {preambleEvents.map((event, idx) => {
                            if (!event.time) return null;
                            let nextTime = params.startTime;
                            for (let j = idx + 1; j < preambleEvents.length; j++) {
                              if (preambleEvents[j].time) {
                                nextTime = preambleEvents[j].time;
                                break;
                              }
                            }
                            const numBlocks = calculateBlocks(event.time, nextTime, params.basePeriod);
                            return (
                              <React.Fragment key={`preamble-td-frag-${team.teamId}-${idx}`}>
                                <td className="bg-neutral-200 dark:bg-neutral-700 border-r border-neutral-300 dark:border-neutral-600"></td>
                                {Array.from({ length: numBlocks }).map((_, bIdx) => (
                                  <td
                                    key={`preamble-blank-td-${team.teamId}-${idx}-${bIdx}`}
                                    className="bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-700"
                                  ></td>
                                ))}
                              </React.Fragment>
                            );
                          })}
                          {schedule.map((slot, idx) => {
                            const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
                            const lunchBlocks = isLunchBreak
                              ? Math.max(0, Math.floor((slot.time - (schedule[idx - 1].time + params.basePeriod)) / params.basePeriod))
                              : 0;

                            const isRoundStart = roundStartSlots[idx];

                            let scheduledEvent: any = null;
                            let eventType: "field" | "judging" | null = null;

                            for (let f = 1; f <= params.numFields; f++) {
                              if (slot.fields[f]?.teamId === team.teamId) {
                                scheduledEvent = slot.fields[f];
                                eventType = "field";
                                break;
                              }
                            }

                            if (!scheduledEvent) {
                              for (let j = 1; j <= params.numJudging; j++) {
                                if (slot.judging[j]?.teamId === team.teamId) {
                                  scheduledEvent = slot.judging[j];
                                  eventType = "judging";
                                  break;
                                }
                              }
                            }

                            return (
                              <React.Fragment key={`td-t-${team.teamId}-${idx}`}>
                                {isLunchBreak && (
                                  <React.Fragment>
                                    <td className="bg-neutral-200 dark:bg-neutral-700 border-r border-neutral-300 dark:border-neutral-600"></td>
                                    {Array.from({ length: lunchBlocks }).map((_, bIdx) => (
                                      <td
                                        key={`lunch-blank-td-${team.teamId}-${idx}-${bIdx}`}
                                        className="bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-700"
                                      ></td>
                                    ))}
                                  </React.Fragment>
                                )}
                                {isRoundStart && <td className="bg-warning/20 border-r border-warning/30"></td>}

                                <td
                                  className={`p-2 border-r border-neutral-200 dark:border-neutral-700 ${!scheduledEvent ? "bg-neutral-50 dark:bg-neutral-900/50" : ""}`}
                                >
                                  {scheduledEvent &&
                                    (eventType === "field" ? (
                                      <div
                                        className="bg-primary/10 border border-primary/20 rounded p-1.5 text-xs text-center font-bold text-primary dark:text-primary-light"
                                        title={scheduledEvent.title}
                                      >
                                        {scheduledEvent.code}
                                      </div>
                                    ) : scheduledEvent.isStart ? (
                                      <div
                                        className="bg-success/10 border border-success/20 rounded p-1.5 text-xs text-center font-bold text-success"
                                        title={scheduledEvent.title}
                                      >
                                        {scheduledEvent.code}
                                      </div>
                                    ) : (
                                      <div className="bg-success/5 border border-success/20 rounded p-1.5 text-xs text-center text-neutral-500 opacity-60 flex items-center justify-center h-full">
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                          ></path>
                                        </svg>{" "}
                                        {config.labels.session_cont_short}
                                      </div>
                                    ))}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Vertical View
                <div className="space-y-4">
                  {preambleEvents.map((event, idx, arr) => {
                    if (!event.time) return null;
                    let nextTime = params.startTime;
                    for (let j = idx + 1; j < arr.length; j++) {
                      if (arr[j].time) {
                        nextTime = arr[j].time;
                        break;
                      }
                    }
                    return (
                      <div
                        key={`preamble-list-${idx}`}
                        className="bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 text-center flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-medium my-4"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>{event.label}</span>
                        </div>
                        <div className="font-bold text-sm bg-neutral-300 dark:bg-neutral-600 px-3 py-1 rounded-full">
                          {formatTime(parseTime(event.time))} - {formatTime(parseTime(nextTime))}
                        </div>
                      </div>
                    );
                  })}
                  {schedule.map((slot, idx) => {
                    const hasItems = Object.keys(slot.fields).length > 0 || Object.keys(slot.judging).length > 0;
                    if (!hasItems) return null;

                    const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
                    const isRoundStart = roundStartSlots[idx];

                    return (
                      <React.Fragment key={idx}>
                        {isLunchBreak && (
                          <div className="bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 text-center flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-medium my-4">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span>{config.labels.lunch_break}</span>
                            </div>
                            <div className="font-bold text-sm bg-neutral-300 dark:bg-neutral-600 px-3 py-1 rounded-full">
                              {formatTime(schedule[idx - 1].time + params.basePeriod)} - {formatTime(slot.time)}
                            </div>
                          </div>
                        )}
                        {isRoundStart && (
                          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center flex items-center justify-center space-x-2 text-warning font-medium my-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{isRoundStart}</span>
                          </div>
                        )}
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 px-4 py-2 flex items-center gap-2">
                            <span className="font-bold text-primary dark:text-primary-light">{formatTime(slot.time)}</span>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{config.labels.matches}</h4>
                              <div className="space-y-2">
                                {Object.keys(slot.fields).length === 0 ? (
                                  <p className="text-sm text-neutral-400 italic">{config.messages.no_matches}</p>
                                ) : (
                                  Array.from({ length: params.numFields }).map((_, f) => {
                                    const team = slot.fields[f + 1];
                                    if (!team) return <div key={`f-${f}`} className="h-[34px] border border-transparent"></div>;
                                    return (
                                      <div
                                        key={`f-${f}`}
                                        style={{ "--team-hue": `var(--hue-${team.teamId % 64})` } as any}
                                        className="flex items-stretch h-[34px] text-xs border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden team-bg"
                                      >
                                        <div className="team-badge font-bold px-2 w-10 flex items-center justify-center flex-shrink-0 !rounded-none !border-0">
                                          {team.code}
                                        </div>
                                        <div className="px-2 flex-1 flex justify-between items-center">
                                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center" title={`Pit ${team.pitNumber} | ${team.title}`}>
                                            <span className="team-pill px-1 py-0.5 rounded mr-1.5 text-[10px]">{team.id}</span>
                                            {team.name}
                                          </span>
                                          <span className="text-[10px] text-neutral-500 px-1.5 py-0.5 ml-2 flex-shrink-0">{team.title}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{config.labels.judging}</h4>
                              <div className="space-y-2">
                                {Object.keys(slot.judging).length === 0 ? (
                                  <p className="text-sm text-neutral-400 italic">{config.messages.no_judging}</p>
                                ) : (
                                  Array.from({ length: params.numJudging }).map((_, j) => {
                                    const team = slot.judging[j + 1];
                                    if (!team) return <div key={`j-${j}`} className="h-[34px] border border-transparent"></div>;
                                    if (!team.isStart)
                                      return (
                                        <div key={`j-${j}`} className="flex items-center h-[34px] text-xs border border-transparent rounded bg-transparent overflow-hidden opacity-60 ml-8 border-l-2 border-l-success/50">
                                          <div className="px-2 flex-1 italic text-neutral-500 flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                            </svg>
                                            {config.labels.session_continued}
                                          </div>
                                        </div>
                                      );
                                    return (
                                      <div
                                        key={`j-${j}`}
                                        style={{ "--team-hue": `var(--hue-${team.teamId % 64})` } as any}
                                        className="flex items-stretch h-[34px] text-xs border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden team-bg"
                                      >
                                        <div className="team-badge font-bold px-2 w-20 flex items-center justify-center flex-shrink-0 truncate !rounded-none !border-0" title={team.title}>
                                          {team.code}
                                        </div>
                                        <div className="px-2 flex-1 flex items-center">
                                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center" title={`Pit ${team.pitNumber}`}>
                                            <span className="team-pill px-1 py-0.5 rounded mr-1.5 text-[10px]">{team.id}</span>
                                            {team.name}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SchedulePreview.displayName = "SchedulePreview";

export default SchedulePreview;
