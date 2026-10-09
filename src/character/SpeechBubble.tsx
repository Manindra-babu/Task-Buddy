import React from 'react';
import { ReminderEventPayload } from '../shared/types';
import { CheckCircle2, Clock, Play, X, Bell } from 'lucide-react';

interface SpeechBubbleProps {
  payload: ReminderEventPayload;
  onAction: (action: 'start' | 'snooze' | 'done' | 'dismiss') => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ payload, onAction }) => {
  return (
    <div
      className="speech-bubble no-drag-region"
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        background: '#ffffff',
        borderRadius: 14,
        padding: '16px',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
        border: '1px solid #e2e8f0',
        zIndex: 50,
      }}
    >
      {/* Header with category and dismiss button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            {payload.categoryLabel}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: payload.isOverdue ? '#dc2626' : '#d97706',
            }}
          >
            {payload.remainingText}
          </span>
          {payload.queueCount && payload.queueCount > 1 && (
            <span
              style={{
                fontSize: 11,
                background: '#f1f5f9',
                color: '#475569',
                padding: '2px 6px',
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              +{payload.queueCount - 1} more
            </span>
          )}
        </div>
        <button
          onClick={() => onAction('dismiss')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            borderRadius: 4,
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      {/* Task title */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {payload.task.title}
      </div>

      {/* Spoken message */}
      <div
        style={{
          fontSize: 13,
          color: '#475569',
          lineHeight: 1.45,
          marginBottom: 14,
        }}
      >
        {payload.message}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          onClick={() => onAction('start')}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, minWidth: 90 }}
        >
          <Play size={13} />
          Start
        </button>

        <button
          onClick={() => onAction('snooze')}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, minWidth: 100 }}
        >
          <Clock size={13} />
          Remind Later
        </button>

        <button
          onClick={() => onAction('done')}
          className="btn btn-secondary btn-sm"
          style={{
            flex: 1,
            minWidth: 80,
            color: '#16a34a',
            borderColor: '#bbf7d0',
            background: '#f0fdf4',
          }}
        >
          <CheckCircle2 size={13} />
          Done
        </button>
      </div>
    </div>
  );
};
