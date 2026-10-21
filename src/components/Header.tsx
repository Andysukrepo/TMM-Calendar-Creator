import React from 'react';

interface HeaderProps {
  onStartTour: () => void;
  isTourActive?: boolean;
  onOpenPaywall?: () => void;
  isPro?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onStartTour,
  isTourActive,
  onOpenPaywall,
  isPro
}) => {
  return (
    <header className="tmm-header">
      <div className="tmm-logo-title">
        <div className="tmm-logo-circle">
          <img
            src="/logo.png"
            alt="Logo"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <h1>Calendar Creator by This Man Makes</h1>
          <p className="subtitle">
            Create monthly printable &amp; digital calendars
          </p>
        </div>
      </div>

      <div className="tmm-header-actions">
        {!isPro && onOpenPaywall && (
          <button
            type="button"
            className="tmm-header-upgrade-btn"
            onClick={onOpenPaywall}
            title="Unlock High-Res Exports & Batch Downloads on Payhip"
          >
            <span>⭐ Unlock PRO</span>
          </button>
        )}

        <button
          type="button"
          className={`tmm-tour-launch-btn ${isTourActive ? 'active' : ''}`}
          onClick={onStartTour}
          title="Start interactive 180-second guided walkthrough"
        >
          <span className="tour-icon">🎯</span>
          <span className="tour-text">180s Tour</span>
          <span className="tour-badge">3 min</span>
        </button>
      </div>
    </header>
  );
};
