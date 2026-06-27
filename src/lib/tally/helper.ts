import { GeneratorParams, Slot, parseTime } from './scheduler';

export function getRoundStartSlots(
    schedule: Slot[],
    numRounds: number,
    numFields: number
): Record<number, string> {
    const roundStartSlots: Record<number, string> = {};
    for (let r = 1; r <= numRounds; r++) {
        const roundName = r === 1 ? "Warm-Up Round" : `Round ${r - 1}`;
        for (let idx = 0; idx < schedule.length; idx++) {
            let found = false;
            for (let f = 1; f <= numFields; f++) {
                if (schedule[idx].fields[f]?.round === r) {
                    found = true;
                    break;
                }
            }
            if (found) {
                roundStartSlots[idx] = roundName;
                break;
            }
        }
    }
    return roundStartSlots;
}

export function getPreambleEvents(labels: any, params: GeneratorParams) {
    return [
        {
            label: labels.volunteers_arrive,
            time: params.volunteersArriveTime,
        },
        {
            label: labels.team_check_in,
            time: params.teamCheckInTime,
        },
        {
            label: labels.opening_ceremonies,
            time: params.openingCeremoniesTime,
        },
    ];
}

export function getParsedTeams(teamList: string) {
    return teamList
        .split("\n")
        .map((line, index) => {
            const parts = line.trim().split(",");
            if (parts.length === 2) {
                return {
                    id: parts[0].trim(),
                    name: parts[1].trim(),
                    teamId: index + 1,
                };
            }
            return null;
        })
        .filter(Boolean) as {
        id: string;
        name: string;
        teamId: number;
    }[];
}

export function getNextPreambleTime(events: { time: string }[], currentIndex: number, startTime: string) {
    let nextTime = startTime;
    for (let j = currentIndex + 1; j < events.length; j++) {
        if (events[j].time) {
            nextTime = events[j].time;
            break;
        }
    }
    return nextTime;
}

export function calculateBlocks(startTimeStr: string, endTimeStr: string, basePeriod: number) {
    return Math.max(0, Math.floor((parseTime(endTimeStr) - parseTime(startTimeStr)) / basePeriod));
}
