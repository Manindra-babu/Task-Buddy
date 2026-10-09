import { describe, it, expect } from 'vitest';
import {
  combineDateTime,
  isQuietHour,
  getTimeRemaining,
  calculateSnoozeDate,
  generateReminderMessage,
} from '../../src/shared/date-utils';

describe('Date Utilities Unit Tests', () => {
  it('combines date and custom time properly', () => {
    const combined = combineDateTime('2026-10-15', '14:30');
    const d = new Date(combined);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9); // 0-indexed October
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it('defaults to 09:00 AM when time is not provided', () => {
    const combined = combineDateTime('2026-10-20', undefined, '09:00');
    const d = new Date(combined);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(0);
  });

  describe('Quiet hours detection', () => {
    it('detects overnight quiet hours correctly', () => {
      // Overnight: 22:00 to 07:00
      const nightTime = new Date(2026, 9, 15, 23, 15); // 11:15 PM
      expect(isQuietHour(nightTime, '22:00', '07:00')).toBe(true);

      const earlyMorning = new Date(2026, 9, 15, 6, 30); // 6:30 AM
      expect(isQuietHour(earlyMorning, '22:00', '07:00')).toBe(true);

      const exactStart = new Date(2026, 9, 15, 22, 0); // 10:00 PM
      expect(isQuietHour(exactStart, '22:00', '07:00')).toBe(true);

      const exactEnd = new Date(2026, 9, 15, 7, 0); // 7:00 AM (quiet hours ended)
      expect(isQuietHour(exactEnd, '22:00', '07:00')).toBe(false);

      const noon = new Date(2026, 9, 15, 12, 0); // 12:00 PM
      expect(isQuietHour(noon, '22:00', '07:00')).toBe(false);
    });

    it('detects daytime quiet hours correctly', () => {
      // Daytime window: 13:00 to 15:00
      const duringQuiet = new Date(2026, 9, 15, 14, 0);
      expect(isQuietHour(duringQuiet, '13:00', '15:00')).toBe(true);

      const outsideQuiet = new Date(2026, 9, 15, 16, 0);
      expect(isQuietHour(outsideQuiet, '13:00', '15:00')).toBe(false);
    });
  });

  describe('Remaining time calculations', () => {
    it('calculates future remaining time', () => {
      const now = new Date(2026, 9, 10, 10, 0);
      const deadline = new Date(2026, 9, 12, 10, 0).toISOString(); // exactly 2 days
      const res = getTimeRemaining(deadline, now);
      expect(res.isOverdue).toBe(false);
      expect(res.text).toBe('in 2 days');
    });

    it('calculates overdue time', () => {
      const now = new Date(2026, 9, 10, 15, 0);
      const deadline = new Date(2026, 9, 10, 12, 0).toISOString(); // 3 hours ago
      const res = getTimeRemaining(deadline, now);
      expect(res.isOverdue).toBe(true);
      expect(res.text).toContain('overdue');
    });
  });

  describe('Snooze calculation', () => {
    it('adds minutes correctly', () => {
      const base = new Date(2026, 9, 10, 10, 0);
      const snoozed = calculateSnoozeDate(15, base);
      expect(snoozed.getTime() - base.getTime()).toBe(15 * 60 * 1000);
    });
  });

  describe('Friendly speech generation', () => {
    it('generates friendly supportive message for two days', () => {
      const msg = generateReminderMessage('Hackathon MVP', 'Hackathons', 'two_day', false);
      expect(msg).toContain('two days');
      expect(msg).toContain('Hackathon MVP');
    });

    it('generates constructive message for overdue', () => {
      const msg = generateReminderMessage('Lab Report', 'Academics', 'two_day', true);
      expect(msg).toContain('overdue');
      expect(msg).toContain('next step');
    });
  });
});
