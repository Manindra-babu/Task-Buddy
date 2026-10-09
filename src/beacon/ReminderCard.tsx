import React, { useState } from 'react';
import { ReminderEventPayload } from '../shared/types';
import { CATEGORY_LABELS } from '../shared/constants';
import {
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  Play,
  ArrowRight,
  ChevronDown,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import './animations.css';

interface ReminderCardProps {
  payload: ReminderEventPayload;
  onAction: (action: 'start' | 'snooze' | 'done' | 'dismiss', snoozeMinutes?: number) => void;
  onOpenExternalUrl?: (url: string) => void;
  onClose?: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  payload,
  onAction,
  onOpenExternalUrl,
  onClose,
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const { task, reminder, message, remainingText, isOverdue } = payload;

  // Format full deadline date & time: e.g. "Thu, Oct 11, 2026 at 9:00 AM"
  const deadlineDate = new Date(task.deadline_at);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const categoryLabel = CATEGORY_LABELS[task.category] || payload.categoryLabel || 'Task';

  // Priority color styling
  let priorityBadge = {
    label: 'Low',
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
  };
  if (task.priority === 'high' || isOverdue) {
    priorityBadge = {
      label: isOverdue ? 'Overdue' : 'High Priority',
      bg: '#fef2f2',
      text: '#dc2626',
      border: '#fecaca',
    };
  } else if (task.priority === 'medium') {
    priorityBadge = {
      label: 'Medium',
      bg: '#eff6ff',
      text: '#2563eb',
      border: '#bfdbfe',
    };
  }

  // Calculate snooze minutes to tomorrow 9:00 AM
  const getMinutesToTomorrowMorning = (): number => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();
    return Math.max(15, Math.round(diffMs / 60000));
  };

  return (
    <div
      className="animate-card-expand"
      style={{
        width: 340,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: '16px 18px',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        color: '#0f172a',
        userSelect: 'none',
      }}
    >
      {/* Top Header: Brand glyph & title + Category + Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              backgroundColor: isOverdue ? '#fee2e2' : '#eff6ff',
              color: isOverdue ? '#dc2626' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isOverdue ? <AlertTriangle size={12} /> : <Bell size={12} />}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#64748b', textTransform: 'uppercase' }}>
            TaskBuddy / Beacon
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 10,
              backgroundColor: priorityBadge.bg,
              color: priorityBadge.text,
              border: `1px solid ${priorityBadge.border}`,
            }}
          >
            {priorityBadge.label}
          </span>

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
            title="Dismiss reminder"
            aria-label="Dismiss reminder"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Task Title & Category */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {categoryLabel}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isOverdue ? '#dc2626' : '#2563eb',
              backgroundColor: isOverdue ? '#fef2f2' : '#eff6ff',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {remainingText}
          </span>
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.35,
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </h3>
      </div>

      {/* Deadline Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
        <Calendar size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span>Due {formattedDeadline}</span>
      </div>

      {/* Optional User-Defined Next Step */}
      {task.next_action && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 12,
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
          }}
        >
          <ArrowRight size={13} style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 600, color: '#334155' }}>Next step: </span>
            <span style={{ color: '#475569' }}>{task.next_action}</span>
          </div>
        </div>
      )}

      {/* Optional Notes if no next action */}
      {!task.next_action && task.notes && (
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
          {task.notes}
        </p>
      )}

      {/* Snooze Options Popup Menu if toggled */}
      {showSnoozeMenu && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '2px 6px' }}>
            Remind Me Later:
          </span>
          <button
            onClick={() => {
              setShowSnoozeMenu(false);
              onAction('snooze', 15);
            }}
            style={{
              textAlign: 'left',
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#1e293b',
            }}
          >
            In 15 minutes
          </button>
          <button
            onClick={() => {
              setShowSnoozeMenu(false);
              onAction('snooze', 60);
            }}
            style={{
              textAlign: 'left',
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#1e293b',
            }}
          >
            In 1 hour
          </button>
          <button
            onClick={() => {
              setShowSnoozeMenu(false);
              onAction('snooze', getMinutesToTomorrowMorning());
            }}
            style={{
              textAlign: 'left',
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#1e293b',
            }}
          >
            Tomorrow morning (9:00 AM)
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
        {/* Start Task (Primary Action) */}
        <button
          onClick={() => onAction('start')}
          style={{
            flex: '1 1 auto',
            minWidth: 100,
            height: 34,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          <Play size={12} fill="currentColor" />
          Start Task
        </button>

        {/* Optional Open Link (If destination URL exists) */}
        {task.destination_url && (
          <button
            onClick={() => {
              if (task.destination_url && onOpenExternalUrl) {
                onOpenExternalUrl(task.destination_url);
              }
            }}
            style={{
              height: 34,
              padding: '0 10px',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              cursor: 'pointer',
            }}
            title={task.destination_url}
          >
            <ExternalLink size={12} />
            Open Link
          </button>
        )}

        {/* Mark as Done */}
        <button
          onClick={() => onAction('done')}
          style={{
            height: 34,
            padding: '0 10px',
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            cursor: 'pointer',
          }}
          title="Mark task as complete"
        >
          <CheckCircle2 size={13} />
          Done
        </button>

        {/* Remind Me Later (Snooze Trigger) */}
        <button
          onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
          style={{
            height: 34,
            padding: '0 10px',
            backgroundColor: showSnoozeMenu ? '#e2e8f0' : '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
          title="Snooze reminder"
        >
          <Clock size={12} />
          Snooze
          <ChevronDown size={11} />
        </button>
      </div>
    </div>
  );
};
