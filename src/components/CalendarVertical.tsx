import React from 'react';
import {
  computeMoonPhaseDays,
  getEventsForDate,
  getMoonPhaseType
} from '../utils/calendarCalculations';
import { CalendarState } from '../types';

interface CalendarVerticalProps {
  state: CalendarState;
}

export const CalendarVertical: React.FC<CalendarVerticalProps> = ({ state }) => {
  const borderStyle = state.showGridLines
    ? `${state.borderWidth}px solid ${state.borderColor}`
    : 'none';

  const tableStyle: React.CSSProperties = {
    fontFamily: state.gridFontFamily,
    color: state.dateColor,
    fontSize: `${state.dateSize}px`,
    fontWeight: state.gridFontWeight
  };

  const isSlim = state.layout === 'vertical-slim';
  const colCount = isSlim ? 1 : state.colCount;
  const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
  const moonMap = state.moonPhasesOn ? computeMoonPhaseDays(state.year, state.month) : null;

  const rows: React.ReactNode[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(state.year, state.month, d);
    const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
    const isWknd = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const dayColor = isWknd ? state.weekendHeaderColor : state.weekdayColor;
    const events = getEventsForDate(dateObj, state.enabledEvents, state.customEvents);
    const mType = getMoonPhaseType(d, moonMap);

    const userCells: React.ReactNode[] = [];
    for (let k = 0; k < colCount; k++) {
      userCells.push(<td key={`user-col-${k}`} style={{ border: borderStyle }} />);
    }

    rows.push(
      <tr key={`vrow-${d}`} className={isWknd ? 'row-weekend' : ''}>
        <td style={{ border: borderStyle }}>
          <div className="vertical-cell-container">
            <div className="v-top-row">
              <span className="v-day-name" style={{ color: dayColor }}>
                {dayName}
              </span>
              <span
                className="v-day-num"
                style={{
                  color: state.dateColor,
                  fontWeight: state.gridFontWeight
                }}
              >
                {String(d).padStart(2, '0')}
              </span>
            </div>
            <div className="v-bottom-row">
              {events.map((ev, evIdx) => {
                let color = '#374151';
                if (ev.type === 'bank') color = '#b91c1c';
                if (ev.type === 'special') color = '#7c3aed';
                if (ev.type === 'custom') color = '#9a3412';

                return (
                  <span key={`${ev.label}-${evIdx}`} style={{ color, marginRight: 6 }}>
                    {ev.label}
                  </span>
                );
              })}
              {mType && (
                <span style={{ fontSize: 13, marginLeft: 4 }}>
                  <span className={`moon-circle moon-${mType}`} />
                </span>
              )}
            </div>
          </div>
        </td>
        {userCells}
      </tr>
    );
  }

  return (
    <div className="calendar-grid">
      <table className="calendar-table vertical-mode" style={tableStyle}>
        <thead>
          <tr>
            <th
              style={{
                border: borderStyle,
                fontWeight: state.gridFontWeight
              }}
            >
              DATE
            </th>
            {isSlim ? (
              <th
                style={{
                  border: borderStyle,
                  fontWeight: state.gridFontWeight
                }}
              >
                NOTES
              </th>
            ) : (
              Array.from({ length: state.colCount }).map((_, i) => {
                const label = state.columnNames[i] || `Name ${i + 1}`;
                return (
                  <th
                    key={i}
                    style={{
                      border: borderStyle,
                      fontWeight: state.gridFontWeight
                    }}
                  >
                    {label.toUpperCase()}
                  </th>
                );
              })
            )}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};
