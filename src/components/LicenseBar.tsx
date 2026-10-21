import React, { useEffect, useState } from 'react';

interface LicenseBarProps {
  isPro: boolean;
  onActivate: (key: string) => Promise<boolean>;
  onDeactivate: () => void;
  checking: boolean;
  message: { text: string; type: 'success' | 'error' | 'info' | '' };
  onOpenPaywall?: () => void;
  payhipUrl?: string;
}

export const LicenseBar: React.FC<LicenseBarProps> = ({
  isPro,
  onActivate,
  onDeactivate,
  checking,
  message,
  onOpenPaywall,
  payhipUrl
}) => {
  const [licenseKey, setLicenseKey] = useState<string>(() => {
    return localStorage.getItem('tmm_license_key') || '';
  });
  const [hideKey, setHideKey] = useState<boolean>(isPro);

  // Sync state if cleared from outside
  useEffect(() => {
    if (!isPro && !localStorage.getItem('tmm_license_key')) {
      setLicenseKey('');
    }
  }, [isPro]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    const ok = await onActivate(licenseKey.trim());
    if (ok) {
      setHideKey(true);
    }
  };

  const handleClear = () => {
    setLicenseKey('');
    onDeactivate();
  };

  return (
    <section id="licenseBar" className="license-bar">
      <div className="license-bar-inner">
        <span className="license-label">Have a license key?</span>
        {isPro && <span id="licenseStatus" className="license-status">ACTIVE</span>}

        <input
          id="licenseInput"
          type={hideKey ? 'password' : 'text'}
          placeholder="Enter your license key"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleActivate();
          }}
        />

        {!isPro ? (
          <>
            <button
              id="activateLicenseBtn"
              className="tmm-btn tmm-btn-primary small"
              onClick={handleActivate}
              disabled={checking || !licenseKey.trim()}
            >
              {checking ? 'Checking...' : 'Activate'}
            </button>

            {onOpenPaywall ? (
              <button
                type="button"
                className="tmm-btn tmm-btn-payhip-link small"
                onClick={onOpenPaywall}
                title="Purchase a license on Payhip"
              >
                💳 Buy License
              </button>
            ) : payhipUrl ? (
              <a
                href={payhipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tmm-btn tmm-btn-payhip-link small"
                title="Purchase a license on Payhip"
              >
                💳 Buy on Payhip
              </a>
            ) : null}
          </>
        ) : (
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <button
              id="toggleKeyBtn"
              className="tmm-btn tmm-btn-blue small"
              onClick={() => setHideKey(!hideKey)}
              title={hideKey ? 'Show license key' : 'Mask license key'}
            >
              {hideKey ? 'Show Key' : 'Hide Key'}
            </button>

            <button
              type="button"
              id="clearLicenseBtn"
              className="tmm-btn tmm-btn-ghost small"
              onClick={handleClear}
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              title="Deactivate license and return to Demo mode for testing"
            >
              Clear / Reset
            </button>
          </div>
        )}

        {message.text && (
          <span className={`license-message ${message.type}`}>
            {message.text}
          </span>
        )}
      </div>
    </section>
  );
};
