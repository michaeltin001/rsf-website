'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, FunnelIcon, InformationCircleIcon, MapPinIcon, ClockIcon, ArrowPathIcon, DocumentPlusIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { TallyPageConfig } from '@/types/page';

import SettingsModal from './SettingsModal';
import ScheduleModal from './ScheduleModal';
import SchedulePreviewFromSheet from './SchedulePreviewFromSheet';

interface TallyProps {
  config: TallyPageConfig;
}

interface EventData {
  uniqueId: string;
  teamId: number;
  team: string;
  teamNumber: string;
  pit: string;
  code: string;
  title: string;
  start: string | null;
  end: string | null;
}

export default function Tally({ config }: TallyProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Dynamic State for Google Sheets Data
  const [scheduleData, setScheduleData] = useState<EventData[]>([]);
  const [tournamentName, setTournamentName] = useState(config.title || 'Tally');
  const [tournamentDelay, setTournamentDelay] = useState(0);
  const [tournamentOnDeckTime, setTournamentOnDeckTime] = useState(10);
  const [tournamentDate, setTournamentDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSchedulePreviewFromSheetOpen, setIsSchedulePreviewFromSheetOpen] = useState(false);

  const [sheetId, setSheetId] = useState('');
  const [filter, setFilter] = useState<string[]>(['All']);
  const [rawSheetData, setRawSheetData] = useState<{ settings: any[], teams: any[], judging: any[], rounds: any[] } | null>(null);



  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const savedSheetId = localStorage.getItem('app-sheet-id');
    if (savedSheetId) setSheetId(savedSheetId);

    const savedFilter = localStorage.getItem('app-team-filter');
    if (savedFilter) {
      try {
        setFilter(JSON.parse(savedFilter));
      } catch (e) { }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Google Sheets Data whenever sheetId changes
  useEffect(() => {
    if (!mounted) return;

    if (!sheetId) {
      localStorage.setItem('app-sheet-id', '');
      setScheduleData([]);
      setTournamentName(config.title || 'Tally');
      setTournamentDelay(0);
      setTournamentOnDeckTime(10);
      setTournamentDate('');
      setIsLoading(false);
      setRawSheetData(null);
      return;
    }

    const fetchSpreadsheetData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchSheet = async (sheetName: string) => {
          const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1&sheet=${sheetName}`;
          try {
            const res = await fetch(url);
            const text = await res.text();
            const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
            
            if (match && match[1]) {
              const json = JSON.parse(match[1]);
              
              if (json.status === 'error') {
                console.error(`Google Sheets API returned an error for sheet "${sheetName}":`, json.errors);
                throw new Error(json.errors?.[0]?.message || 'Google Sheets API error');
              }
              
              if (!json.table || !json.table.cols) {
                console.warn(`Warning: Unexpected data format received for sheet "${sheetName}".`);
                return [];
              }

              const headers = json.table.cols.map((c: any) => c.label);
              return json.table.rows.map((r: any) => {
                return headers.reduce((obj: any, header: string, i: number) => {
                  obj[header] = r.c[i] ? r.c[i].v : null;
                  return obj;
                }, {});
              });
            }
            
            console.warn(`Warning: Could not parse response for sheet "${sheetName}". It may be empty, deleted, or not publicly accessible.`);
            return [];
          } catch (err) {
            console.error(`Failed to fetch or parse sheet "${sheetName}":`, err);
            throw err;
          }
        };

        const [settingsRaw, teamsRaw, judgingRaw, roundsRaw] = await Promise.all([
          fetchSheet('Settings'),
          fetchSheet('Teams'),
          fetchSheet('Judging'),
          fetchSheet('Rounds')
        ]);

        setRawSheetData({ settings: settingsRaw, teams: teamsRaw, judging: judgingRaw, rounds: roundsRaw });

        const nameSetting = settingsRaw.find((s: any) => s.Key === 'TournamentName');
        if (nameSetting) setTournamentName(nameSetting.Value);

        const delaySetting = settingsRaw.find((s: any) => s.Key === 'TournamentDelay');
        const delayVal = delaySetting ? parseInt(delaySetting.Value, 10) || 0 : 0;
        setTournamentDelay(delayVal);

        const onDeckSetting = settingsRaw.find((s: any) => s.Key === 'TournamentOnDeckTime');
        const onDeckVal = onDeckSetting ? parseInt(onDeckSetting.Value, 10) || 10 : 10;
        setTournamentOnDeckTime(onDeckVal);

        const dateSetting = settingsRaw.find((s: any) => s.Key === 'TournamentDate');
        if (dateSetting && dateSetting.Value) {
          const match = dateSetting.Value.match(/Date\((\d+),(\d+),(\d+)\)/);
          let d: Date;
          if (match) {
            d = new Date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
          } else {
            d = new Date(`${dateSetting.Value}T00:00:00`);
          }

          if (!isNaN(d.getTime())) {
            const formattedDate = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
            setTournamentDate(formattedDate);
          }
        }

        const teamsMap: Record<string, any> = {};
        teamsRaw.forEach((t: any) => {
          if (t.TeamID) {
            teamsMap[t.TeamID.toString()] = {
              teamName: t.TeamName,
              teamNumber: t.TeamNumber,
              pitNumber: t.PitNumber
            };
          }
        });

        const processedJudging = judgingRaw.map((e: any) => ({ ...e, uniqueId: `J-${e.EventID}` }));
        const processedRounds = roundsRaw.map((e: any) => ({ ...e, uniqueId: `R-${e.EventID}` }));

        const applyDelay = (dateString: string | null, delayMinutes: number) => {
          if (!dateString) return null;
          let d = new Date(dateString);
          const match = dateString.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
          if (match) {
            d = new Date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5]), parseInt(match[6]));
          }
          d.setMinutes(d.getMinutes() + delayMinutes);
          return d.toISOString();
        };

        const mergedEvents: EventData[] = [...processedJudging, ...processedRounds].map(event => {
          const teamInfo = teamsMap[event.TeamID?.toString()] || { teamName: config.messages.unknown_team, teamNumber: '000', pitNumber: '0' };
          return {
            uniqueId: event.uniqueId,
            teamId: parseInt(event.TeamID, 10) || 0,
            team: teamInfo.teamName,
            teamNumber: teamInfo.teamNumber,
            pit: teamInfo.pitNumber,
            code: event.Code,
            title: event.Title,
            start: applyDelay(event.Start, delayVal),
            end: applyDelay(event.End, delayVal)
          };
        });

        setScheduleData(mergedEvents);
        
        if (settingsRaw.length === 0 && teamsRaw.length === 0) {
          throw new Error(config.messages.fetch_no_data);
        }
        
        localStorage.setItem('app-sheet-id', sheetId);
        console.log(`Successfully fetched and parsed data from Google Sheet ID: ${sheetId}`);
        console.log(`Loaded ${teamsRaw.length} teams, ${processedJudging.length} judging events, and ${processedRounds.length} match rounds.`);
        
        setIsLoading(false);
        setIsSettingsModalOpen(false);
      } catch (err: any) {
        console.error(config.messages.fetch_network_error, err);
        setError(err.message || config.messages.fetch_fallback_error);
        setIsLoading(false);
      }
    };

    fetchSpreadsheetData();
  }, [sheetId]);

  // Save the team filter to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('app-team-filter', JSON.stringify(filter));
  }, [filter, mounted]);

  // Handle ESC key to close any open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsModalOpen(false);
        setIsScheduleModalOpen(false);
        setIsSchedulePreviewFromSheetOpen(false);
        setSheetId(localStorage.getItem('app-sheet-id') || '');
        setError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const teamsList = ['All', ...Array.from(new Set(scheduleData.map(event => event.team)))];

  const displayedEvents = scheduleData
    .filter(event => filter.includes('All') || filter.includes(event.team))
    .sort((a, b) => {
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

  const uniquePits = Array.from(new Map(
    displayedEvents.map(event => [
      event.teamId,
      { team: event.team, pit: event.pit, teamNumber: event.teamNumber, teamId: event.teamId }
    ])
  ).values());

  const isActive = (start: string | null, end: string | null) => {
    if (!start || !end || !currentTime) return false;
    const startTime = new Date(start);
    const endTime = new Date(end);
    return currentTime >= startTime && currentTime <= endTime;
  };

  const isOnDeck = (start: string | null, uniqueId: string) => {
    if (!start || !uniqueId.startsWith('R-') || !currentTime) return false;
    const startTime = new Date(start);
    const diffMinutes = (startTime.getTime() - currentTime.getTime()) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= tournamentOnDeckTime;
  };

  const activeEvents = displayedEvents.filter(event => isActive(event.start, event.end));
  const onDeckEvents = displayedEvents.filter(event => isOnDeck(event.start, event.uniqueId));

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)} ${formatTime(isoString)}`;
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12 min-h-[80vh]">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-16 space-y-4"
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary tracking-tight">
          {tournamentName}
        </h1>
        {config.description && (
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300">
            {config.description}
          </p>
        )}
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md"
      >
        <div className="flex flex-col items-center md:items-start text-sm md:text-base">
          <div className="text-neutral-600 dark:text-neutral-400">
            {config.labels.current_time} <span className="font-semibold text-neutral-900 dark:text-white">{currentTime ? formatDateTime(currentTime.toISOString()) : '...'}</span>
          </div>
          {tournamentDate && (
            <div className="text-neutral-600 dark:text-neutral-400 mt-1">
              {config.labels.date} <span className="font-semibold">{tournamentDate}</span>
            </div>
          )}
          {tournamentDelay > 0 && (
            <div className="text-warning font-semibold mt-1 flex items-center">
              <InformationCircleIcon className="w-4 h-4 inline-block mr-1" />
              {config.labels.delay} {tournamentDelay} {config.labels.minutes}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">

          {sheetId && (
            <button
              onClick={() => setIsSchedulePreviewFromSheetOpen(true)}
              disabled={!rawSheetData || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm hover:border-accent dark:hover:border-accent text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 dark:disabled:hover:border-neutral-700"
            >
              <CalendarDaysIcon className="w-5 h-5 text-accent" />
              <span className="hidden sm:inline font-medium text-sm">{config.labels.button_view_schedule}</span>
            </button>
          )}

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm hover:border-accent dark:hover:border-accent text-neutral-700 dark:text-neutral-200 transition-all cursor-pointer"
          >
            <Cog6ToothIcon className="w-5 h-5 text-accent" />
            <span className="hidden sm:inline font-medium text-sm">{config.labels.button_settings}</span>
          </button>

        </div>
      </motion.div>

      {/* Main Content Area */}
      {!sheetId ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 text-center shadow-inner"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{config.empty_state.title}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-4">
            {config.empty_state.subtitle}
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {config.empty_state.organizing_prefix}<button onClick={() => setIsScheduleModalOpen(true)} className="text-success hover:underline font-semibold focus:outline-none cursor-pointer">{config.empty_state.generator_link}</button>{config.empty_state.organizing_suffix}
          </p>
        </motion.div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-neutral-600 dark:text-neutral-400 animate-pulse tracking-wider">{config.labels.syncing}</p>
        </div>
      ) : (
        <div className="space-y-12">

          {/* Happening Now */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4 flex items-center gap-2">
              {config.sections.happening_now.title}
            </h2>

            {activeEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeEvents.map((event) => (
                  <div key={`active-${event.uniqueId}`} className="relative p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-md hover:shadow-xl transition-all overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{event.title}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium mt-2 flex items-center flex-wrap gap-2">
                          <span style={{ '--team-hue': `var(--hue-${event.teamId % 64})` } as any} className="px-2.5 py-1 rounded-md border text-xs font-bold team-pill">{event.team}</span>
                          <span>(Team #{event.teamNumber})</span>
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-primary text-white shadow-sm">
                        {event.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 dark:text-primary-light">
                      <ClockIcon className="w-4 h-4" />
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-center">
                <p className="text-neutral-500 dark:text-neutral-400 italic">{config.sections.happening_now.empty_text}</p>
              </div>
            )}
          </motion.section>

          {/* On Deck */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-warning uppercase mb-4 flex items-center gap-2">
              {config.sections.on_deck.title}
            </h2>

            {onDeckEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {onDeckEvents.map((event) => (
                  <div key={`ondeck-${event.uniqueId}`} className="relative p-6 rounded-2xl bg-warning/5 dark:bg-warning/10 border border-warning/20 shadow-md hover:shadow-xl transition-all overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-warning"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-warning transition-colors">{event.title}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium mt-2 flex items-center flex-wrap gap-2">
                          <span style={{ '--team-hue': `var(--hue-${event.teamId % 64})` } as any} className="px-2.5 py-1 rounded-md border text-xs font-bold team-pill">{event.team}</span>
                          <span>({config.labels.team_prefix} #{event.teamNumber})</span>
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-warning text-white shadow-sm">
                        {event.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-warning/80 dark:text-warning">
                      <ClockIcon className="w-4 h-4" />
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-center">
                <p className="text-neutral-500 dark:text-neutral-400 italic">{config.sections.on_deck.empty_text}</p>
              </div>
            )}
          </motion.section>

          {/* Full Schedule List */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-accent uppercase mb-4">
              {config.sections.schedule.title}
            </h2>
            <div className="space-y-4">
              {displayedEvents.map((event) => (
                <div
                  key={event.uniqueId}
                  style={{ '--team-hue': `var(--hue-${event.teamId % 64})` } as any}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-xl hover:border-accent dark:hover:border-accent hover:ring-2 hover:ring-accent dark:hover:ring-accent transition-all team-bg group gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md border text-xs font-bold team-pill">{event.team}</span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">#{event.teamNumber}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide team-badge shadow-sm">
                      {event.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      <ClockIcon className="w-4 h-4 opacity-70" />
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                  </div>
                </div>
              ))}

              {displayedEvents.length === 0 && (
                <div className="p-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center">
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">{config.sections.schedule.empty_text}</p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => {
              setIsSettingsModalOpen(false);
              setSheetId(localStorage.getItem('app-sheet-id') || '');
              setError(null);
            }}
            sheetId={sheetId}
            setSheetId={setSheetId}
            teams={teamsList}
            filter={filter}
            setFilter={setFilter}
            pitInfo={uniquePits}
            config={config.settings_modal}
            sheetFetchError={error}
            clearError={() => setError(null)}
          />
        )}
        {isScheduleModalOpen && (
          <ScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            config={config.schedule_modal}
          />
        )}
        {isSchedulePreviewFromSheetOpen && (
          <SchedulePreviewFromSheet
            isOpen={isSchedulePreviewFromSheetOpen}
            onClose={() => setIsSchedulePreviewFromSheetOpen(false)}
            rawSheetData={rawSheetData}
            config={config.schedule_modal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
