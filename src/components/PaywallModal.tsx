import React, { useState } from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  payhipUrl: string;
  onActivate: (key: string) => Promise<boolean>;
  checking: boolean;
  message: { text: string; type: 'success' | 'error' | 'info' | '' };
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  payhipUrl,
  onActivate,
  checking,
  message
}) => {
  const [keyInput, setKeyInput] = useState('');

  if (!isOpen) return null;

  const handleManualActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const ok = await onActivate(keyInput.trim());
    if (ok) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="tmm-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tmm-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="tmm-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="tmm-paywall-badge">PRO LICENSE</div>
        <h2 className="tmm-paywall-title">Unlock TMM Calendar Creator PRO</h2>
        <p className="tmm-paywall-subtitle">
          Create, customize, and export high-resolution printable calendars for your home, craft business, or clients.
        </p>

        {/* Feature comparison / benefits */}
        <div className="tmm-paywall-features">
          <div className="tmm-paywall-feature-item">
            <span className="feat-icon">✨</span>
            <div>
              <strong>Remove DEMO Watermark</strong>
              <p>Clean, pristine output ready for printing or commercial selling.</p>
            </div>
          </div>
          <div className="tmm-paywall-feature-item">
            <span className="feat-icon">📑</span>
            <div>
              <strong>Full-Year Batch PDF Export</strong>
              <p>Download all 12 months in a single high-resolution PDF with one click.</p>
            </div>
          </div>
          <div className="tmm-paywall-feature-item">
            <span className="feat-icon">📐</span>
            <div>
              <strong>Print-Ready 300 DPI &amp; Vector SVGs</strong>
              <p>Crisp rendering for A4, A3 wall calendars, slim planners, and US Letter.</p>
            </div>
          </div>
          <div className="tmm-paywall-feature-item">
            <span className="feat-icon">⚡</span>
            <div>
              <strong>Instant Key Delivery on Payhip</strong>
              <p>Your license key is generated immediately after purchase and emailed to you.</p>
            </div>
          </div>
        </div>

        {/* Primary Checkout CTA */}
        <div className="tmm-paywall-cta-box">
          <a
            href={payhipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tmm-btn-payhip-checkout"
          >
            <span>Get PRO License on Payhip</span>
            <span className="arrow">→</span>
          </a>
          <span className="tmm-paywall-guarantee">
            🔒 Secure checkout powered by Payhip &amp; thismanmakes.co.uk
          </span>
        </div>

        {/* Secondary: Already have a key? */}
        <div className="tmm-paywall-existing-key">
          <div className="tmm-paywall-divider">
            <span>Already purchased? Enter your key</span>
          </div>

          <form onSubmit={handleManualActivate} className="tmm-paywall-form">
            <input
              type="text"
              placeholder="Paste your Payhip license key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              disabled={checking}
            />
            <button
              type="submit"
              className="tmm-btn tmm-btn-primary"
              disabled={checking || !keyInput.trim()}
            >
              {checking ? 'Activating...' : 'Activate'}
            </button>
          </form>

          {message.text && (
            <p className={`tmm-paywall-msg ${message.type}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
