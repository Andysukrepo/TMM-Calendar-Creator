import React from 'react';
import {
  computeMoonPhaseDays,
  getDayHeaders,
  getEventsForDate,
  getISOWeekNumber,
  getMoonPhaseType
} from '../utils/calendarCalculations';
import { CalendarState } from '../types';

interface CalendarGridProps {
  state: CalendarState;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ state }) => {
  const borderStyle = state.showGridLines
    ? `${state.borderWidth}px solid ${state.borderColor}`
    : 'none';

  const tableStyle: React.CSSProperties = {
    fontFamily: state.gridFontFamily,
    color: state.dateColor,
    fontSize: `${state.dateSize}px`,
    fontWeight: state.gridFontWeight
  };

  const headers = getDayHeaders(state.headerStyle, state.startMonday);
  const weekendIndices = state.startMonday ? [5, 6] : [0, 6];

  const firstDay = new Date(state.year, state.month, 1);
  const lastDay = new Date(state.year, state.month + 1, 0);

  let startIndex = firstDay.getDay();
  if (state.startMonday) startIndex = (startIndex - 1 + 7) % 7;

  const totalCells = Math.ceil((startIndex + lastDay.getDate()) / 7) * 7;
  const numRows = totalCells / 7;
  const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;

  let currentDay = 1;
  const rows: React.ReactNode[] = [];

  for (let r = 0; r < numRows; r++) {
    const rowCells: React.ReactNode[] = [];

    // ISO Week Number Column
    if (state.showWeekNumbers) {
      let sampleDay = currentDay;
      if (r === 0 && startIndex > 0) sampleDay = 1;
      let weekLabel = '';
      if (sampleDay <= lastDay.getDate()) {
        const rowDate = new Date(state.year, state.month, sampleDay);
        weekLabel = `W${String(getISOWeekNumber(rowDate)).padStart(2, '0')}`;
      }
      rowCells.push(
        <td
          key={`wk-${r}`}
          className="td-week-num"
          style={{ border: borderStyle }}
        >
          {weekLabel}
        </td>
      );
    }

    // 7 Day columns
    for (let c = 0; c < 7; c++) {
      const cellKey = `cell-${r}-${c}`;

      if ((r === 0 && c < startIndex) || currentDay > lastDay.getDate()) {
        rowCells.push(
          <td key={cellKey} style={{ border: borderStyle }} />
        );
        continue;
      }

      const dayNum = currentDay;
      const dateObj = new Date(state.year, state.month, dayNum);
      const mType = getMoonPhaseType(dayNum, moonMap);
      const events = getEventsForDate(dateObj, state.enabledEvents, state.customEvents);

      rowCells.push(
        <td key={cellKey} style={{ border: borderStyle }}>
          <div
            className="date-number"
            style={{
              fontWeight: state.gridFontWeight,
              color: state.dateColor
            }}
          >
            {dayNum}
          </div>

          {mType && (
            <span className="moon-icon">
              <span className={`moon-circle moon-${mType}`} />
            </span>
          )}

          <div className="cell-events">
            {events.map((ev, evIdx) => {
              let className = 'event-special';
              if (ev.type === 'bank') className = 'event-bank';
              if (ev.type === 'custom') className = 'event-custom';

              return (
                <span
                  key={`${ev.label}-${evIdx}`}
                  className={className}
                  style={{ fontWeight: state.gridFontWeight }}
                >
                  {ev.label}
                </span>
              );
            })}
          </div>
        </td>
      );

      currentDay++;
    }

    rows.push(<tr key={`row-${r}`}>{rowCells}</tr>);
  }

  return (
    <div className={`calendar-grid pos-${state.datePosition}`}>
      <table className="calendar-table" style={tableStyle}>
        {state.showHeaders && (
          <thead>
            <tr>
              {state.showWeekNumbers && (
                <th className="th-week-num" style={{ border: borderStyle }}>
                  Wk
                </th>
              )}
              {headers.map((h, i) => {
                const isWknd = weekendIndices.includes(i);
                return (
                  <th
                    key={h}
                    style={{
                      border: borderStyle,
                      fontWeight: state.gridFontWeight,
                      color: isWknd ? state.weekendHeaderColor : state.weekdayColor
                    }}
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};
