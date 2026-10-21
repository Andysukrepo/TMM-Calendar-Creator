import React, { useRef, useState } from 'react';
import { CustomEvent } from '../types';

interface CustomEventsPanelProps {
  customEvents: CustomEvent[];
  onAddEvent: (event: CustomEvent) => void;
  onRemoveEvent: (index: number) => void;
  onClearEvents: () => void;
  onBulkAddEvents: (events: CustomEvent[]) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CustomEventsPanel: React.FC<CustomEventsPanelProps> = ({
  customEvents,
  onAddEvent,
  onRemoveEvent,
  onClearEvents,
  onBulkAddEvents,
  onNotify
}) => {
  const [date, setDate] = useState('');
  const [label, setLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAdd = () => {
    if (!date || !label.trim()) return;
    onAddEvent({ date, label: label.trim() });
    setDate('');
    setLabel('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      const lines = text.split(/\r?\n/);
      const newEvents: CustomEvent[] = [];

      lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) return;

        let delim = ',';
        if (line.includes(';')) delim = ';';
        else if (line.includes('\t')) delim = '\t';

        const parts = line.split(delim).map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 2) return;

        let isoDate: string | null = null;
        let labelStr = '';

        for (let i = 0; i < parts.length; i++) {
          const token = parts[i];
          const isoMatch = token.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
          if (isoMatch) {
            isoDate = `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
            labelStr = parts.filter((_, pIdx) => pIdx !== i).join(' ');
            break;
          }

          const ukMatch = token.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
          if (ukMatch) {
            isoDate = `${ukMatch[3]}-${String(ukMatch[2]).padStart(2, '0')}-${String(ukMatch[1]).padStart(2, '0')}`;
            labelStr = parts.filter((_, pIdx) => pIdx !== i).join(' ');
            break;
          }
        }

        if (isoDate && labelStr) {
          newEvents.push({ date: isoDate, label: labelStr });
        }
      });

      if (fileInputRef.current) fileInputRef.current.value = '';

      if (newEvents.length > 0) {
        onBulkAddEvents(newEvents);
        onNotify(`Successfully imported ${newEvents.length} event(s)!`, 'success');
      } else {
        onNotify('No valid events found in file. Format: YYYY-MM-DD, Event Name', 'error');
      }
    };

    reader.readAsText(file);
  };

  return (
    <section id="customEventsPanel" className="panel">
      <h2>Custom events</h2>
      <div className="custom-event-row">
        <label>
          Date
          <input
            id="customEventDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Label
          <input
            id="customEventLabel"
            type="text"
            placeholder="e.g. Sale"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
        </label>
        <button
          id="addCustomEventBtn"
          type="button"
          className="tmm-btn tmm-btn-primary full-width small"
          style={{ marginTop: 6 }}
          onClick={handleAdd}
        >
          Add
        </button>
        <button
          id="clearCustomEventsBtn"
          type="button"
          className="tmm-btn tmm-btn-ghost full-width small"
          style={{ marginTop: 8, color: '#b91c1c', borderColor: '#fca5a5' }}
          onClick={onClearEvents}
        >
          Clear All
        </button>
      </div>

      <div className="divider" style={{ margin: '10px 0' }} />

      <div className="setting-row">
        <label>Bulk Import CSV</label>
        <input
          type="file"
          id="csvFileInput"
          ref={fileInputRef}
          accept=".csv, .txt"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          id="uploadCsvBtn"
          className="tmm-btn tmm-btn-ghost full-width small"
          style={{ border: '1px dashed #6b7280' }}
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Upload CSV / TXT
        </button>
        <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          Format: <code>2026-10-15, Grandma's Birthday</code>
        </span>
      </div>

      <ul id="customEventList" className="event-list">
        {customEvents.map((ev, i) => (
          <li key={`${ev.date}-${ev.label}-${i}`}>
            <span>
              {ev.date}: {ev.label}
            </span>
            <button
              type="button"
              title="Remove event"
              onClick={() => onRemoveEvent(i)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
