import React from 'react';
import { MONTH_NAMES } from '../data/holidays';

interface DateSelectionPanelProps {
  month: number;
  year: number;
  startMonday: boolean;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onStartMondayChange: (startMon: boolean) => void;
}

export const DateSelectionPanel: React.FC<DateSelectionPanelProps> = ({
  month,
  year,
  startMonday,
  onMonthChange,
  onYearChange,
  onStartMondayChange
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 1; y <= currentYear + 25; y++) {
    yearOptions.push(y);
  }

  return (
    <section className="panel">
      <h2>Date selection</h2>
      <div className="two-col">
        <label>
          Month
          <select
            id="monthSelect"
            value={month}
            onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Year
          <select
            id="yearSelect"
            value={year}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="setting-row">
        <label>Week Starts On</label>
        <div className="toggle-group" id="weekStartToggle">
          <button
            type="button"
            className={`btn-toggle ${startMonday ? 'active' : ''}`}
            id="btnStartMon"
            onClick={() => onStartMondayChange(true)}
          >
            Mon
          </button>
          <button
            type="button"
            className={`btn-toggle ${!startMonday ? 'active' : ''}`}
            id="btnStartSun"
            onClick={() => onStartMondayChange(false)}
          >
            Sun
          </button>
        </div>
      </div>
    </section>
  );
};
