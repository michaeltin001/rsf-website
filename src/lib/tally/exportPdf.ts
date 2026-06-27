import { jsPDF } from 'jspdf';
import { GeneratorParams, Slot, parseTime, formatTime } from './scheduler';
import type { ScheduleModalConfig } from '@/types/page';

type DrawCommand = 
  | { type: 'rect', x: number, y: number, w: number, h: number, fillColor: number[] }
  | { type: 'text', text: string, x: number, y: number, size: number, color: number[], align?: 'left' | 'center' | 'right', fontStyle?: 'normal' | 'bold', angle?: number }
  | { type: 'line', x1: number, y1: number, x2: number, y2: number, color: number[], width?: number };

export function exportToPDF(params: GeneratorParams, schedule: Slot[], config: ScheduleModalConfig, viewMode: 'horizontal' | 'vertical') {
    if (!schedule || schedule.length === 0) return;

    const commands: DrawCommand[] = [];
    let maxX = 0;
    let maxY = 0;

    const addRect = (x: number, y: number, w: number, h: number, fillColor: number[] = [255,255,255]) => {
        commands.push({ type: 'rect', x, y, w, h, fillColor });
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    };

    const addText = (text: string, x: number, y: number, size: number, color: number[] = [0,0,0], align: 'left' | 'center' | 'right' = 'left', fontStyle: 'normal' | 'bold' = 'normal', angle: number = 0) => {
        commands.push({ type: 'text', text, x, y, size, color, align, fontStyle, angle });
        let textWidth = text.length * size * 0.6;
        if (align === 'right') {
            maxX = Math.max(maxX, x);
        } else if (align === 'center') {
            maxX = Math.max(maxX, x + textWidth / 2);
        } else {
            maxX = Math.max(maxX, x + textWidth);
        }
        maxY = Math.max(maxY, y + size);
    };

    const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = [0,0,0], width: number = 1) => {
        commands.push({ type: 'line', x1, y1, x2, y2, color, width });
        maxX = Math.max(maxX, Math.max(x1, x2));
        maxY = Math.max(maxY, Math.max(y1, y2));
    };

    const preambleEvents = [
        { label: config.labels.volunteers_arrive || "Volunteers Arrive", time: params.volunteersArriveTime },
        { label: config.labels.team_check_in || "Team Check-In", time: params.teamCheckInTime },
        { label: config.labels.opening_ceremonies || "Opening Ceremonies", time: params.openingCeremoniesTime },
    ];

    const parsedTeams = params.teamList
        .split("\n")
        .map((line, index) => {
            const parts = line.trim().split(",");
            if (parts.length === 2) {
                return { id: parts[0].trim(), name: parts[1].trim(), teamId: index + 1 };
            }
            return null;
        })
        .filter(Boolean) as { id: string; name: string; teamId: number; }[];

    const roundStartSlots: Record<number, string> = {};
    for (let r = 1; r <= params.numRounds; r++) {
        const roundName = r === 1 ? "Warm-Up" : `Round ${r - 1}`;
        for (let idx = 0; idx < schedule.length; idx++) {
            let found = false;
            for (let f = 1; f <= params.numFields; f++) {
                if (schedule[idx].fields[f]?.round === r) { found = true; break; }
            }
            if (found) { roundStartSlots[idx] = roundName; break; }
        }
    }

    // Colors
    const colHeaderBg = [240, 240, 240];
    const colBorder = [0, 0, 0];
    const colText = [0, 0, 0];
    const colGray = [150, 150, 150];

    // Build the Layout Data
    if (viewMode === 'horizontal') {
        const rowHeight = 30;
        const headerHeight = 120;
        const teamColWidth = 140;
        const timeColWidth = 50;
        const preambleColWidth = 30;
        const fontSize = 10;
        const headerFontSize = 10;

        let curX = 0;
        let curY = 0;

        // Header Row
        addRect(curX, curY, teamColWidth, headerHeight, colHeaderBg);
        addText("Team", curX + 5, curY + headerHeight - 10, headerFontSize, colText, 'left', 'bold');
        addLine(curX, curY, curX + teamColWidth, curY, colBorder);
        addLine(curX, curY + headerHeight, curX + teamColWidth, curY + headerHeight, colBorder);
        addLine(curX, curY, curX, curY + headerHeight, colBorder);
        addLine(curX + teamColWidth, curY, curX + teamColWidth, curY + headerHeight, colBorder);

        curX += teamColWidth;

        // Preamble Headers
        preambleEvents.forEach((event, idx) => {
            if (!event.time) return;
            let nextTime = params.startTime;
            for (let j = idx + 1; j < preambleEvents.length; j++) {
                if (preambleEvents[j].time) {
                    nextTime = preambleEvents[j].time;
                    break;
                }
            }
            const numBlocks = Math.max(0, Math.floor((parseTime(nextTime) - parseTime(event.time)) / params.basePeriod));
            
            addRect(curX, curY, preambleColWidth, headerHeight, colHeaderBg);
            addText(event.label, curX + preambleColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'bold', 90);
            addLine(curX, curY, curX + preambleColWidth, curY, colBorder);
            addLine(curX, curY + headerHeight, curX + preambleColWidth, curY + headerHeight, colBorder);
            addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + headerHeight, colBorder);

            curX += preambleColWidth;

            for (let b = 0; b < numBlocks; b++) {
                addRect(curX, curY, timeColWidth, headerHeight, [255,255,255]);
                addText(formatTime(parseTime(event.time) + (b * params.basePeriod)), curX + timeColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'normal', 90);
                addLine(curX, curY, curX + timeColWidth, curY, colBorder);
                addLine(curX, curY + headerHeight, curX + timeColWidth, curY + headerHeight, colBorder);
                addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + headerHeight, colBorder);
                curX += timeColWidth;
            }
        });

        // Schedule Headers
        schedule.forEach((slot, idx) => {
            const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
            const isRoundStart = roundStartSlots[idx];
            const lunchBlocks = isLunchBreak ? Math.max(0, Math.floor((slot.time - (schedule[idx - 1].time + params.basePeriod)) / params.basePeriod)) : 0;

            if (isLunchBreak) {
                addRect(curX, curY, preambleColWidth, headerHeight, colHeaderBg);
                addText("Lunch Break", curX + preambleColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'bold', 90);
                addLine(curX, curY, curX + preambleColWidth, curY, colBorder);
                addLine(curX, curY + headerHeight, curX + preambleColWidth, curY + headerHeight, colBorder);
                addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + headerHeight, colBorder);
                curX += preambleColWidth;

                for (let b = 0; b < lunchBlocks; b++) {
                    addRect(curX, curY, timeColWidth, headerHeight, [255,255,255]);
                    addText(formatTime(schedule[idx - 1].time + params.basePeriod + (b * params.basePeriod)), curX + timeColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'normal', 90);
                    addLine(curX, curY, curX + timeColWidth, curY, colBorder);
                    addLine(curX, curY + headerHeight, curX + timeColWidth, curY + headerHeight, colBorder);
                    addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + headerHeight, colBorder);
                    curX += timeColWidth;
                }
            }

            if (isRoundStart) {
                addRect(curX, curY, preambleColWidth, headerHeight, [240, 240, 240]);
                addText(isRoundStart, curX + preambleColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'bold', 90);
                addLine(curX, curY, curX + preambleColWidth, curY, colBorder);
                addLine(curX, curY + headerHeight, curX + preambleColWidth, curY + headerHeight, colBorder);
                addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + headerHeight, colBorder);
                curX += preambleColWidth;
            }

            addRect(curX, curY, timeColWidth, headerHeight, [255,255,255]);
            addText(formatTime(slot.time), curX + timeColWidth / 2 + 3, curY + headerHeight - 5, headerFontSize, colText, 'left', 'bold', 90);
            addLine(curX, curY, curX + timeColWidth, curY, colBorder);
            addLine(curX, curY + headerHeight, curX + timeColWidth, curY + headerHeight, colBorder);
            addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + headerHeight, colBorder);
            curX += timeColWidth;
        });

        curY += headerHeight;

        // Draw Rows
        parsedTeams.forEach((team) => {
            curX = 0;
            addRect(curX, curY, teamColWidth, rowHeight, [255, 255, 255]);
            let tname = team.name;
            if (tname.length > 20) tname = tname.substring(0, 18) + "...";
            addText(`${team.id} - ${tname}`, curX + 5, curY + 20, fontSize, colText, 'left', 'bold');
            addLine(curX, curY, curX, curY + rowHeight, colBorder);
            addLine(curX, curY + rowHeight, curX + teamColWidth, curY + rowHeight, colBorder);
            addLine(curX + teamColWidth, curY, curX + teamColWidth, curY + rowHeight, colBorder);
            curX += teamColWidth;

            // Preamble Rows
            preambleEvents.forEach((event, idx) => {
                if (!event.time) return;
                let nextTime = params.startTime;
                for (let j = idx + 1; j < preambleEvents.length; j++) {
                    if (preambleEvents[j].time) { nextTime = preambleEvents[j].time; break; }
                }
                const numBlocks = Math.max(0, Math.floor((parseTime(nextTime) - parseTime(event.time)) / params.basePeriod));
                
                addRect(curX, curY, preambleColWidth, rowHeight, [240, 240, 240]);
                addLine(curX, curY + rowHeight, curX + preambleColWidth, curY + rowHeight, colBorder);
                addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + rowHeight, colBorder);
                curX += preambleColWidth;

                for (let b = 0; b < numBlocks; b++) {
                    addRect(curX, curY, timeColWidth, rowHeight, [255, 255, 255]);
                    addLine(curX, curY + rowHeight, curX + timeColWidth, curY + rowHeight, colBorder);
                    addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + rowHeight, colBorder);
                    curX += timeColWidth;
                }
            });

            // Schedule Rows
            schedule.forEach((slot, idx) => {
                const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
                const isRoundStart = roundStartSlots[idx];
                const lunchBlocks = isLunchBreak ? Math.max(0, Math.floor((slot.time - (schedule[idx - 1].time + params.basePeriod)) / params.basePeriod)) : 0;

                if (isLunchBreak) {
                    addRect(curX, curY, preambleColWidth, rowHeight, [240, 240, 240]);
                    addLine(curX, curY + rowHeight, curX + preambleColWidth, curY + rowHeight, colBorder);
                    addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + rowHeight, colBorder);
                    curX += preambleColWidth;

                    for (let b = 0; b < lunchBlocks; b++) {
                        addRect(curX, curY, timeColWidth, rowHeight, [255, 255, 255]);
                        addLine(curX, curY + rowHeight, curX + timeColWidth, curY + rowHeight, colBorder);
                        addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + rowHeight, colBorder);
                        curX += timeColWidth;
                    }
                }

                if (isRoundStart) {
                    addRect(curX, curY, preambleColWidth, rowHeight, [240, 240, 240]);
                    addLine(curX, curY + rowHeight, curX + preambleColWidth, curY + rowHeight, colBorder);
                    addLine(curX + preambleColWidth, curY, curX + preambleColWidth, curY + rowHeight, colBorder);
                    curX += preambleColWidth;
                }

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

                addRect(curX, curY, timeColWidth, rowHeight, [255, 255, 255]);
                if (scheduledEvent) {
                    if (eventType === "field" || scheduledEvent.isStart) {
                        addText(scheduledEvent.code, curX + timeColWidth / 2, curY + 19, fontSize, colText, 'center', 'bold');
                    } else {
                        addText("Cont.", curX + timeColWidth / 2, curY + 19, fontSize - 2, colGray, 'center', 'normal');
                    }
                }
                addLine(curX, curY + rowHeight, curX + timeColWidth, curY + rowHeight, colBorder);
                addLine(curX + timeColWidth, curY, curX + timeColWidth, curY + rowHeight, colBorder);
                curX += timeColWidth;
            });

            curY += rowHeight;
        });

    } else {
        // Vertical View Mode
        let curX = 0;
        let curY = 0;
        const blockWidth = 640;
        const colWidth = blockWidth / 2;
        const fontSize = 12;

        const PDF_WIDTH = 612; // 8.5 * 72
        const PDF_HEIGHT = 792; // 11 * 72
        const margin = 20;
        let S = (PDF_WIDTH - margin * 2) / blockWidth;
        if (S > 1.5) S = 1.5;
        const usableHeight = (PDF_HEIGHT - margin * 2) / S;

        addText(`${params.tournamentName} Schedule`, curX, curY + 20, 18, colText, 'left', 'bold');
        if (params.tournamentDate) {
            const [year, month, day] = params.tournamentDate.split('-');
            const dateStr = (year && month && day) ? `${month}/${day}/${year}` : params.tournamentDate;
            addText(dateStr, curX + blockWidth, curY + 20, 14, colText, 'right', 'bold');
        }
        curY += 30;
        addLine(curX, curY, curX + blockWidth, curY, colBorder, 2);
        curY += 20;

        preambleEvents.forEach((event, idx) => {
            if (!event.time) return;
            let nextTime = params.startTime;
            for (let j = idx + 1; j < preambleEvents.length; j++) {
                if (preambleEvents[j].time) { nextTime = preambleEvents[j].time; break; }
            }
            addText(event.label, curX, curY + 10, fontSize, colText, 'left', 'bold');
            addText(`${formatTime(parseTime(event.time))} - ${formatTime(parseTime(nextTime))}`, curX + blockWidth, curY + 10, fontSize, colText, 'right');
            curY += 15;
            addLine(curX, curY, curX + blockWidth, curY, colGray, 1);
            curY += 15;
        });

        schedule.forEach((slot, idx) => {
            const hasItems = Object.keys(slot.fields).length > 0 || Object.keys(slot.judging).length > 0;
            if (!hasItems) return;
            
            const isLunchBreak = idx > 0 && slot.time - schedule[idx - 1].time > params.basePeriod;
            const isRoundStart = roundStartSlots[idx];

            // Calculate height of this block to prevent page straddling
            let blockHeight = 0;
            if (isLunchBreak) blockHeight += 10 + 20 + 10 + 20;
            if (isRoundStart) blockHeight += 10 + 15 + 15;
            blockHeight += 20 + 10 + 20; // Time header

            const numMatches = Object.keys(slot.fields).length;
            const matchH = 15 + (numMatches === 0 ? 15 : numMatches * 25);
            const numJudging = Object.keys(slot.judging).length;
            const judgingH = 15 + (numJudging === 0 ? 15 : numJudging * 25);
            blockHeight += Math.max(matchH, judgingH) + 20;

            if (curY > 0 && (curY % usableHeight) + blockHeight + 15 > usableHeight) {
                // Advance curY to just past the start of the next page to ensure clean culling
                curY = Math.ceil(curY / usableHeight) * usableHeight + 10;
            }

            if (isLunchBreak) {
                curY += 10;
                addLine(curX, curY, curX + blockWidth, curY, colBorder, 2);
                curY += 20;
                addText("Lunch Break", curX, curY, fontSize + 2, colText, 'left', 'bold');
                addText(`${formatTime(schedule[idx - 1].time + params.basePeriod)} - ${formatTime(slot.time)}`, curX + blockWidth, curY, fontSize + 2, colText, 'right', 'bold');
                curY += 10;
                addLine(curX, curY, curX + blockWidth, curY, colBorder, 2);
                curY += 20;
            }

            if (isRoundStart) {
                curY += 10;
                addText(isRoundStart, curX, curY + 10, fontSize + 2, colText, 'left', 'bold');
                curY += 15;
                addLine(curX, curY, curX + blockWidth, curY, colBorder, 1);
                curY += 15;
            }

            // Draw block border background first
            let blockStartY = curY;
            addRect(curX, curY, blockWidth, 10, [255, 255, 255]); // Placeholder rect just to ensure background is tracked
            
            curY += 20;
            addText(formatTime(slot.time), curX + 10, curY, fontSize + 2, colText, 'left', 'bold');
            curY += 10;
            addLine(curX, curY, curX + blockWidth, curY, colBorder, 1);
            curY += 20;

            let maxColY = curY;

            // Matches
            let matchY = curY;
            addText("Matches", curX + 10, matchY + 10, fontSize, colText, 'left', 'bold');
            matchY += 15;
            if (Object.keys(slot.fields).length === 0) {
                addText("No matches", curX + 10, matchY + 10, fontSize, colGray, 'left', 'normal');
                matchY += 15;
            } else {
                for (let f = 1; f <= params.numFields; f++) {
                    const team = slot.fields[f];
                    if (!team) continue;
                    addText(team.code, curX + 10, matchY + 10, fontSize, colText, 'left', 'bold');
                    addText(`${team.id} - ${team.name}`, curX + 60, matchY + 10, fontSize, colText, 'left');
                    matchY += 15;
                    addLine(curX + 10, matchY, curX + colWidth - 10, matchY, colGray, 0.5);
                    matchY += 10;
                }
            }

            // Judging
            let judgingY = curY;
            addText("Judging", curX + colWidth + 10, judgingY + 10, fontSize, colText, 'left', 'bold');
            judgingY += 15;
            if (Object.keys(slot.judging).length === 0) {
                addText("No judging", curX + colWidth + 10, judgingY + 10, fontSize, colGray, 'left', 'normal');
                judgingY += 15;
            } else {
                for (let j = 1; j <= params.numJudging; j++) {
                    const team = slot.judging[j];
                    if (!team) continue;
                    addText(team.code, curX + colWidth + 10, judgingY + 10, fontSize, colText, 'left', 'bold');
                    addText(team.isStart ? `${team.id} - ${team.name}` : "(Continued)", curX + colWidth + 85, judgingY + 10, fontSize, colText, 'left');
                    judgingY += 15;
                    addLine(curX + colWidth + 10, judgingY, curX + blockWidth - 10, judgingY, colGray, 0.5);
                    judgingY += 10;
                }
            }

            maxColY = Math.max(matchY, judgingY);
            
            // Draw block borders
            addLine(curX, blockStartY, curX + blockWidth, blockStartY, colBorder, 1);
            addLine(curX, maxColY, curX + blockWidth, maxColY, colBorder, 1);
            addLine(curX, blockStartY, curX, maxColY, colBorder, 1);
            addLine(curX + blockWidth, blockStartY, curX + blockWidth, maxColY, colBorder, 1);
            
            curY = maxColY + 20;
        });
    }

    // --- RENDER & SLICE LOGIC ---
    const TW = maxX;
    const TH = maxY;

    const orientation = viewMode === 'horizontal' ? 'landscape' : 'portrait';
    const PDF_WIDTH = orientation === 'landscape' ? 11 * 72 : 8.5 * 72;  // 792 : 612
    const PDF_HEIGHT = orientation === 'landscape' ? 8.5 * 72 : 11 * 72; // 612 : 792

    // Calculate scale factor S based on viewMode constraints
    let S = 1;
    const margin = 20;

    if (viewMode === 'horizontal') {
        // Grid View: Scale height to fit 8.5" height
        S = (PDF_HEIGHT - margin * 2) / TH;
        
        // Prevent text from becoming microscopic by enforcing a minimum scale 
        // (Calculated for roughly 20 teams: 120 header + 20 * 30 rowHeight = 720)
        const minScale = (PDF_HEIGHT - margin * 2) / 720;
        if (S < minScale) S = minScale;
    } else {
        // List View: Scale width to fit 8.5" width
        // We use 640 (blockWidth) instead of TW to guarantee scale math perfectly matches the page-straddle logic
        S = (PDF_WIDTH - margin * 2) / 640;
    }
    
    // Don't scale up excessively
    if (S > 1.5) S = 1.5;

    const scaledW = TW * S;
    const scaledH = TH * S;

    const numCols = viewMode === 'horizontal' ? Math.ceil(scaledW / (PDF_WIDTH - margin * 2)) : 1;
    const numRows = Math.ceil(scaledH / (PDF_HEIGHT - margin * 2));

    const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: 'letter'
    });

    let pageIndex = 0;
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (pageIndex > 0) {
                pdf.addPage();
            }
            
            // The drawing offset for the current sliced page
            const offsetX = -c * (PDF_WIDTH - margin * 2) + margin;
            const offsetY = -r * (PDF_HEIGHT - margin * 2) + margin;
            
            // Viewport for culling commands outside this page (unscaled coordinates)
            const vpX = (c * (PDF_WIDTH - margin * 2)) / S;
            const vpY = (r * (PDF_HEIGHT - margin * 2)) / S;
            const vpW = (PDF_WIDTH - margin * 2) / S;
            const vpH = (PDF_HEIGHT - margin * 2) / S;

            commands.forEach(cmd => {
                // Determine bounding box of the command
                const cx = (cmd.type === 'line') ? Math.min(cmd.x1, cmd.x2) : cmd.x;
                const cy = (cmd.type === 'line') ? Math.min(cmd.y1, cmd.y2) : cmd.y;
                let cw = 0, ch = 0;
                
                if (cmd.type === 'rect') { cw = cmd.w; ch = cmd.h; }
                if (cmd.type === 'line') { cw = Math.abs(cmd.x2 - cmd.x1); ch = Math.abs(cmd.y2 - cmd.y1); }
                if (cmd.type === 'text') { cw = cmd.text.length * cmd.size * 0.6; ch = cmd.size; }
                
                const EPSILON = 0.5;
                
                // Check X boundaries
                if (cx > vpX + vpW - EPSILON) {
                    if (!(cmd.type === 'line' && cw < EPSILON && Math.abs(cx - (vpX + vpW)) < EPSILON)) return;
                }
                if (cx + cw < vpX + EPSILON) {
                    if (!(cmd.type === 'line' && cw < EPSILON && Math.abs(cx + cw - vpX) < EPSILON)) return;
                }

                // Check Y boundaries
                if (cy > vpY + vpH - EPSILON) {
                    if (!(cmd.type === 'line' && ch < EPSILON && Math.abs(cy - (vpY + vpH)) < EPSILON)) return;
                }
                if (cy + ch < vpY + EPSILON) {
                    if (!(cmd.type === 'line' && ch < EPSILON && Math.abs(cy + ch - vpY) < EPSILON)) return;
                }

                if (cmd.type === 'rect') {
                    if (cmd.fillColor[0] !== 255 || cmd.fillColor[1] !== 255 || cmd.fillColor[2] !== 255) {
                        pdf.setFillColor(cmd.fillColor[0], cmd.fillColor[1], cmd.fillColor[2]);
                        pdf.rect(cmd.x * S + offsetX, cmd.y * S + offsetY, cmd.w * S, cmd.h * S, 'F');
                    }
                } else if (cmd.type === 'text') {
                    pdf.setTextColor(cmd.color[0], cmd.color[1], cmd.color[2]);
                    pdf.setFontSize(cmd.size * S);
                    pdf.setFont("helvetica", cmd.fontStyle || "normal");
                    pdf.text(cmd.text, cmd.x * S + offsetX, cmd.y * S + offsetY, { align: cmd.align || 'left', angle: cmd.angle || 0 });
                } else if (cmd.type === 'line') {
                    pdf.setDrawColor(cmd.color[0], cmd.color[1], cmd.color[2]);
                    pdf.setLineWidth((cmd.width || 1) * S);
                    pdf.line(cmd.x1 * S + offsetX, cmd.y1 * S + offsetY, cmd.x2 * S + offsetX, cmd.y2 * S + offsetY);
                }
            });

            pageIndex++;
        }
    }

    pdf.save(`${params.tournamentName.replace(/\s+/g, '_')}_Schedule.pdf`);
}
