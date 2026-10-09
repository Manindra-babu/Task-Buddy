import React from 'react';
import { Plus, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  upcomingCount: number;
  onAddTask: () => void;
  onPreviewCharacter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  upcomingCount,
  onAddTask,
  onPreviewCharacter,
}) => {
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 28px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            T
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            TaskBuddy
          </h1>
          <span
            style={{
              fontSize: 12,
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '2px 8px',
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            Desktop Companion
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          {todayStr} • {upcomingCount} upcoming {upcomingCount === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onPreviewCharacter}
          className="btn btn-secondary btn-sm"
          title="Preview 3D Character & Voice"
        >
          <Sparkles size={14} color="#2563eb" />
          Preview Companion
        </button>

        <button onClick={onAddTask} className="btn btn-primary btn-sm">
          <Plus size={16} />
          Add Task
        </button>
      </div>
    </header>
  );
};
