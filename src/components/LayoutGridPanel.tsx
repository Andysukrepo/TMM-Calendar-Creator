import React, { useRef } from 'react';
import { MONTH_NAMES } from '../data/holidays';
import {
  ArtRatio,
  BindingEdge,
  CalendarLayout,
  DatePosition,
  HeaderStyle,
  PageSize
} from '../types';

interface LayoutGridPanelProps {
  layout: CalendarLayout;
  onLayoutChange: (l: CalendarLayout) => void;
  artRatio: ArtRatio;
  onArtRatioChange: (r: ArtRatio) => void;

  month: number;
  monthlyImages: (string | null)[];
  useSameArtForAllMonths: boolean;
  onUploadArt: (file: File) => void;
  onRemoveArt: () => void;
  onToggleUseSameArt: (val: boolean) => void;

  colCount: number;
  columnNames: string[];
  onColCountChange: (cnt: number) => void;
  onColumnNamesChange: (names: string[]) => void;

  showWeekNumbers: boolean;
  onShowWeekNumbersChange: (val: boolean) => void;
  showGridLines: boolean;
  onShowGridLinesChange: (val: boolean) => void;
  borderWidth: number;
  onBorderWidthChange: (w: number) => void;
  borderColor: string;
  onBorderColorChange: (c: string) => void;

  datePosition: DatePosition;
  onDatePositionChange: (pos: DatePosition) => void;
  headerStyle: HeaderStyle;
  onHeaderStyleChange: (s: HeaderStyle) => void;

  bindingEdge: BindingEdge;
  onBindingEdgeChange: (edge: BindingEdge) => void;
  showPunchGuide: boolean;
  onShowPunchGuideChange: (val: boolean) => void;

  pageSize: PageSize;
}

export const LayoutGridPanel: React.FC<LayoutGridPanelProps> = ({
  layout,
  onLayoutChange,
  artRatio,
  onArtRatioChange,

  month,
  useSameArtForAllMonths,
  onUploadArt,
  onRemoveArt,
  onToggleUseSameArt,

  colCount,
  columnNames,
  onColCountChange,
  onColumnNamesChange,

  showWeekNumbers,
  onShowWeekNumbersChange,
  showGridLines,
  onShowGridLinesChange,
  borderWidth,
  onBorderWidthChange,
  borderColor,
  onBorderColorChange,

  datePosition,
  onDatePositionChange,
  headerStyle,
  onHeaderStyleChange,

  bindingEdge,
  onBindingEdgeChange,
  showPunchGuide,
  onShowPunchGuideChange,

  pageSize
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recommended dimension hint calculation
  const isOneThird = artRatio === 'one-third';
  let hint = '2480 × 1169 px';
  if (pageSize.startsWith('a3')) {
    hint = isOneThird ? '3508 × 1654 px' : '3508 × 2480 px';
  } else if (pageSize.startsWith('us')) {
    hint = isOneThird ? '2550 × 1100 px' : '2550 × 1650 px';
  } else {
    hint = isOneThird ? '2480 × 1169 px' : '2480 × 1754 px';
  }

  const currentArtMonthName = useSameArtForAllMonths ? 'All Months' : MONTH_NAMES[month];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadArt(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="panel">
      <h2>Layout &amp; Grid</h2>

      <label style={{ marginBottom: 12, display: 'block' }}>
        Calendar Layout
        <select
          id="layoutSelect"
          value={layout}
          onChange={(e) => onLayoutChange(e.target.value as CalendarLayout)}
        >
          <option value="grid">Standard Monthly Grid</option>
          <option value="vertical-a4">Vertical A4 (Full Width)</option>
          <option value="vertical-full">Vertical A3 (Full Width)</option>
          <option value="vertical-slim">Vertical A3 (Slimline)</option>
        </select>
      </label>

      {/* TOP ARTWORK RATIO SELECTOR */}
      <label style={{ marginBottom: 12, display: 'block' }}>
        Top Artwork Header
        <select
          id="artRatioSelect"
          value={artRatio}
          onChange={(e) => onArtRatioChange(e.target.value as ArtRatio)}
        >
          <option value="none">None (Calendar Only)</option>
          <option value="one-third">1/3 Page Banner (Compact Art)</option>
          <option value="half">1/2 Page Split (Classic Wall Art)</option>
        </select>
      </label>

      {/* ARTWORK CONTROLS CONTAINER */}
      {artRatio !== 'none' && (
        <div
          id="splitArtOptions"
          style={{
            background: '#f9fafb',
            padding: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            marginBottom: 14
          }}
        >
          <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>
            Artwork for <span id="currentArtMonthName">{currentArtMonthName}</span>
          </label>

          <input
            type="file"
            id="artImageInput"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div className="two-col" style={{ gap: 8 }}>
            <button
              type="button"
              id="uploadArtBtn"
              className="tmm-btn tmm-btn-primary small full-width"
              onClick={() => fileInputRef.current?.click()}
            >
              🖼️ Upload Image
            </button>
            <button
              type="button"
              id="removeArtBtn"
              className="tmm-btn tmm-btn-ghost small full-width"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              onClick={onRemoveArt}
            >
              Remove
            </button>
          </div>

          <div className="checkbox-row" style={{ marginTop: 10 }}>
            <label>
              <input
                type="checkbox"
                id="useSameArtToggle"
                checked={useSameArtForAllMonths}
                onChange={(e) => onToggleUseSameArt(e.target.checked)}
              />
              <span>Use this image for all 12 months</span>
            </label>
          </div>

          <div
            style={{
              marginTop: 10,
              padding: 8,
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 6,
              fontSize: 11,
              color: '#3730a3',
              lineHeight: 1.4
            }}
          >
            📐 <strong>Recommended Size:</strong>{' '}
            <span id="artDimHint" style={{ fontWeight: 700 }}>
              {hint}
            </span>{' '}
            (300 DPI)
          </div>
        </div>
      )}

      {/* Vertical Options */}
      {(layout === 'vertical-full' || layout === 'vertical-a4') && (
        <div
          id="verticalOptions"
          style={{
            background: '#f9fafb',
            padding: 10,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            marginBottom: 12
          }}
        >
          <div className="two-col">
            <label>
              Cols
              <select
                id="colCountSelect"
                value={colCount}
                onChange={(e) => onColCountChange(parseInt(e.target.value, 10))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
            <label>
              Labels (comma sep.)
              <input
                id="columnNamesInput"
                type="text"
                value={columnNames.join(', ')}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  onColumnNamesChange(arr);
                }}
              />
            </label>
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Grid Styling */}
      <div className="toggle-row" style={{ marginBottom: 8 }}>
        <input
          id="showWeekNumbersToggle"
          type="checkbox"
          checked={showWeekNumbers}
          onChange={(e) => onShowWeekNumbersChange(e.target.checked)}
        />
        <span>Show ISO Week Numbers</span>
      </div>

      <div className="toggle-row" style={{ marginBottom: 8 }}>
        <input
          id="showGridLinesToggle"
          type="checkbox"
          checked={showGridLines}
          onChange={(e) => onShowGridLinesChange(e.target.checked)}
        />
        <span>Show Grid Lines</span>
      </div>

      <div className="two-col">
        <label>
          Border Weight (px)
          <input
            id="borderWidthInput"
            type="number"
            min="0.1"
            max="10"
            step="0.5"
            value={borderWidth}
            onChange={(e) => onBorderWidthChange(parseFloat(e.target.value) || 1)}
          />
        </label>
        <div>
          <label>Border Colour</label>
          <div className="color-btn-wrapper tmm-btn tmm-btn-primary">
            <span
              className="color-swatch-indicator"
              style={{ backgroundColor: borderColor }}
            />
            Pick Colour
            <input
              id="borderColorInput"
              type="color"
              value={borderColor}
              onChange={(e) => onBorderColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="divider" />

      {layout === 'grid' && (
        <div id="gridSpecificOptions">
          <label>
            Date position
            <select
              id="datePositionSelect"
              value={datePosition}
              onChange={(e) => onDatePositionChange(e.target.value as DatePosition)}
            >
              <option value="top-left">Top left</option>
              <option value="top-right">Top right</option>
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
            </select>
          </label>

          <div className="divider" />

          <label>
            Header style
            <select
              id="headerStyleSelect"
              value={headerStyle}
              onChange={(e) => onHeaderStyleChange(e.target.value as HeaderStyle)}
            >
              <option value="short">Mon, Tue...</option>
              <option value="medium">Mon., Tue...</option>
              <option value="long">Monday, Tuesday...</option>
            </select>
          </label>

          <div className="divider" />
        </div>
      )}

      {/* BINDING MARGIN & GUIDES */}
      <label>
        Binding edge offset
        <select
          id="bindingEdgeSelect"
          value={bindingEdge}
          onChange={(e) => onBindingEdgeChange(e.target.value as BindingEdge)}
        >
          <option value="none">None (Standard)</option>
          <option value="top">Top (+12mm for Wire-O / Spiral)</option>
          <option value="left">Left (+12mm for Side Binding)</option>
        </select>
      </label>

      <div className="toggle-row small" style={{ marginTop: 8 }}>
        <input
          id="showPunchGuideToggle"
          type="checkbox"
          checked={showPunchGuide}
          onChange={(e) => onShowPunchGuideChange(e.target.checked)}
        />
        <span>Show punch hole guides</span>
      </div>
    </section>
  );
};
