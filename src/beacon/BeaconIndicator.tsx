import React from 'react';
import { BeaconState } from '../shared/types';
import './animations.css';

interface BeaconIndicatorProps {
  state: BeaconState;
  isOverdue?: boolean;
  priority?: 'low' | 'medium' | 'high';
  queueCount?: number;
  isExpanded?: boolean;
  onClick?: () => void;
  title?: string;
}

export const BeaconIndicator: React.FC<BeaconIndicatorProps> = ({
  state,
  isOverdue = false,
  priority = 'medium',
  queueCount = 1,
  isExpanded = false,
  onClick,
  title = 'TaskBuddy Beacon',
}) => {
  // Determine color scheme based on status
  let theme = {
    bg: '#0f172a',
    border: '#1e293b',
    coreColor: '#38bdf8', // Luminous sky blue
    ringColor: 'rgba(56, 189, 248, 0.45)',
    statusLabel: 'Active',
  };

  if (state === 'completing') {
    theme = {
      bg: '#064e3b',
      border: '#047857',
      coreColor: '#34d399', // Emerald
      ringColor: 'rgba(52, 211, 153, 0.55)',
      statusLabel: 'Completed',
    };
  } else if (isOverdue || priority === 'high') {
    theme = {
      bg: '#450a0a',
      border: '#b91c1c',
      coreColor: '#f87171', // Ruby/Red
      ringColor: 'rgba(248, 113, 113, 0.55)',
      statusLabel: isOverdue ? 'Overdue' : 'High Priority',
    };
  } else if (state === 'signal') {
    theme = {
      bg: '#451a03',
      border: '#d97706',
      coreColor: '#fbbf24', // Amber
      ringColor: 'rgba(251, 191, 36, 0.55)',
      statusLabel: 'Approaching',
    };
  }

  const isCompleting = state === 'completing';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      title={isExpanded ? 'Collapse reminder card' : 'Expand reminder card'}
      aria-label={`Deadline Beacon - ${theme.statusLabel}`}
      style={{
        position: 'relative',
        width: 52,
        height: 52,
        borderRadius: '50%',
        backgroundColor: theme.bg,
        border: `2px solid ${theme.border}`,
        boxShadow: `0 8px 24px rgba(15, 23, 42, 0.35), 0 0 16px ${theme.ringColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
        outline: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Outer Pulse Ring */}
      <div
        className={isCompleting ? 'animate-beacon-complete' : 'animate-beacon-ring'}
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: `2px solid ${theme.coreColor}`,
          pointerEvents: 'none',
        }}
      />

      {/* Second Harmonic Ring */}
      {!isCompleting && (
        <div
          className="animate-beacon-ring"
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1.5px solid ${theme.coreColor}`,
            animationDelay: '1.2s',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Luminous Central Core Dot */}
      <div
        className={isCompleting ? 'animate-beacon-complete' : 'animate-beacon-core'}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: theme.coreColor,
          color: theme.coreColor,
          zIndex: 2,
        }}
      />

      {/* Inner geometric beacon halo */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme.coreColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: 'absolute',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
      </svg>

      {/* Multiple queued reminders counter badge */}
      {queueCount > 1 && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            zIndex: 3,
          }}
        >
          +{queueCount - 1}
        </div>
      )}
    </div>
  );
};
