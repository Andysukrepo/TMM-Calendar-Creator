import React, { useEffect, useRef, useState } from 'react';
import {
  ensureGoogleFontLoaded,
  googleFontsByCategory,
  popularFontsByCategory
} from '../data/fonts';
import { FontCategory, TitleAlign } from '../types';

interface TypographyPanelProps {
  titleFontFamily: string;
  titleSize: number;
  titleFontWeight: number;
  titleAlign: TitleAlign;
  titleColor: string;
  onTitleFontFamilyChange: (f: string) => void;
  onTitleSizeChange: (s: number) => void;
  onTitleFontWeightChange: (w: number) => void;
  onTitleAlignChange: (a: TitleAlign) => void;
  onTitleColorChange: (c: string) => void;

  gridFontFamily: string;
  dateSize: number;
  gridFontWeight: number;
  dateColor: string;
  weekdayColor: string;
  weekendHeaderColor: string;
  onGridFontFamilyChange: (f: string) => void;
  onDateSizeChange: (s: number) => void;
  onGridFontWeightChange: (w: number) => void;
  onDateColorChange: (c: string) => void;
  onWeekdayColorChange: (c: string) => void;
  onWeekendHeaderColorChange: (c: string) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({
  titleFontFamily,
  titleSize,
  titleFontWeight,
  titleAlign,
  titleColor,
  onTitleFontFamilyChange,
  onTitleSizeChange,
  onTitleFontWeightChange,
  onTitleAlignChange,
  onTitleColorChange,

  gridFontFamily,
  dateSize,
  gridFontWeight,
  dateColor,
  weekdayColor,
  weekendHeaderColor,
  onGridFontFamilyChange,
  onDateSizeChange,
  onGridFontWeightChange,
  onDateColorChange,
  onWeekdayColorChange,
  onWeekendHeaderColorChange
}) => {
  // Title font search state
  const [titleCategory, setTitleCategory] = useState<FontCategory>('sans-serif');
  const [titleSearch, setTitleSearch] = useState('');
  const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
  const titleSearchContainerRef = useRef<HTMLDivElement | null>(null);

  // Grid font search state
  const [gridCategory, setGridCategory] = useState<FontCategory>('sans-serif');
  const [gridSearch, setGridSearch] = useState('');
  const [gridDropdownOpen, setGridDropdownOpen] = useState(false);
  const gridSearchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        titleSearchContainerRef.current &&
        !titleSearchContainerRef.current.contains(e.target as Node)
      ) {
        setTitleDropdownOpen(false);
      }
      if (
        gridSearchContainerRef.current &&
        !gridSearchContainerRef.current.contains(e.target as Node)
      ) {
        setGridDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectTitleFont = (fontName: string) => {
    ensureGoogleFontLoaded(fontName);
    onTitleFontFamilyChange(`"${fontName}", sans-serif`);
    setTitleSearch(fontName);
    setTitleDropdownOpen(false);
  };

  const handleSelectGridFont = (fontName: string) => {
    ensureGoogleFontLoaded(fontName);
    onGridFontFamilyChange(`"${fontName}", sans-serif`);
    setGridSearch(fontName);
    setGridDropdownOpen(false);
  };

  const filteredTitleFonts = (googleFontsByCategory[titleCategory] || []).filter((f) =>
    f.toLowerCase().includes(titleSearch.toLowerCase())
  );

  const filteredGridFonts = (googleFontsByCategory[gridCategory] || []).filter((f) =>
    f.toLowerCase().includes(gridSearch.toLowerCase())
  );

  return (
    <div className="sidebar-col">
      {/* TITLE (HEADER) TYPOGRAPHY */}
      <section className="panel">
        <h2>Title (Header) Typography</h2>

        <label>
          Title Font Style
          <select
            id="titleFontStyleSelect"
            value={titleCategory}
            onChange={(e) => {
              setTitleCategory(e.target.value as FontCategory);
              setTitleSearch('');
              setTitleDropdownOpen(false);
            }}
          >
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="display">Display</option>
            <option value="handwriting">Handwriting</option>
          </select>
        </label>

        <label>
          Quick Select Font
          <select
            id="titleQuickFontSelect"
            value=""
            onChange={(e) => {
              if (e.target.value) handleSelectTitleFont(e.target.value);
            }}
          >
            <option value="">Choose a popular font...</option>
            {(popularFontsByCategory[titleCategory] || []).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div className="font-search-container" ref={titleSearchContainerRef}>
          <label>Font Family (Google Fonts)</label>
          <input
            id="titleFontSearchInput"
            type="text"
            placeholder="Search title font (e.g. Playfair)"
            autoComplete="off"
            value={titleSearch}
            onChange={(e) => {
              setTitleSearch(e.target.value);
              setTitleDropdownOpen(true);
            }}
            onFocus={() => {
              if (titleSearch) setTitleDropdownOpen(true);
            }}
          />
          {titleDropdownOpen && titleSearch && (
            <div id="titleFontSearchResults" className="font-results-dropdown">
              <div
                className="font-result-use"
                onClick={() => handleSelectTitleFont(titleSearch)}
              >
                Use font: &quot;{titleSearch}&quot;
              </div>
              {filteredTitleFonts.map((f) => (
                <div key={f} onClick={() => handleSelectTitleFont(f)}>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="two-col">
          <label>
            Font Weight
            <select
              id="titleFontWeightSelect"
              value={titleFontWeight}
              onChange={(e) => onTitleFontWeightChange(parseInt(e.target.value, 10))}
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="600">Semi-bold</option>
              <option value="700">Bold</option>
            </select>
          </label>
          <label>
            Size (px)
            <input
              id="titleSizeInput"
              type="number"
              min="16"
              max="96"
              value={titleSize}
              onChange={(e) => onTitleSizeChange(parseInt(e.target.value, 10) || 32)}
            />
          </label>
        </div>

        <div className="setting-row" style={{ marginTop: 10 }}>
          <label>Title Alignment</label>
          <div className="toggle-group" id="titleAlignToggleGroup">
            <button
              type="button"
              className={`btn-toggle ${titleAlign === 'left' ? 'active' : ''}`}
              id="btnAlignLeft"
              onClick={() => onTitleAlignChange('left')}
            >
              Left
            </button>
            <button
              type="button"
              className={`btn-toggle ${titleAlign === 'center' ? 'active' : ''}`}
              id="btnAlignCenter"
              onClick={() => onTitleAlignChange('center')}
            >
              Center
            </button>
            <button
              type="button"
              className={`btn-toggle ${titleAlign === 'right' ? 'active' : ''}`}
              id="btnAlignRight"
              onClick={() => onTitleAlignChange('right')}
            >
              Right
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Title Colour</label>
          <div className="color-btn-wrapper tmm-btn tmm-btn-primary">
            <span
              className="color-swatch-indicator"
              style={{ backgroundColor: titleColor }}
            />
            Pick Colour
            <input
              id="titleColorInput"
              type="color"
              value={titleColor}
              onChange={(e) => onTitleColorChange(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* MIDDLE CIRCULAR LOGO SHOWCASE */}
      <div className="panel brand-middle-badge">
        <div className="brand-center-circle">
          <img
            src="/logo.png"
            alt="This Man Makes Logo"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* CALENDAR GRID & DATES TYPOGRAPHY */}
      <section className="panel">
        <h2>Dates &amp; Grid Typography</h2>

        <label>
          Dates Font Style
          <select
            id="gridFontStyleSelect"
            value={gridCategory}
            onChange={(e) => {
              setGridCategory(e.target.value as FontCategory);
              setGridSearch('');
              setGridDropdownOpen(false);
            }}
          >
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="display">Display</option>
            <option value="handwriting">Handwriting</option>
          </select>
        </label>

        <label>
          Quick Select Font
          <select
            id="gridQuickFontSelect"
            value=""
            onChange={(e) => {
              if (e.target.value) handleSelectGridFont(e.target.value);
            }}
          >
            <option value="">Choose a popular font...</option>
            {(popularFontsByCategory[gridCategory] || []).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div className="font-search-container" ref={gridSearchContainerRef}>
          <label>Font Family (Google Fonts)</label>
          <input
            id="gridFontSearchInput"
            type="text"
            placeholder="Search dates font (e.g. Inter)"
            autoComplete="off"
            value={gridSearch}
            onChange={(e) => {
              setGridSearch(e.target.value);
              setGridDropdownOpen(true);
            }}
            onFocus={() => {
              if (gridSearch) setGridDropdownOpen(true);
            }}
          />
          {gridDropdownOpen && gridSearch && (
            <div id="gridFontSearchResults" className="font-results-dropdown">
              <div
                className="font-result-use"
                onClick={() => handleSelectGridFont(gridSearch)}
              >
                Use font: &quot;{gridSearch}&quot;
              </div>
              {filteredGridFonts.map((f) => (
                <div key={f} onClick={() => handleSelectGridFont(f)}>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="two-col">
          <label>
            Font Weight
            <select
              id="gridFontWeightSelect"
              value={gridFontWeight}
              onChange={(e) => onGridFontWeightChange(parseInt(e.target.value, 10))}
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="600">Semi-bold</option>
              <option value="700">Bold</option>
            </select>
          </label>
          <label>
            Date Size (px)
            <input
              id="dateSizeInput"
              type="number"
              min="10"
              max="36"
              value={dateSize}
              onChange={(e) => onDateSizeChange(parseInt(e.target.value, 10) || 14)}
            />
          </label>
        </div>

        <div className="two-col" style={{ marginTop: 8 }}>
          <div>
            <label>Date Colour</label>
            <div className="color-btn-wrapper tmm-btn tmm-btn-primary">
              <span
                className="color-swatch-indicator"
                style={{ backgroundColor: dateColor }}
              />
              Pick Colour
              <input
                id="dateColorInput"
                type="color"
                value={dateColor}
                onChange={(e) => onDateColorChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>Weekday Colour</label>
            <div className="color-btn-wrapper tmm-btn tmm-btn-primary">
              <span
                className="color-swatch-indicator"
                style={{ backgroundColor: weekdayColor }}
              />
              Pick Colour
              <input
                id="weekdayColorInput"
                type="color"
                value={weekdayColor}
                onChange={(e) => onWeekdayColorChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Weekend Header Colour</label>
          <div className="color-btn-wrapper tmm-btn tmm-btn-primary">
            <span
              className="color-swatch-indicator"
              style={{ backgroundColor: weekendHeaderColor }}
            />
            Pick Colour
            <input
              id="weekendHeaderColorInput"
              type="color"
              value={weekendHeaderColor}
              onChange={(e) => onWeekendHeaderColorChange(e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
