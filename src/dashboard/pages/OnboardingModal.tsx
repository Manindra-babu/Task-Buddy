import React, { useState } from 'react';
import { AppSettings } from '../../shared/types';
import { Sparkles, Volume2, Moon, Clock, Rocket, Calendar } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onComplete: (updatedSettings: Partial<AppSettings>) => Promise<void>;
  onPreviewCharacter: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onComplete,
  onPreviewCharacter,
}) => {
  const [twoDay, setTwoDay] = useState(settings.defaultReminderTwoDay);
  const [oneDay, setOneDay] = useState(settings.defaultReminderOneDay);
  const [deadlineDay, setDeadlineDay] = useState(settings.defaultReminderDeadlineDay);
  const [defaultTime, setDefaultTime] = useState(settings.defaultDeadlineTime);
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(settings.quietHoursEnabled);
  const [quietHoursStart, setQuietHoursStart] = useState(settings.quietHoursStart);
  const [quietHoursEnd, setQuietHoursEnd] = useState(settings.quietHoursEnd);
  const [startupEnabled, setStartupEnabled] = useState(settings.startupEnabled);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await onComplete({
        defaultReminderTwoDay: twoDay,
        defaultReminderOneDay: oneDay,
        defaultReminderDeadlineDay: deadlineDay,
        defaultDeadlineTime: defaultTime,
        voiceEnabled,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        startupEnabled,
        onboardingCompleted: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 8,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            T
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            Welcome to TaskBuddy: The Deadline Beacon!
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
            Quiet by default, luminous when due. Your lightweight desktop deadline indicator for tests, hackathons, and reviews.
          </p>
        </div>

        {/* Configuration Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Reminder Cadence */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Clock size={15} color="#2563eb" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Default Reminder Schedule
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={twoDay}
                  onChange={(e) => setTwoDay(e.target.checked)}
                />
                2 days before
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={oneDay}
                  onChange={(e) => setOneDay(e.target.checked)}
                />
                1 day before
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deadlineDay}
                  onChange={(e) => setDeadlineDay(e.target.checked)}
                />
                On deadline day
              </label>
            </div>
          </div>

          {/* Default Time */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Default Deadline Time
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                For date-only tasks (e.g. exams or submission dates)
              </div>
            </div>
            <input
              type="time"
              className="form-input"
              style={{ width: 110, padding: '4px 8px', fontSize: 12 }}
              value={defaultTime}
              onChange={(e) => setDefaultTime(e.target.value)}
            />
          </div>

          {/* Voice & Speech */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Volume2 size={16} color="#2563eb" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Offline Windows Text-to-Speech
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Speaks reminders locally without any cloud or internet connection
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
            />
          </div>

          {/* Quiet Hours */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Moon size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Quiet Hours
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    Pause audio and popups during your sleep window
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
              />
            </div>

            {quietHoursEnabled && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#475569' }}>From</span>
                <input
                  type="time"
                  className="form-input"
                  style={{ width: 100, padding: '3px 6px', fontSize: 12 }}
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
                <span style={{ fontSize: 12, color: '#475569' }}>to</span>
                <input
                  type="time"
                  className="form-input"
                  style={{ width: 100, padding: '3px 6px', fontSize: 12 }}
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Startup Behavior */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Rocket size={16} color="#2563eb" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Start with Windows
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                  Automatically run in system tray when your Windows user logs in
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={startupEnabled}
              onChange={(e) => setStartupEnabled(e.target.checked)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={onPreviewCharacter}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Sparkles size={14} color="#2563eb" />
            Test Deadline Beacon
          </button>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 13.5 }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
