import { GeneratorParams, Slot, ScheduleEvent, parseTime } from "./scheduler";

export function parseSheetToSchedule(
  rawSheetData: { settings: any[]; teams: any[]; judging: any[]; rounds: any[] } | null,
  defaultConfig: any
): { params: GeneratorParams; schedule: Slot[] } | null {
  if (!rawSheetData) return null;

  const { settings, teams, rounds, judging } = rawSheetData;

  // 1. Reconstruct GeneratorParams
  const params: GeneratorParams = {
    tournamentName: defaultConfig.tournament_name,
    tournamentDate: new Date().toISOString().split("T")[0],
    basePeriod: defaultConfig.base_period,
    judgingMultiplier: defaultConfig.judging_multiplier,
    numFields: defaultConfig.num_fields,
    numJudging: defaultConfig.num_judging,
    numRounds: defaultConfig.num_rounds,
    startTime: defaultConfig.start_time,
    endTime: defaultConfig.end_time,
    lunchOption: defaultConfig.lunch_option,
    lunchDuration: defaultConfig.lunch_duration,
    lunchStart: defaultConfig.lunch_start,
    lunchEnd: defaultConfig.lunch_end,
    volunteersArriveTime: defaultConfig.volunteers_arrive,
    teamCheckInTime: defaultConfig.team_check_in,
    openingCeremoniesTime: defaultConfig.opening_ceremonies,
    teamList: defaultConfig.team_list,
  };

  settings.forEach((row: any) => {
    const key = row.Key;
    const value = row.Value;
    
    if (key in params) {
      const paramType = typeof (params as any)[key];
      if (paramType === "number") {
        (params as any)[key] = parseInt(value, 10);
      } else if (value === "undefined" || value === "null") {
        (params as any)[key] = undefined;
      } else {
        (params as any)[key] = value;
      }
    }
  });

  // Reconstruct teamList from Teams tab if missing from Settings (legacy support)
  if (!settings.some((r: any) => r.Key === 'teamList') && teams && teams.length > 0) {
    params.teamList = teams.map((t: any) => {
      const num = t.TeamNumber ? t.TeamNumber : t.TeamID;
      return `${num}, ${t.TeamName}`;
    }).join('\n');
  }

  const teamInfoMap = new Map<number, { name: string; pitNumber: number; teamNumber: string }>();
  if (teams && Array.isArray(teams)) {
    teams.forEach((t: any) => {
      const id = parseInt(t.TeamID, 10);
      if (!isNaN(id)) {
        let rawNum = t.TeamNumber?.toString() || t.TeamID?.toString() || "";
        if (rawNum && !rawNum.startsWith('#')) {
          rawNum = '#' + rawNum;
        }
        teamInfoMap.set(id, {
          name: t.TeamName || "",
          pitNumber: parseInt(t.PitNumber, 10) || id,
          teamNumber: rawNum
        });
      }
    });
  }

  // 2. Helper to convert ISO to minutes from midnight
  const getMinutesFromTimestamp = (isoString: string) => {
    const match = isoString.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (match) {
        return parseInt(match[4]) * 60 + parseInt(match[5]);
    }
    const d = new Date(isoString);
    return d.getHours() * 60 + d.getMinutes();
  };

  // 3. Reconstruct Slots
  const timeMap = new Map<number, Slot>();

  const ensureSlot = (t: number) => {
    if (!timeMap.has(t)) timeMap.set(t, { time: t, fields: {}, judging: {} });
    return timeMap.get(t)!;
  };

  const extractFieldNum = (code: string) => {
    const match = code.match(/([0-9]+)$/);
    return match ? parseInt(match[1], 10) : 1;
  };

  rounds.forEach((row: any) => {
    if (!row.Start) return;
    const startMins = getMinutesFromTimestamp(row.Start);
    const slot = ensureSlot(startMins);
    const fieldNum = extractFieldNum(row.Code);

    const teamId = parseInt(row.TeamID, 10);
    const info = teamInfoMap.get(teamId) || { name: "", pitNumber: teamId, teamNumber: teamId.toString() };

    slot.fields[fieldNum] = {
      id: info.teamNumber,
      name: info.name,
      teamId: teamId,
      pitNumber: info.pitNumber,
      code: row.Code,
      title: row.Title,
      round: parseInt(row.Title.replace(/\D/g, "")) + 1 || 1, // Hack to get round number, Warm-Up = 1, Round 1 = 2
    };
  });

  judging.forEach((row: any) => {
    if (!row.Start || !row.End) return;
    const startMins = getMinutesFromTimestamp(row.Start);
    const endMins = getMinutesFromTimestamp(row.End);
    const judgingNum = extractFieldNum(row.Code);

    const slot = ensureSlot(startMins);
    const teamId = parseInt(row.TeamID, 10);
    const info = teamInfoMap.get(teamId) || { name: "", pitNumber: teamId, teamNumber: teamId.toString() };

    slot.judging[judgingNum] = {
      id: info.teamNumber,
      name: info.name,
      teamId: teamId,
      pitNumber: info.pitNumber,
      code: row.Code,
      title: row.Title,
      isStart: true,
    };

    let curr = startMins + params.basePeriod;
    while (curr < endMins) {
      const contSlot = ensureSlot(curr);
      const teamId = parseInt(row.TeamID, 10);
      const info = teamInfoMap.get(teamId) || { name: "", pitNumber: teamId, teamNumber: teamId.toString() };

      contSlot.judging[judgingNum] = {
        id: info.teamNumber,
        name: info.name,
        teamId: teamId,
        pitNumber: info.pitNumber,
        code: row.Code,
        title: row.Title,
        isStart: false,
        continued: true,
      };
      curr += params.basePeriod;
    }
  });

  const rawTimes = Array.from(timeMap.keys()).sort((a, b) => a - b);
  for (let i = 0; i < rawTimes.length - 1; i++) {
    const t1 = rawTimes[i];
    const t2 = rawTimes[i + 1];
    const gap = t2 - t1;

    if (gap > params.basePeriod) {
      let isLunch = false;
      
      if (params.lunchOption === 'time') {
        const le = parseTime(params.lunchEnd);
        if (t2 === le || (t1 < le && t2 >= le)) {
          isLunch = true;
        }
      } else if (params.lunchOption === 'after_round_1' || params.lunchOption === 'after_round_2') {
        if (gap >= (params.lunchDuration || 60) - params.basePeriod) {
           isLunch = true;
        }
      }

      if (!isLunch) {
        // Fill the gap with empty slots spaced by basePeriod
        for (let fillTime = t1 + params.basePeriod; fillTime < t2; fillTime += params.basePeriod) {
          timeMap.set(fillTime, { time: fillTime, fields: {}, judging: {} });
        }
      }
    }
  }

  const schedule = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);

  return { params, schedule };
}
