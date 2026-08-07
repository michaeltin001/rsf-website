import * as XLSX from 'xlsx';
import { GeneratorParams, Slot } from './scheduler';

export function exportToXLSX(params: GeneratorParams, schedule: Slot[]) {
    const wb = XLSX.utils.book_new();

    // 1. Settings Sheet
    const settingsData: string[][] = [
        ["Key", "Value"]
    ];

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            settingsData.push([key, value.toString()]);
        }
    });

    // Add backwards compatible keys for older Tally implementations
    settingsData.push(["TournamentName", params.tournamentName || "FLL Tournament"]);
    settingsData.push(["TournamentDelay", "0"]);
    settingsData.push(["TournamentOnDeckTime", "10"]);
    settingsData.push(["TournamentDate", params.tournamentDate || ""]);
    const wsSettings = XLSX.utils.aoa_to_sheet(settingsData);
    
    for (let i = 0; i < settingsData.length; i++) {
        let cellAddr = XLSX.utils.encode_cell({r: i, c: 1}); 
        if (wsSettings[cellAddr]) {
            wsSettings[cellAddr].t = 's';
            wsSettings[cellAddr].z = '@';
        }
    }
    
    XLSX.utils.book_append_sheet(wb, wsSettings, "Settings");

    // 2. Teams Sheet
    const rawTeams = params.teamList.split('\n');
    let exportTeams: any[] = [];
    rawTeams.forEach((line, index) => {
        const parts = line.trim().split(',');
        if (parts.length === 2) {
            exportTeams.push({ 
                TeamID: index + 1, 
                TeamName: parts[1].trim(),
                TeamNumber: parseInt(parts[0].trim().replace(/^#/, ''), 10) || parts[0].trim(),
                PitNumber: index + 1
            });
        }
    });
    const wsTeams = XLSX.utils.json_to_sheet(exportTeams);
    XLSX.utils.book_append_sheet(wb, wsTeams, "Teams");

    // 3. Judging & Rounds Sheets
    let judgingData: any[] = [];
    let roundsData: any[] = [];
    
    let judgingEventId = 1;
    let roundsEventId = 1;

    const getTimestamp = (dateStr: string, timeMins: number) => {
        const parts = (dateStr || new Date().toISOString().split('T')[0]).split('-');
        const y = parseInt(parts[0], 10);
        const mon = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const h = Math.floor(timeMins / 60);
        const m = timeMins % 60;
        
        const dt = new Date(y, mon, d, h, m, 0);
        const tzo = -dt.getTimezoneOffset();
        const dif = tzo >= 0 ? '+' : '-';
        const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, '0');
        
        const localISO = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString().split('.')[0];
        return localISO + dif + pad(tzo / 60) + ':' + pad(tzo % 60);
    };

    const tDate = params.tournamentDate;

    for (let i = 0; i < schedule.length; i++) {
        let slot = schedule[i];
        let time = slot.time;

        for (let j = 1; j <= params.numJudging; j++) {
            let team = slot.judging[j];
            if (team && team.isStart) {
                let blocks = 1;
                for (let k = i + 1; k < schedule.length; k++) {
                    let nextSlot = schedule[k];
                    if (nextSlot.judging[j] && !nextSlot.judging[j].isStart && nextSlot.judging[j].id === team.id) {
                        blocks++;
                    } else {
                        break;
                    }
                }
                judgingData.push({
                    EventID: judgingEventId++,
                    TeamID: team.teamId,
                    Code: team.code,
                    Title: team.title,
                    Start: getTimestamp(tDate, time),
                    End: getTimestamp(tDate, time + (blocks * params.basePeriod))
                });
            }
        }

        for (let f = 1; f <= params.numFields; f++) {
            let team = slot.fields[f];
            if (team) {
                roundsData.push({
                    EventID: roundsEventId++,
                    TeamID: team.teamId,
                    Code: team.code,
                    Title: team.title,
                    Start: getTimestamp(tDate, time),
                    End: getTimestamp(tDate, time + params.basePeriod)
                });
            }
        }
    }

    const wsJudging = XLSX.utils.json_to_sheet(judgingData);
    XLSX.utils.book_append_sheet(wb, wsJudging, "Judging");

    const wsRounds = XLSX.utils.json_to_sheet(roundsData);
    XLSX.utils.book_append_sheet(wb, wsRounds, "Rounds");

    const fileName = params.tournamentName || "Tournament_Schedule";
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}
