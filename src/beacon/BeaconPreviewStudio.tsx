import React, { useState } from 'react';
import { BeaconIndicator } from './BeaconIndicator';
import { ReminderCard } from './ReminderCard';
import { BeaconState, ReminderEventPayload } from '../shared/types';
import './animations.css';

export const BeaconPreviewStudio: React.FC = () => {
  const [activeState, setActiveState] = useState<BeaconState>('expanded');
  const [isOverdue, setIsOverdue] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [intensity, setIntensity] = useState<'subdued' | 'standard' | 'vibrant' | 'reduced'>('standard');
  const [isExpanded, setIsExpanded] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const mockPayload: ReminderEventPayload = {
    reminder: {
      id: 'rem_preview',
      task_id: 'task_preview',
      reminder_type: 'deadline_day',
      scheduled_at: new Date().toISOString(),
      status: 'scheduled',
      delivered_at: null,
      snoozed_until: null,
      attempt_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    task: {
      id: 'task_preview',
      title: 'Devpost Hackathon Final Submission',
      category: 'hackathons',
      deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      priority,
      status: 'pending',
      notes: 'Ensure video demo link is valid and all team members are listed.',
      next_action: 'Finish the final demo and verify the submission.',
      destination_url: 'https://devpost.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    },
    message: 'Hackathon submission is due in 2 days. Finish the final demo and verify the submission.',
    categoryLabel: 'Hackathons',
    isOverdue,
    remainingText: isOverdue ? 'Overdue by 2 hours' : 'Due in 2 days',
    queueCount: 2,
  };

  const addLog = (msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 8));
  };

  const handleAction = (action: 'start' | 'snooze' | 'done' | 'dismiss', snoozeMinutes?: number) => {
    addLog(`Action triggered: ${action}${snoozeMinutes ? ` (${snoozeMinutes}m)` : ''}`);
    if (action === 'done') {
      setActiveState('completing');
      setTimeout(() => setActiveState('hidden'), 1200);
    } else if (action === 'snooze') {
      setActiveState('snoozed');
    } else if (action === 'dismiss') {
      setActiveState('dismissed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '32px 40px',
        color: '#0f172a',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            TaskBuddy: The Deadline Beacon Studio
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
            Interactive state verification for the lightweight, non-character desktop beacon.
          </p>
        </div>

        {/* Controls Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* State Selectors */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Beacon State
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['signal', 'entering', 'expanded', 'completing', 'hidden'] as BeaconState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setActiveState(st);
                    addLog(`State changed to: ${st}`);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    backgroundColor: activeState === st ? '#2563eb' : '#f1f5f9',
                    color: activeState === st ? '#ffffff' : '#334155',
                    borderColor: activeState === st ? '#2563eb' : '#cbd5e1',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency & Intensity */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Urgency & Intensity
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isOverdue}
                  onChange={(e) => setIsOverdue(e.target.checked)}
                />
                Overdue
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <option value="subdued">Subdued</option>
                <option value="standard">Standard</option>
                <option value="vibrant">Vibrant</option>
                <option value="reduced">Reduced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Desktop Preview Canvas */}
        <div
          style={{
            backgroundColor: '#0f172a',
            borderRadius: 16,
            padding: 32,
            minHeight: 380,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
          }}
          className={`beacon-intensity-${intensity}`}
        >
          {/* Subtle wallpaper gradient simulation */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Windows Desktop Simulation (Bottom-Right Work Area)
          </div>

          {activeState !== 'hidden' && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              {isExpanded && (
                <ReminderCard
                  payload={mockPayload}
                  onAction={handleAction}
                  onOpenExternalUrl={(url) => addLog(`Open Link: ${url}`)}
                  onClose={() => setIsExpanded(false)}
                />
              )}

              <BeaconIndicator
                state={activeState}
                isOverdue={isOverdue}
                priority={priority}
                queueCount={mockPayload.queueCount}
                isExpanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
              />
            </div>
          )}
        </div>

        {/* Action Event Log */}
        {log.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              Event Log:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
