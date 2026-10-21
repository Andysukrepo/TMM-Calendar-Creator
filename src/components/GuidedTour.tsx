import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TOUR_STEPS, TOTAL_TOUR_SECONDS } from '../data/tourSteps';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onPerformAction: (actionId: string) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onPerformAction
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [stepSecondsElapsed, setStepSecondsElapsed] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [performedActions, setPerformedActions] = useState<Record<string, boolean>>({});

  const cardRef = useRef<HTMLDivElement | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Calculate cumulative elapsed seconds
  const totalSecondsElapsed = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      sum += TOUR_STEPS[i].durationSeconds;
    }
    return sum + stepSecondsElapsed;
  }, [currentStepIndex, stepSecondsElapsed]);

  const totalSecondsRemaining = Math.max(0, TOTAL_TOUR_SECONDS - totalSecondsElapsed);

  // Measure and scroll target element
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 300); // recheck after scroll

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen, currentStepIndex, currentStep.targetSelector]);

  // Step countdown timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setStepSecondsElapsed((prev) => {
        if (prev + 1 >= currentStep.durationSeconds) {
          // Advance to next step or finish
          if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            // Tour finished
            setIsPlaying(false);
            return currentStep.durationSeconds;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStepIndex, currentStep.durationSeconds]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setStepSecondsElapsed(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStepSecondsElapsed(0);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    setStepSecondsElapsed(0);
  };

  const handleDemoClick = () => {
    if (currentStep.demoActionId) {
      onPerformAction(currentStep.demoActionId);
      setPerformedActions((prev) => ({ ...prev, [currentStep.id]: true }));
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const overallProgressPercent = Math.min(100, (totalSecondsElapsed / TOTAL_TOUR_SECONDS) * 100);
  const stepProgressPercent = Math.min(100, (stepSecondsElapsed / currentStep.durationSeconds) * 100);

  // Position calculation for tooltip card
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      };
    }

    const margin = 18;
    const cardWidth = 420;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 10001
      };
    }

    let top = targetRect.top;
    let left = targetRect.right + margin;

    // Check if right space is sufficient
    if (left + cardWidth > window.innerWidth - 20) {
      // Try left side
      if (targetRect.left - cardWidth - margin > 20) {
        left = targetRect.left - cardWidth - margin;
      } else {
        // Place below
        left = Math.max(20, Math.min(targetRect.left, window.innerWidth - cardWidth - 20));
        top = targetRect.bottom + margin;
      }
    }

    // Keep within vertical viewport bounds
    const maxTop = window.innerHeight - 440;
    top = Math.max(70, Math.min(top, maxTop));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 10001
    };
  };

  return (
    <div className="tmm-tour-root" role="dialog" aria-modal="true" aria-label="180-Second Guided Tour">
      {/* Dark overlay backdrop */}
      <div className="tmm-tour-backdrop" onClick={onClose} />

      {/* Target element spotlight frame */}
      {targetRect && (
        <div
          className="tmm-tour-spotlight"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        >
          <div className="tmm-tour-spotlight-pulse" />
        </div>
      )}

      {/* Floating Tour Tooltip Card */}
      <div ref={cardRef} className="tmm-tour-card" style={getTooltipStyle()}>
        {/* Top Header bar with Category, Step count, and Timer */}
        <div className="tmm-tour-card-header">
          <div className="tmm-tour-badge-group">
            <span className="tmm-tour-pill-category">{currentStep.category}</span>
            <span className="tmm-tour-pill-step">
              Step {currentStep.stepNumber} of {TOUR_STEPS.length}
            </span>
          </div>

          <div className="tmm-tour-timer-widget" title="180-second tour countdown">
            <span className="tmm-tour-timer-clock">⏱️ {formatTime(totalSecondsRemaining)}</span>
            <button
              type="button"
              className="tmm-tour-play-pause-btn"
              onClick={() => setIsPlaying((p) => !p)}
              title={isPlaying ? 'Pause auto-play (Space)' : 'Resume auto-play (Space)'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              type="button"
              className="tmm-tour-close-btn"
              onClick={onClose}
              title="Exit Guided Tour (Esc)"
              aria-label="Exit Tour"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dual Progress Bars: Total 180s + Step Progress */}
        <div className="tmm-tour-progress-wrapper" title={`Tour Progress: ${Math.round(overallProgressPercent)}%`}>
          <div className="tmm-tour-progress-bar">
            <div
              className="tmm-tour-progress-fill overall"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
          <div className="tmm-tour-subprogress-bar">
            <div
              className="tmm-tour-progress-fill step"
              style={{ width: `${stepProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="tmm-tour-body">
          <h3 className="tmm-tour-title">{currentStep.title}</h3>
          <p className="tmm-tour-desc">{currentStep.description}</p>

          {/* Highlights checklist */}
          <ul className="tmm-tour-highlights">
            {currentStep.keyHighlights.map((hl, i) => (
              <li key={i}>
                <span className="tmm-tour-check">✓</span> {hl}
              </li>
            ))}
          </ul>

          {/* Interactive Live Demo Trigger */}
          {currentStep.demoActionLabel && (
            <div className="tmm-tour-demo-zone">
              <button
                type="button"
                className={`tmm-tour-demo-btn ${performedActions[currentStep.id] ? 'applied' : ''}`}
                onClick={handleDemoClick}
              >
                {performedActions[currentStep.id] ? '✓ Applied Demo Effect' : currentStep.demoActionLabel}
              </button>
              <span className="tmm-tour-demo-hint">Click to see it live on the canvas</span>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="tmm-tour-footer">
          {/* Step dots */}
          <div className="tmm-tour-dots" role="tablist">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`tmm-tour-dot ${idx === currentStepIndex ? 'active' : ''} ${
                  idx < currentStepIndex ? 'completed' : ''
                }`}
                onClick={() => handleJumpToStep(idx)}
                title={`Jump to step ${idx + 1}: ${step.title}`}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="tmm-tour-nav-buttons">
            <button
              type="button"
              className="tmm-btn tmm-btn-ghost small"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              Previous
            </button>

            <button
              type="button"
              className="tmm-btn tmm-btn-primary small"
              onClick={handleNext}
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour 🚀' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
