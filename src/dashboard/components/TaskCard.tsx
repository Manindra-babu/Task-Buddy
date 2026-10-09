import React from 'react';
import { Task } from '../../shared/types';
import { CATEGORY_LABELS } from '../../shared/constants';
import { formatDeadline, getTimeRemaining } from '../../shared/date-utils';
import { Check, Edit2, Trash2, Calendar, FileText } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onCompleteToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onCompleteToggle,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';
  const remaining = getTimeRemaining(task.deadline_at);
  const formattedDeadline = formatDeadline(task.deadline_at);

  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 10,
        opacity: isCompleted ? 0.65 : 1,
        borderColor: !isCompleted && remaining.isOverdue ? '#fca5a5' : '#e2e8f0',
        backgroundColor:
          !isCompleted && remaining.isOverdue ? '#fffbfb' : '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
        {/* Completion checkbox button */}
        <button
          onClick={() => onCompleteToggle(task)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: isCompleted ? '1px solid #16a34a' : '1px solid #cbd5e1',
            backgroundColor: isCompleted ? '#16a34a' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: 2,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check size={14} color="#ffffff" strokeWidth={3} />}
        </button>

        <div style={{ flex: 1 }}>
          {/* Title */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#0f172a',
              textDecoration: isCompleted ? 'line-through' : 'none',
              marginBottom: 6,
              lineHeight: 1.3,
            }}
          >
            {task.title}
          </div>

          {/* Metadata badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12,
            }}
          >
            <span className="badge badge-category">
              {CATEGORY_LABELS[task.category]}
            </span>

            <span className={`badge badge-${task.priority}`}>
              {task.priority.toUpperCase()}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#64748b',
              }}
            >
              <Calendar size={13} />
              <span>{formattedDeadline}</span>
            </div>

            {!isCompleted && (
              <span
                style={{
                  fontWeight: 600,
                  color: remaining.isOverdue ? '#dc2626' : '#d97706',
                }}
              >
                ({remaining.text})
              </span>
            )}
          </div>

          {/* Next action preview if any */}
          {task.next_action && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#eff6ff',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #dbeafe',
              }}
            >
              <span style={{ fontWeight: 600, color: '#1d4ed8' }}>Next step:</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.next_action}
              </span>
            </div>
          )}

          {/* Notes preview if any */}
          {task.notes && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              <FileText size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.notes}
              </span>
            </div>
          )}

          {/* Destination URL link */}
          {task.destination_url && (
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                onClick={() => {
                  if (task.destination_url && window.taskBuddy?.openExternalUrl) {
                    window.taskBuddy.openExternalUrl(task.destination_url);
                  } else if (task.destination_url) {
                    window.open(task.destination_url, '_blank');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'underline',
                }}
              >
                <span>{task.destination_url}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '5px 8px' }}
          title="Edit Task"
        >
          <Edit2 size={13} />
        </button>

        <button
          onClick={() => onDelete(task)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '5px 8px', color: '#dc2626' }}
          title="Delete Task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
