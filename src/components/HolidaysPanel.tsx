import React from 'react';
import { HOLIDAY_DATA, MONTH_NAMES } from '../data/holidays';

interface HolidaysPanelProps {
  moonPhasesOn: boolean;
  onToggleMoonPhases: (val: boolean) => void;
  enabledEvents: Record<string, boolean>;
  onToggleEvent: (id: string, enabled: boolean) => void;
  activeMonth: number;
}

export const HolidaysPanel: React.FC<HolidaysPanelProps> = ({
  moonPhasesOn,
  onToggleMoonPhases,
  enabledEvents,
  onToggleEvent,
  activeMonth
}) => {
  return (
    <section className="panel">
      <h2>Holidays &amp; Observances</h2>

      <div className="toggle-row" style={{ marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
        <input
          id="moonPhasesToggle"
          type="checkbox"
          checked={moonPhasesOn}
          onChange={(e) => onToggleMoonPhases(e.target.checked)}
        />
        <span>
          Moon phases{' '}
          <span className="moon-circle moon-new" style={{ marginLeft: 4 }} title="New Moon" />{' '}
          <span className="moon-circle moon-first" title="First Quarter" />{' '}
          <span className="moon-circle moon-last" title="Last Quarter" />{' '}
          <span className="moon-circle moon-full" title="Full Moon" />
        </span>
      </div>

      <div id="holidayListContainer" className="holiday-accordion-wrapper">
        {MONTH_NAMES.map((mName, mIdx) => {
          const eventsInMonth = HOLIDAY_DATA.filter((h) => h.month === mIdx);
          if (eventsInMonth.length === 0) return null;

          return (
            <details key={mName} open={mIdx === activeMonth}>
              <summary>{mName}</summary>
              <div className="holiday-month-content">
                {eventsInMonth.map((ev) => {
                  const isChecked = !!enabledEvents[ev.id];
                  return (
                    <div key={ev.id} className="holiday-item-row">
                      <input
                        type="checkbox"
                        id={`evt_${ev.id}`}
                        checked={isChecked}
                        onChange={(e) => onToggleEvent(ev.id, e.target.checked)}
                      />
                      <label
                        htmlFor={`evt_${ev.id}`}
                        style={{
                          color: ev.type === 'bank' ? '#b91c1c' : '#7c3aed',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {ev.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
};
