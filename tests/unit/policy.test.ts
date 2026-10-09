import { describe, it, expect } from 'vitest';
import {
  calculateRemindersForTask,
  adjustForQuietHours,
  shouldTriggerOverdueReminder,
} from '../../src/reminders/policy';
import { DEFAULT_SETTINGS } from '../../src/shared/constants';
import { AppSettings, Task } from '../../src/shared/types';

describe('Reminder Policy Unit Tests', () => {
  const baseSettings: AppSettings = {
    ...DEFAULT_SETTINGS,
    quietHoursEnabled: false, // disable quiet hours for pure math test first
  };

  it('calculates 2-day, 1-day, and deadline-day reminders for far future task', () => {
    // Current time: Oct 10, 10:00 AM
    const now = new Date(2026, 9, 10, 10, 0);
    // Deadline: Oct 15, 10:00 AM (5 days away)
    const deadline = new Date(2026, 9, 15, 10, 0).toISOString();

    const reminders = calculateRemindersForTask(
      { id: 't1', deadline_at: deadline },
      baseSettings,
      now
    );

    expect(reminders.length).toBe(3);
    const types = reminders.map((r) => r.reminder_type);
    expect(types).toContain('two_day');
    expect(types).toContain('one_day');
    expect(types).toContain('deadline_day');

    const twoDay = reminders.find((r) => r.reminder_type === 'two_day')!;
    const twoDayDate = new Date(twoDay.scheduled_at);
    // 48h before Oct 15 10:00 AM is Oct 13 10:00 AM
    expect(twoDayDate.getDate()).toBe(13);
  });

  it('skips past reminders when task is created close to deadline', () => {
    // Current time: Oct 10, 10:00 AM
    const now = new Date(2026, 9, 10, 10, 0);
    // Deadline: Oct 11, 2:00 PM (28 hours away)
    const deadline = new Date(2026, 9, 11, 14, 0).toISOString();

    const reminders = calculateRemindersForTask(
      { id: 't2', deadline_at: deadline },
      baseSettings,
      now
    );

    // 48h before (Oct 9 2:00 PM) is already in the past! Should NOT schedule 2-day.
    const types = reminders.map((r) => r.reminder_type);
    expect(types).not.toContain('two_day');
    expect(types).toContain('one_day');
  });

  it('adjusts reminder time forward if it lands within quiet hours', () => {
    const settingsWithQuiet: AppSettings = {
      ...DEFAULT_SETTINGS,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };

    // 3:30 AM is in quiet hours
    const middleOfNight = new Date(2026, 9, 12, 3, 30);
    const adjusted = adjustForQuietHours(middleOfNight, settingsWithQuiet);

    // Should be moved forward to 7:00 AM of that day
    expect(adjusted.getHours()).toBe(7);
    expect(adjusted.getMinutes()).toBe(0);
    expect(adjusted.getDate()).toBe(12);
  });

  it('determines overdue condition correctly', () => {
    const now = new Date(2026, 9, 10, 12, 0);
    const pastTask: Task = {
      id: 't3',
      title: 'Past Task',
      category: 'personal',
      deadline_at: new Date(2026, 9, 10, 10, 0).toISOString(),
      priority: 'medium',
      status: 'pending',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };

    expect(shouldTriggerOverdueReminder(pastTask, now)).toBe(true);

    // Completed task is not overdue
    const completedTask: Task = { ...pastTask, status: 'completed' };
    expect(shouldTriggerOverdueReminder(completedTask, now)).toBe(false);
  });
});
