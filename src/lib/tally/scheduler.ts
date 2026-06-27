

export class SchedulerError extends Error {
    fields: string[];
    constructor(message: string, fields: string[]) {
        super(message);
        this.fields = fields;
        this.name = 'SchedulerError';
    }
}

export interface Team {
    id: string;
    name: string;
    teamId: number;
    pitNumber: number;
}

export interface ScheduleEvent {
    id: string;
    name: string;
    teamId: number;
    pitNumber: number;
    round?: number;
    code: string;
    title: string;
    isStart?: boolean;
    continued?: boolean;
}

export interface Slot {
    time: number;
    fields: Record<number, ScheduleEvent>;
    judging: Record<number, ScheduleEvent>;
}

export interface GeneratorParams {
    tournamentName: string;
    tournamentDate: string;
    basePeriod: number;
    judgingMultiplier: number;
    numFields: number;
    numJudging: number;
    numRounds: number;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    lunchOption?: 'none' | 'time' | 'after_round_1' | 'after_round_2';
    lunchDuration?: number; // minutes
    lunchStart: string; // HH:MM
    lunchEnd: string;   // HH:MM
    volunteersArriveTime: string;
    teamCheckInTime: string;
    openingCeremoniesTime: string;
    teamList: string;   // raw text
}

// Helper: Convert "HH:MM" to minutes from midnight
export function parseTime(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

// Helper: Convert minutes back to "HH:MM AM/PM"
export function formatTime(minutes: number): string {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    const mStr = m < 10 ? '0' + m : String(m);
    return `${h}:${mStr} ${ampm}`;
}

export function generateScheduleData(params: GeneratorParams): Slot[] {
    const {
        basePeriod,
        judgingMultiplier,
        numFields,
        numJudging,
        numRounds,
        startTime,
        endTime,
        lunchOption,
        lunchDuration,
        lunchStart,
        lunchEnd,
        teamList
    } = params;

    const startMins = parseTime(startTime);
    const endMins = parseTime(endTime);
    const lunchStartMins = parseTime(lunchStart);
    const lunchEndMins = parseTime(lunchEnd);

    const rawTeams = teamList.split('\n');
    let teams: Team[] = [];
    rawTeams.forEach((line, index) => {
        const parts = line.trim().split(',');
        if (parts.length === 2) {
            teams.push({ 
                id: parts[0].trim(), 
                name: parts[1].trim(),
                teamId: index + 1,
                pitNumber: index + 1
            });
        }
    });

    if (teams.length === 0) throw new SchedulerError("Team list is empty or incorrectly formatted.", ['teamList']);
    if (numRounds < 2) throw new SchedulerError("Number of rounds must be at least 2.", ['numRounds']);
    if (startMins >= endMins) throw new SchedulerError("Start time must be before end time.", ['startTime', 'endTime']);
    if ((lunchOption === 'time' || !lunchOption) && lunchStartMins >= lunchEndMins) throw new SchedulerError("Lunch start must be before lunch end.", ['lunchStart', 'lunchEnd']);

    // Build Time Slots Array
    let timeSlots: number[] = [];
    let t = startMins;
    let limitMins = (lunchOption === 'after_round_1' || lunchOption === 'after_round_2') ? endMins + 1440 : endMins;

    while (t < limitMins) {
        if (lunchOption === 'time' || !lunchOption) {
            if (t >= lunchStartMins && t < lunchEndMins) {
                t = lunchEndMins; 
                if (t >= limitMins) break;
            }
        }
        if (t + basePeriod > limitMins) break;
        
        timeSlots.push(t);
        t += basePeriod;
    }

    if (timeSlots.length === 0) throw new SchedulerError("No available time slots within bounds. Check your start time, end time, and base period.", ['startTime', 'endTime', 'basePeriod']);

    // Initialize States
    let isBusy: Record<string, Record<number, boolean>> = {}; 
    let fieldVisitCounts: Record<string, Record<number, number>> = {}; 
    let completedMatches: Record<string, number> = {}; 
    
    teams.forEach(team => {
        isBusy[team.id] = {};
        fieldVisitCounts[team.id] = {};
        for (let f = 1; f <= numFields; f++) fieldVisitCounts[team.id][f] = 0;
        completedMatches[team.id] = 0;
    });

    let schedule: Slot[] = timeSlots.map(timeMins => ({
        time: timeMins,
        fields: {},
        judging: {}
    }));

    let judgingSlotIdx = 0;
    let teamsAssignedToJudging = 0;
    let unassignedTeams = [...teams];

    while (teamsAssignedToJudging < teams.length && judgingSlotIdx < timeSlots.length) {
        if (judgingSlotIdx + judgingMultiplier > timeSlots.length) {
            throw new SchedulerError(`Not enough time before event end to finish judging for all teams. Reached capacity at team ${teamsAssignedToJudging+1}.`, ['numJudging', 'judgingMultiplier', 'startTime', 'endTime']);
        }

        let spansLunch = false;
        for (let p = 0; p < judgingMultiplier - 1; p++) {
            if (timeSlots[judgingSlotIdx + p + 1] - timeSlots[judgingSlotIdx + p] > basePeriod) {
                spansLunch = true;
                break;
            }
        }

        if (spansLunch) {
            judgingSlotIdx++;
            continue; 
        }

        for (let j = 1; j <= numJudging; j++) {
            if (unassignedTeams.length > 0) {
                let team = unassignedTeams.shift()!;
                
                for (let p = 0; p < judgingMultiplier; p++) {
                    isBusy[team.id][judgingSlotIdx + p] = true;
                    if (p === 0) {
                        schedule[judgingSlotIdx + p].judging[j] = { 
                            ...team, 
                            isStart: true,
                            code: 'Judging ' + j,
                            title: 'Judging Session'
                        };
                    } else {
                        schedule[judgingSlotIdx + p].judging[j] = { 
                            ...team, 
                            isStart: false, 
                            continued: true,
                            code: 'Judging ' + j,
                            title: 'Judging Session'
                        };
                    }
                }
                teamsAssignedToJudging++;
            }
        }
        
        judgingSlotIdx += judgingMultiplier;
    }

    if (teamsAssignedToJudging < teams.length) {
        throw new SchedulerError("Could not fit all judging sessions into the allotted time frame.", ['numJudging', 'judgingMultiplier', 'startTime', 'endTime']);
    }

    let currentSlotIdx = 0;
    let lunchJumpIdx = -1;

    for (let targetRound = 1; targetRound <= numRounds; targetRound++) {
        let teamsNeededForRound = [...teams];

        while (teamsNeededForRound.length > 0) {
            if (currentSlotIdx >= timeSlots.length) {
                throw new SchedulerError(`Schedule exceeded hours while trying to schedule Round ${targetRound}. Need more time or fields.`, ['numFields', 'basePeriod', 'numRounds', 'endTime']);
            }

            let availableFields: number[] = [];
            for (let f = 1; f <= numFields; f++) availableFields.push(f);

            let teamsToKeep: Team[] = [];

            for (let i = 0; i < teamsNeededForRound.length; i++) {
                let team = teamsNeededForRound[i];

                if (isBusy[team.id][currentSlotIdx]) {
                    teamsToKeep.push(team);
                    continue;
                }

                if (availableFields.length > 0) {
                    availableFields.sort((a, b) => fieldVisitCounts[team.id][a] - fieldVisitCounts[team.id][b]);
                    let selectedField = availableFields.shift()!;

                    let roundTitle = targetRound === 1 ? "Warm-Up Round" : "Round " + (targetRound - 1);
                    let matchCode = (targetRound === 1 ? "W" : "T") + selectedField;

                    schedule[currentSlotIdx].fields[selectedField] = { 
                        ...team, 
                        round: targetRound,
                        code: matchCode,
                        title: roundTitle
                    };
                    isBusy[team.id][currentSlotIdx] = true;
                    fieldVisitCounts[team.id][selectedField]++;
                    completedMatches[team.id]++;
                } else {
                    teamsToKeep.push(team);
                }
            }

            teamsNeededForRound = teamsToKeep;
            currentSlotIdx++; 
        }

        if ((lunchOption === 'after_round_1' && targetRound === 2) || 
            (lunchOption === 'after_round_2' && targetRound === 3)) {
            
            if (currentSlotIdx % judgingMultiplier !== 0) {
                currentSlotIdx = Math.ceil(currentSlotIdx / judgingMultiplier) * judgingMultiplier;
            }
            lunchJumpIdx = currentSlotIdx;
        }
    }

    while (schedule.length > 0) {
        let last = schedule[schedule.length - 1];
        let hasFields = Object.keys(last.fields).length > 0;
        let hasJudging = Object.keys(last.judging).length > 0;
        if (!hasFields && !hasJudging) {
            schedule.pop();
        } else {
            break;
        }
    }

    if (lunchJumpIdx !== -1) {
        let currentTime = startMins;
        for (let i = 0; i < schedule.length; i++) {
            if (i === lunchJumpIdx) {
                currentTime += (lunchDuration || 60);
            }
            schedule[i].time = currentTime;
            currentTime += basePeriod;
        }
    }

    if (schedule.length > 0) {
        let lastSlotTime = schedule[schedule.length - 1].time;
        if (lastSlotTime + basePeriod > endMins) {
            throw new SchedulerError(`Schedule exceeded tournament hours. Need more time or fields. The schedule would end at ${formatTime(lastSlotTime + basePeriod)}.`, ['numFields', 'basePeriod', 'numRounds', 'endTime']);
        }
    }

    return schedule;
}
