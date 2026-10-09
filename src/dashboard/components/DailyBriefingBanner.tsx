import React from 'react';
import { Task } from '../../shared/types';
import { Sparkles, X, AlertTriangle, Calendar } from 'lucide-react';
import { formatDeadline } from '../../shared/date-utils';

interface DailyBriefingBannerProps {
  tasks: Task[];
  onDismiss: () => void;
  onSelectTask: (task: Task) => void;
}

export const DailyBriefingBanner: React.FC<DailyBriefingBannerProps> = ({
  tasks,
  onDismiss,
  onSelectTask,
}) => {
  if (tasks.length === 0) return null;

  const nowMs = Date.now();
  const overdueTasks = tasks.filter((t) => new Date(t.deadline_at).getTime() < nowMs);
  const dueTodayTasks = tasks.filter((t) => {
    const d = new Date(t.deadline_at);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate() &&
      d.getTime() >= nowMs
    );
  });

  return (
    <div
      style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>
              Daily Deadline Briefing
            </div>
            <div style={{ fontSize: 13, color: '#3b82f6', marginTop: 2 }}>
              {overdueTasks.length > 0 && `${overdueTasks.length} overdue • `}
              {dueTodayTasks.length > 0 && `${dueTodayTasks.length} due today • `}
              {tasks.length} priority items needing attention
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#60a5fa',
            padding: 4,
          }}
          title="Dismiss briefing"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        {tasks.slice(0, 3).map((t) => {
          const isOverdue = new Date(t.deadline_at).getTime() < nowMs;
          return (
            <div
              key={t.id}
              onClick={() => onSelectTask(t)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dbeafe',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {isOverdue ? (
                <AlertTriangle size={14} color="#dc2626" />
              ) : (
                <Calendar size={14} color="#2563eb" />
              )}
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{t.title}</span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                ({formatDeadline(t.deadline_at)})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
