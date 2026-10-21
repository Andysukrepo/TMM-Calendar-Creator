import { CalendarState } from '../types';
import { MONTH_NAMES } from '../data/holidays';
import {
  computeMoonPhaseDays,
  getDayHeaders,
  getEventsForDate,
  getMoonPhaseType,
  getPageDimensions
} from './calendarCalculations';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function downloadBlob(content: string, filename: string, mimeType = 'image/svg+xml') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportGridSVG(state: CalendarState, styled: boolean) {
  const dim = getPageDimensions(state.pageSize, state.customWidth, state.customHeight);
  const width = dim.w;
  const height = dim.h;
  const margin = 120;
  const titleY = margin + 120;
  const headerY = titleY + 100;
  const gridTop = headerY + 60;
  const gridBottom = height - margin - 80;
  const gridH = gridBottom - gridTop;
  const gridW = width - margin * 2;
  const cols = 7;
  const first = new Date(state.year, state.month, 1);
  const last = new Date(state.year, state.month + 1, 0);
  let startIdx = first.getDay();
  if (state.startMonday) startIdx = (startIdx - 1 + 7) % 7;
  const totalCells = Math.ceil((startIdx + last.getDate()) / 7) * 7;
  const rows = totalCells / 7;
  const cellW = gridW / cols;
  const cellH = gridH / rows;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  if (!state.transparentBg) {
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;
  }

  const title = `${MONTH_NAMES[state.month]} ${state.year}`;
  let titleAnchor = "middle";
  let titlePosX = width / 2;
  if (state.titleAlign === "left") {
    titleAnchor = "start";
    titlePosX = margin;
  } else if (state.titleAlign === "right") {
    titleAnchor = "end";
    titlePosX = width - margin;
  }

  const cleanTitleFamily = state.titleFontFamily.replace(/"/g, "'");
  const cleanGridFamily = state.gridFontFamily.replace(/"/g, "'");

  svg += `<text x="${titlePosX}" y="${titleY}" text-anchor="${titleAnchor}" font-family="${cleanTitleFamily}" font-size="100" font-weight="${state.titleFontWeight}" fill="${state.titleColor}">${escapeHtml(title)}</text>`;

  const bW = state.showGridLines ? state.borderWidth : 0;

  if (state.showHeaders) {
    const headers = getDayHeaders(state.headerStyle, state.startMonday);
    const weekendIndices = state.startMonday ? [5, 6] : [0, 6];
    headers.forEach((h, i) => {
      const hx = margin + i * cellW + cellW / 2;
      const fill = weekendIndices.includes(i) ? state.weekendHeaderColor : state.weekdayColor;
      svg += `<text x="${hx}" y="${headerY}" text-anchor="middle" font-family="${cleanGridFamily}" font-size="30" font-weight="bold" fill="${fill}">${h}</text>`;
    });
  }

  const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;
  let day = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * cellW;
      const y = gridTop + r * cellH;

      if ((r === 0 && c < startIdx) || day > last.getDate()) {
        if (state.showGridLines) {
          svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
        }
        continue;
      }

      if (state.showGridLines) {
        if (styled) {
          svg += `<rect x="${x + 4}" y="${y + 4}" width="${cellW - 8}" height="${cellH - 8}" rx="10" fill="none" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
        }
      }

      const dateObj = new Date(state.year, state.month, day);
      const p = state.datePosition;
      let dateX: number, dateY: number, evX: number, evY: number;
      let evAnchor = 'start';
      const pad = 20;
      const fsDate = 40;
      const fsEv = 26;

      if (p.includes('top')) {
        dateY = y + pad + fsDate;
        evY = y + cellH - pad;
      } else {
        dateY = y + cellH - pad;
        evY = y + pad + fsEv;
      }

      if (p.includes('left')) {
        dateX = x + pad;
      } else {
        dateX = x + cellW - pad;
      }

      if (p.includes('right')) {
        evX = x + cellW - pad;
        evAnchor = 'end';
      } else {
        evX = x + pad;
        evAnchor = 'start';
      }

      svg += `<text x="${dateX}" y="${dateY}" text-anchor="${p.includes('right') ? 'end' : 'start'}" font-family="${cleanGridFamily}" font-size="${fsDate}" font-weight="${state.gridFontWeight}" fill="${state.dateColor}">${day}</text>`;

      if (moonMap) {
        const mType = getMoonPhaseType(day, moonMap);
        if (mType) {
          const mx = dateX + (p.includes('right') ? -50 : 50);
          const circleColor = mType === 'full' ? '#ffffff' : '#34495d';
          svg += `<circle cx="${mx}" cy="${dateY - 12}" r="12" fill="${circleColor}" stroke="#34495d" stroke-width="2"/>`;
        }
      }

      const events = getEventsForDate(dateObj, state.enabledEvents, state.customEvents);
      let currentEvY = evY;
      const stackDir = p.includes('top') ? -1 : 1;
      events.forEach(ev => {
        let col = '#374151';
        if (ev.type === 'bank') col = '#b91c1c';
        if (ev.type === 'special') col = '#7c3aed';
        if (ev.type === 'custom') col = '#9a3412';
        svg += `<text x="${evX}" y="${currentEvY}" text-anchor="${evAnchor}" font-family="${cleanGridFamily}" font-size="${fsEv}" fill="${col}">${escapeHtml(ev.label)}</text>`;
        currentEvY += 30 * stackDir;
      });

      day++;
    }
  }

  svg += `</svg>`;
  downloadBlob(svg, `calendar-${state.year}-${state.month + 1}-grid.svg`);
}

export function exportVerticalSVG(state: CalendarState, _styled: boolean) {
  const isSlim = state.layout === 'vertical-slim';
  const isA4 = state.layout === 'vertical-a4';
  let width: number, height: number;
  if (isSlim) {
    width = 1754;
    height = 4961;
  } else if (isA4) {
    width = 2480;
    height = 3508;
  } else {
    width = 3508;
    height = 4961;
  }

  const margin = isA4 ? 80 : 120;
  const titleY = margin + (isA4 ? 120 : 150);
  const headerH = isA4 ? 80 : 100;
  const tableTop = titleY + (isA4 ? 80 : 120);
  const dateColW = isA4 ? 400 : 550;
  const remainingW = width - margin * 2 - dateColW;
  const userColCount = isSlim ? 1 : state.colCount;
  const userColW = remainingW / userColCount;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  if (!state.transparentBg) {
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;
  }

  const title = `${MONTH_NAMES[state.month]} ${state.year}`;
  const tSize = state.titleSize ? state.titleSize * (isA4 ? 2.5 : 3.5) : (isA4 ? 90 : 120);

  let titleAnchor = 'start';
  let titlePosX = margin;
  if (state.titleAlign === 'center') {
    titleAnchor = 'middle';
    titlePosX = width / 2;
  } else if (state.titleAlign === 'right') {
    titleAnchor = 'end';
    titlePosX = width - margin;
  }

  const cleanTitleFamily = state.titleFontFamily.replace(/"/g, "'");
  const cleanGridFamily = state.gridFontFamily.replace(/"/g, "'");

  svg += `<text x="${titlePosX}" y="${titleY}" text-anchor="${titleAnchor}" font-family="${cleanTitleFamily}" font-size="${tSize}" font-weight="${state.titleFontWeight}" fill="${state.titleColor}">${escapeHtml(title)}</text>`;

  const bW = state.showGridLines ? state.borderWidth : 0;
  const drawCell = (x: number, y: number, w: number, h: number, text: string, isHeader = false) => {
    const fs = isA4 ? 28 : 35;
    if (isHeader) {
      if (!state.transparentBg) {
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" />`;
      }
      if (state.showGridLines) {
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
      }
      svg += `<text x="${x + w / 2}" y="${y + h / 2 + 10}" text-anchor="middle" font-family="${cleanGridFamily}" font-size="${fs}" font-weight="bold" fill="#666">${escapeHtml(text)}</text>`;
    } else {
      if (state.showGridLines) {
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
      }
    }
  };

  let curX = margin;
  drawCell(curX, tableTop, dateColW, headerH, 'DATE', true);
  curX += dateColW;
  if (isSlim) {
    drawCell(curX, tableTop, userColW, headerH, 'NOTES', true);
  } else {
    for (let i = 0; i < state.colCount; i++) {
      const label = state.columnNames[i] || `Name ${i + 1}`;
      drawCell(curX, tableTop, userColW, headerH, label.toUpperCase(), true);
      curX += userColW;
    }
  }

  const days = new Date(state.year, state.month + 1, 0).getDate();
  const rowH = (height - tableTop - headerH - margin) / days;
  const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;

  for (let d = 1; d <= days; d++) {
    const y = tableTop + headerH + (d - 1) * rowH;
    const dateObj = new Date(state.year, state.month, d);
    const isWknd = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();

    const dateTextY = y + rowH / 2 + (isA4 ? 12 : 15);
    const dateFS = isA4 ? 32 : 40;
    const dayFS = isA4 ? 24 : 30;
    const textFS = isA4 ? 24 : 30;

    svg += `<text x="${margin + 20}" y="${dateTextY}" font-family="${cleanGridFamily}" font-size="${dateFS}" font-weight="bold" fill="${isWknd ? '#be123c' : '#111827'}">${d}</text>`;

    const dColor = isWknd ? state.weekendHeaderColor : state.weekdayColor;
    svg += `<text x="${margin + (isA4 ? 80 : 90)}" y="${dateTextY}" font-family="${cleanGridFamily}" font-size="${dayFS}" fill="${dColor}">${dayName}</text>`;

    const events = getEventsForDate(dateObj, state.enabledEvents, state.customEvents);
    let evX = margin + (isA4 ? 150 : 180);
    events.forEach(ev => {
      let col = '#374151';
      if (ev.type === 'bank') col = '#b91c1c';
      if (ev.type === 'special') col = '#7c3aed';
      if (ev.type === 'custom') col = '#9a3412';
      svg += `<text x="${evX}" y="${dateTextY}" font-family="${cleanGridFamily}" font-size="${textFS}" fill="${col}">${escapeHtml(ev.label)}</text>`;
      evX += ev.label.length * (isA4 ? 14 : 18) + 20;
    });

    if (moonMap) {
      const mType = getMoonPhaseType(d, moonMap);
      if (mType) {
        const circleColor = mType === 'full' ? '#ffffff' : '#34495d';
        svg += `<circle cx="${evX + 15}" cy="${dateTextY - 8}" r="8" fill="${circleColor}" stroke="#34495d" stroke-width="1.5"/>`;
      }
    }

    if (state.showGridLines) {
      svg += `<line x1="${margin}" y1="${y + rowH}" x2="${width - margin}" y2="${y + rowH}" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
      let lineX = margin + dateColW;
      svg += `<line x1="${lineX}" y1="${y}" x2="${lineX}" y2="${y + rowH}" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
      if (!isSlim) {
        for (let c = 1; c < state.colCount; c++) {
          lineX += userColW;
          svg += `<line x1="${lineX}" y1="${y}" x2="${lineX}" y2="${y + rowH}" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
        }
      }
      svg += `<line x1="${margin}" y1="${y}" x2="${margin}" y2="${y + rowH}" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
      svg += `<line x1="${width - margin}" y1="${y}" x2="${width - margin}" y2="${y + rowH}" stroke="${state.borderColor}" stroke-width="${bW}"/>`;
    }
  }

  svg += `</svg>`;
  downloadBlob(svg, `vertical-${isA4 ? 'a4' : isSlim ? 'slim' : 'full'}.svg`);
}
