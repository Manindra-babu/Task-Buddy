import React, { useEffect, useState, useRef } from 'react';
import { BeaconIndicator } from './BeaconIndicator';
import { ReminderCard } from './ReminderCard';
import { ReminderEventPayload, BeaconState, AppSettings } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';
import './animations.css';

export const BeaconWindow: React.FC = () => {
  const [payload, setPayload] = useState<ReminderEventPayload | null>(null);
  const [beaconState, setBeaconState] = useState<BeaconState>('hidden');
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [errorOccurred, setErrorOccurred] = useState<string | null>(null);

  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Add transparent body & root classes
    document.documentElement.classList.add('beacon-window-mode');
    document.body.classList.add('character-window-mode');
    document.body.classList.add('beacon-window-mode');
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.classList.add('beacon-window-mode');

    // Fetch user settings (e.g. animation intensity)
    if (window.taskBuddy) {
      window.taskBuddy.getSettings().then((s) => {
        if (s) setSettings(s);
      });

      // Listen for due reminder
      const unsubReminder = window.taskBuddy.onReminderDue((data) => {
        try {
          setPayload(data);
          setBeaconState('entering');
          setIsCardExpanded(true);
          setErrorOccurred(null);

          setTimeout(() => {
            setBeaconState('expanded');
          }, 350);
        } catch (err: any) {
          setErrorOccurred(err.message || 'Error presenting reminder');
          setBeaconState('error');
        }
      });

      // Listen for test preview
      const unsubPreview = window.taskBuddy.onPreviewTriggered((data) => {
        try {
          setPayload(data);
          setBeaconState('entering');
          setIsCardExpanded(true);
          setErrorOccurred(null);

          setTimeout(() => {
            setBeaconState('expanded');
          }, 350);
        } catch (err: any) {
          setErrorOccurred(err.message || 'Error presenting preview');
          setBeaconState('error');
        }
      });

      return () => {
        unsubReminder();
        unsubPreview();
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      };
    }
  }, []);

  // Keyboard accessibility: Escape dismisses, Enter starts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!payload || beaconState === 'hidden') return;
      if (e.key === 'Escape') {
        handleAction('dismiss');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [payload, beaconState]);

  const handleAction = async (
    action: 'start' | 'snooze' | 'done' | 'dismiss',
    snoozeMinutes?: number
  ) => {
    if (!payload) return;

    if (action === 'done') {
      setBeaconState('completing');
    } else if (action === 'snooze') {
      setBeaconState('snoozed');
    } else {
      setBeaconState('dismissed');
    }

    // Give visual animation a moment to run before hiding
    const delay = action === 'done' ? 700 : 250;

    exitTimeoutRef.current = setTimeout(async () => {
      try {
        if (window.taskBuddy) {
          await window.taskBuddy.handleReminderAction(
            action,
            payload.reminder.id,
            snoozeMinutes
          );
        }
      } catch (err) {
        console.error('Failed to dispatch reminder action:', err);
      } finally {
        setBeaconState('hidden');
        setPayload(null);
      }
    }, delay);
  };

  const handleOpenExternalUrl = (url: string) => {
    if (window.taskBuddy && (window.taskBuddy as any).openExternalUrl) {
      (window.taskBuddy as any).openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  if (beaconState === 'hidden' && !payload) {
    return null;
  }

  const intensityClass = `beacon-intensity-${settings.beaconAnimationIntensity || 'standard'}`;

  // Error Fallback Rendering
  if (errorOccurred) {
    return (
      <div
        className={intensityClass}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '16px 20px',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            maxWidth: 320,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>
            TaskBuddy Reminder Fallback
          </div>
          <div style={{ fontSize: 13, color: '#0f172a', marginBottom: 12 }}>
            {payload?.task.title || 'A deadline reminder is due.'}
          </div>
          <button
            onClick={() => handleAction('dismiss')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={intensityClass}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '16px 18px',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        className={beaconState === 'entering' ? 'animate-beacon-in' : ''}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        {/* Expanded Reminder Card */}
        {payload && isCardExpanded && (
          <ReminderCard
            payload={payload}
            onAction={handleAction}
            onOpenExternalUrl={handleOpenExternalUrl}
            onClose={() => setIsCardExpanded(false)}
          />
        )}

        {/* The Deadline Beacon Indicator */}
        <div style={{ marginBottom: 4 }}>
          <BeaconIndicator
            state={beaconState}
            isOverdue={payload?.isOverdue}
            priority={payload?.task.priority}
            queueCount={payload?.queueCount}
            isExpanded={isCardExpanded}
            onClick={() => setIsCardExpanded(!isCardExpanded)}
            title={payload?.task.title}
          />
        </div>
      </div>
    </div>
  );
};
