import React from 'react';
import { ReminderEventPayload } from '../shared/types';
import { Calendar, Clock, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface SpeechBubbleProps {
  payload: ReminderEventPayload;
  onAction: (action: 'start' | 'snooze' | 'done' | 'dismiss') => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ payload, onAction }) => {
  return (
    <div
      className="no-drag-region"
      style={{
        width: '320px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px 18px',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        animation: 'fadeInSlide 0.25s ease-out forwards',
      }}
    >
      {/* Top Header: Brand icon & title + Close Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={13} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            TaskBuddy
          </span>
          {payload.queueCount && payload.queueCount > 1 ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              +{payload.queueCount - 1} more
            </span>
          ) : null}
        </div>

        <button
          onClick={() => onAction('dismiss')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 6,
          }}
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Reminder Headline */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
        {payload.message}
      </div>

      {/* Task notes if present */}
      {payload.task.notes ? (
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
          {payload.task.notes}
        </div>
      ) : null}

      {/* Info Pills */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backgroundColor: '#f8fafc',
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid #f1f5f9',
          fontSize: 11.5,
          color: '#475569',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} color={payload.isOverdue ? '#dc2626' : '#2563eb'} />
          <span>
            <strong>Deadline:</strong> {payload.remainingText}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={12} color="#64748b" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>Task:</strong> {payload.task.title}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button
          onClick={() => onAction('start')}
          className="btn btn-primary"
          style={{
            flex: 1.2,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 8,
          }}
        >
          Open
        </button>

        <button
          onClick={() => onAction('snooze')}
          className="btn btn-secondary"
          style={{
            flex: 1,
            padding: '6px 8px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Snooze
        </button>

        <button
          onClick={() => onAction('done')}
          className="btn btn-secondary"
          style={{
            flex: 1.1,
            padding: '6px 8px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            color: '#16a34a',
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
          }}
        >
          <CheckCircle2 size={12} />
          Mark Done
        </button>
      </div>
    </div>
  );
};
