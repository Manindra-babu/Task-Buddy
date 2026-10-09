import React, { useState } from 'react';
import { AppSettings } from '../../shared/types';
import { Sparkles, Save, ShieldCheck, Database, Info } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (updated: Partial<AppSettings>) => Promise<void>;
  onPreviewCharacter: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSave,
  onPreviewCharacter,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key: keyof AppSettings, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setIsSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Settings</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Customize reminder frequencies, speech parameters, and character appearance
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Reminder Timings Card */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            Default Reminder Schedule
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.defaultReminderTwoDay}
                onChange={(e) => handleChange('defaultReminderTwoDay', e.target.checked)}
              />
              Deliver early reminder 2 days before deadline (48h)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.defaultReminderOneDay}
                onChange={(e) => handleChange('defaultReminderOneDay', e.target.checked)}
              />
              Deliver follow-up reminder 1 day before deadline (24h)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.defaultReminderDeadlineDay}
                onChange={(e) => handleChange('defaultReminderDeadlineDay', e.target.checked)}
              />
              Deliver final reminder on the deadline day
            </label>

            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#334155' }}>
                Default time for date-only tasks:
              </span>
              <input
                type="time"
                className="form-input"
                style={{ width: 120 }}
                value={formData.defaultDeadlineTime}
                onChange={(e) => handleChange('defaultDeadlineTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Quiet Hours</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.quietHoursEnabled}
                onChange={(e) => handleChange('quietHoursEnabled', e.target.checked)}
              />
              Enable
            </label>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Reminders due during quiet hours will silently hold and present immediately when quiet hours end.
          </p>

          {formData.quietHoursEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#334155' }}>Start:</span>
                  <input
                    type="time"
                    className="form-input"
                    style={{ width: 120 }}
                    value={formData.quietHoursStart}
                    onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#334155' }}>End:</span>
                  <input
                    type="time"
                    className="form-input"
                    style={{ width: 120 }}
                    value={formData.quietHoursEnd}
                    onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                  />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.quietHoursAllowVisual}
                  onChange={(e) => handleChange('quietHoursAllowVisual', e.target.checked)}
                />
                Show visual beacon alerts during quiet hours while keeping voice alerts muted
              </label>
            </div>
          )}
        </div>

        {/* Voice Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Offline Windows Voice (SAPI)
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.voiceEnabled}
                onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
              />
              Voice Enabled
            </label>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Speaks reminder headlines using local Windows System.Speech. Muted by default for quiet focus. Zero external network calls.
          </p>

          {formData.voiceEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label className="form-label">
                  Volume: {Math.round(formData.voiceVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={formData.voiceVolume}
                  onChange={(e) => handleChange('voiceVolume', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="form-label">Speech Rate: {formData.voiceRate}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={formData.voiceRate}
                  onChange={(e) => handleChange('voiceRate', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* The Deadline Beacon Settings Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              The Deadline Beacon
            </h3>
            <a
              href="#preview"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={13} color="#2563eb" />
              Open Beacon Studio
            </a>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            Signature luminous indicator at the bottom-right desktop work area. Pure CSS/SVG motion, zero 3D overhead.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Animation Intensity</label>
              <select
                className="form-select"
                value={formData.beaconAnimationIntensity}
                onChange={(e) => handleChange('beaconAnimationIntensity', e.target.value)}
              >
                <option value="subdued">Subdued (Gentle 3.4s Breathing)</option>
                <option value="standard">Standard (Balanced 2.6s Pulse)</option>
                <option value="vibrant">Vibrant (Expressive 1.9s Pulse)</option>
                <option value="reduced">Reduced Motion (Static Indicator)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Default Snooze Duration</label>
              <select
                className="form-select"
                value={formData.snoozeDefaultMinutes}
                onChange={(e) => handleChange('snoozeDefaultMinutes', parseInt(e.target.value, 10))}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Startup & Data Storage Card */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Windows System Integration & Local Storage
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.startupEnabled}
              onChange={(e) => handleChange('startupEnabled', e.target.checked)}
            />
            Launch automatically when the current Windows user signs in
          </label>
          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0f172a' }}>
              <Database size={14} color="#2563eb" />
              <span>SQLite Data Storage:</span>
            </div>
            <code style={{ fontSize: 11, color: '#334155', backgroundColor: '#ffffff', padding: '3px 6px', borderRadius: 4, border: '1px solid #cbd5e1' }}>
              %APPDATA%\TaskBuddy\taskbuddy.sqlite
            </code>
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Your tasks and reminder schedules remain entirely private on your machine and are preserved across updates.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onPreviewCharacter}
            className="btn btn-secondary"
          >
            <Sparkles size={16} color="#2563eb" />
            Test Deadline Beacon
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isSaved && (
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                Settings Saved!
              </span>
            )}
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
