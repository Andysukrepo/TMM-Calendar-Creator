import React from 'react';
import { MONTH_NAMES, MONTH_SHORT_NAMES } from '../data/holidays';
import { CalendarState } from '../types';
import { CalendarGrid } from './CalendarGrid';
import { CalendarVertical } from './CalendarVertical';

interface PreviewCardProps {
  state: CalendarState;
  isPro: boolean;
  onSelectMonth: (m: number) => void;
  calendarWrapperRef: React.RefObject<HTMLDivElement>;
  onOpenPaywall?: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  state,
  isPro,
  onSelectMonth,
  calendarWrapperRef,
  onOpenPaywall
}) => {
  const currentImg = state.monthlyImages[state.month];
  const isSlim = state.layout === 'vertical-slim';
  const hasArtHeader = state.artRatio !== 'none';

  // Wrapper class list
  const wrapperClasses = ['calendar-wrapper'];
  if (isSlim) wrapperClasses.push('slim-mode');
  if (hasArtHeader) wrapperClasses.push('has-art-header');
  if (state.bindingEdge === 'top') wrapperClasses.push('binding-top');
  if (state.bindingEdge === 'left') wrapperClasses.push('binding-left');

  // Punch holes count
  const punchCount = state.bindingEdge === 'top' ? 24 : 18;

  const titleStyles: React.CSSProperties = {
    fontFamily: state.titleFontFamily,
    color: state.titleColor,
    textAlign: state.titleAlign,
    marginBottom: 14
  };

  const titleHeadingStyles: React.CSSProperties = {
    fontSize: `${state.titleSize}px`,
    fontWeight: state.titleFontWeight,
    margin: 0
  };

  return (
    <section className="preview-card">
      <header className="preview-header">
        <div>
          <h2 id="previewTitle">Calendar preview</h2>
          <p id="previewSubtitle">
            Click any month below to view, upload artwork, and edit.
          </p>
        </div>

        {/* 12-MONTH QUICK STRIP TABS */}
        <div id="monthStripBar" className="month-strip-bar">
          {MONTH_SHORT_NAMES.map((name, idx) => {
            const isActive = idx === state.month;
            const hasArt = !!state.monthlyImages[idx];
            let btnClass = 'strip-btn';
            if (isActive) btnClass += ' active';
            if (hasArt) btnClass += ' has-art';

            return (
              <button
                key={name}
                type="button"
                className={btnClass}
                title={`Switch to ${name}`}
                onClick={() => onSelectMonth(idx)}
              >
                <span>{name}</span>
                <span className="strip-dot" />
              </button>
            );
          })}
        </div>
      </header>

      {/* CALENDAR WRAPPER (Paper simulation & print/export target) */}
      <div
        ref={calendarWrapperRef}
        className={wrapperClasses.join(' ')}
        id="calendarWrapper"
        style={{
          backgroundColor: state.transparentBg ? 'transparent' : '#ffffff'
        }}
      >
        {/* DEMO Watermark if not PRO */}
        {!isPro && (
          <div
            className="demo-watermark interactive"
            id="demoWatermark"
            onClick={onOpenPaywall}
            title="Click to Unlock PRO on Payhip"
          >
            DEMO
          </div>
        )}

        {/* PUNCH HOLE GUIDES */}
        {state.showPunchGuide && state.bindingEdge !== 'none' && (
          <div className={`punch-guide-container punch-guide-${state.bindingEdge}`}>
            {Array.from({ length: punchCount }).map((_, i) => (
              <span key={i} className="punch-hole" />
            ))}
          </div>
        )}

        {/* TOP ARTWORK HEADER */}
        {hasArtHeader && (
          <div
            className={`art-display-zone ratio-${state.artRatio} ${currentImg ? 'has-photo' : ''}`}
          >
            {currentImg ? (
              <img src={currentImg} alt={`Artwork for ${MONTH_NAMES[state.month]}`} />
            ) : (
              <span className="art-placeholder-text">
                🖼️{' '}
                <b>
                  {state.artRatio === 'one-third'
                    ? '1/3 Banner Artwork Area'
                    : '1/2 Page Artwork Area'}
                </b>
                <br />
                Upload an image or leave blank for a craft illustration area.
              </span>
            )}
          </div>
        )}

        {/* TITLE HEADER */}
        <div style={titleStyles}>
          <h2 style={titleHeadingStyles}>
            {MONTH_NAMES[state.month]} {state.year}
          </h2>
        </div>

        {/* CALENDAR CONTENT */}
        {state.layout === 'grid' ? (
          <CalendarGrid state={state} />
        ) : (
          <CalendarVertical state={state} />
        )}

        {/* FOOTER LEGEND */}
        <footer className="preview-footer">
          <div>
            <span className="legend-dot bank" /> Holiday
          </div>
          <div>
            <span className="legend-dot special" /> Observance
          </div>
          <div>
            <span className="legend-moon-icons">
              <span className="moon-circle moon-new" title="New" />
              <span className="moon-circle moon-first" title="First Quarter" />
              <span className="moon-circle moon-last" title="Last Quarter" />
              <span className="moon-circle moon-full" title="Full" />
            </span>{' '}
            Moon cycle
          </div>
        </footer>
      </div>
    </section>
  );
};
