import { TaskBuddyDatabase } from './database';
import { AppSettings } from '../src/shared/types';
import { DEFAULT_SETTINGS } from '../src/shared/constants';

export class SettingsRepository {
  constructor(private db: TaskBuddyDatabase) {}

  getSettings(): AppSettings {
    const rows = this.db.all<{ key: string; value: string }>('SELECT key, value FROM settings');
    const settingsMap = new Map<string, any>();
    for (const row of rows) {
      try {
        settingsMap.set(row.key, JSON.parse(row.value));
      } catch {
        settingsMap.set(row.key, row.value);
      }
    }

    const result: AppSettings = {
      defaultReminderTwoDay:
        settingsMap.has('defaultReminderTwoDay')
          ? Boolean(settingsMap.get('defaultReminderTwoDay'))
          : DEFAULT_SETTINGS.defaultReminderTwoDay,
      defaultReminderOneDay:
        settingsMap.has('defaultReminderOneDay')
          ? Boolean(settingsMap.get('defaultReminderOneDay'))
          : DEFAULT_SETTINGS.defaultReminderOneDay,
      defaultReminderDeadlineDay:
        settingsMap.has('defaultReminderDeadlineDay')
          ? Boolean(settingsMap.get('defaultReminderDeadlineDay'))
          : DEFAULT_SETTINGS.defaultReminderDeadlineDay,
      defaultDeadlineTime:
        settingsMap.get('defaultDeadlineTime') || DEFAULT_SETTINGS.defaultDeadlineTime,
      quietHoursEnabled:
        settingsMap.has('quietHoursEnabled')
          ? Boolean(settingsMap.get('quietHoursEnabled'))
          : DEFAULT_SETTINGS.quietHoursEnabled,
      quietHoursStart:
        settingsMap.get('quietHoursStart') || DEFAULT_SETTINGS.quietHoursStart,
      quietHoursEnd:
        settingsMap.get('quietHoursEnd') || DEFAULT_SETTINGS.quietHoursEnd,
      voiceEnabled:
        settingsMap.has('voiceEnabled')
          ? Boolean(settingsMap.get('voiceEnabled'))
          : DEFAULT_SETTINGS.voiceEnabled,
      voiceVolume:
        typeof settingsMap.get('voiceVolume') === 'number'
          ? settingsMap.get('voiceVolume')
          : DEFAULT_SETTINGS.voiceVolume,
      voiceRate:
        typeof settingsMap.get('voiceRate') === 'number'
          ? settingsMap.get('voiceRate')
          : DEFAULT_SETTINGS.voiceRate,
      characterSize:
        settingsMap.get('characterSize') || DEFAULT_SETTINGS.characterSize,
      avatarModel:
        settingsMap.get('avatarModel') || DEFAULT_SETTINGS.avatarModel,
      startupEnabled:
        settingsMap.has('startupEnabled')
          ? Boolean(settingsMap.get('startupEnabled'))
          : DEFAULT_SETTINGS.startupEnabled,
      onboardingCompleted:
        settingsMap.has('onboardingCompleted')
          ? Boolean(settingsMap.get('onboardingCompleted'))
          : DEFAULT_SETTINGS.onboardingCompleted,
      lastReconciliationAt:
        settingsMap.get('lastReconciliationAt') || DEFAULT_SETTINGS.lastReconciliationAt,
    };

    return result;
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        const jsonVal = JSON.stringify(val);
        const exists = this.db.get<{ key: string }>(
          'SELECT key FROM settings WHERE key = ?',
          [key]
        );
        if (exists) {
          this.db.run('UPDATE settings SET value = ? WHERE key = ?', [jsonVal, key]);
        } else {
          this.db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, jsonVal]);
        }
      }
    }
    return this.getSettings();
  }
}
