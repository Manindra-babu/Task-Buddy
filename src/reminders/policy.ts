import { AppSettings, ReminderType, Task } from '../shared/types';
import { isQuietHour } from '../shared/date-utils';

export interface CalculatedReminder {
  reminder_type: ReminderType;
  scheduled_at: string; // ISO string
}

/**
 * Given a task and user settings, calculates all future reminder occurrences
 * according to the TaskBuddy Reminder Policy.
 */
export function calculateRemindersForTask(
  task: Pick<Task, 'id' | 'deadline_at'> & { remind_at?: string | null },
  settings: AppSettings,
  referenceNow = new Date()
): CalculatedReminder[] {
  const deadline = new Date(task.deadline_at);
  const deadlineMs = deadline.getTime();
  const nowMs = referenceNow.getTime();

  const results: CalculatedReminder[] = [];

  // 0. Custom reminder time (if user explicitly set when to remind)
  if (task.remind_at) {
    const customTime = new Date(task.remind_at);
    if (!isNaN(customTime.getTime())) {
      results.push({
        reminder_type: 'custom',
        scheduled_at: customTime.toISOString(),
      });
    }
  }

  // 1. Two days before (48 hours before deadline)
  if (settings.defaultReminderTwoDay) {
    const twoDayTime = new Date(deadlineMs - 48 * 60 * 60 * 1000);
    const adjustedTwoDay = adjustForQuietHours(twoDayTime, settings);
    if (adjustedTwoDay.getTime() > nowMs && adjustedTwoDay.getTime() < deadlineMs) {
      results.push({
        reminder_type: 'two_day',
        scheduled_at: adjustedTwoDay.toISOString(),
      });
    }
  }

  // 2. One day before (24 hours before deadline)
  if (settings.defaultReminderOneDay) {
    const oneDayTime = new Date(deadlineMs - 24 * 60 * 60 * 1000);
    const adjustedOneDay = adjustForQuietHours(oneDayTime, settings);
    if (adjustedOneDay.getTime() > nowMs && adjustedOneDay.getTime() < deadlineMs) {
      results.push({
        reminder_type: 'one_day',
        scheduled_at: adjustedOneDay.toISOString(),
      });
    }
  }

  // 3. Deadline day reminder
  if (settings.defaultReminderDeadlineDay) {
    // 2 hours before deadline (or at 9am if deadline is later in day)
    const deadlineDayTime = new Date(deadlineMs - 2 * 60 * 60 * 1000);
    const adjustedDeadlineDay = adjustForQuietHours(deadlineDayTime, settings);
    if (adjustedDeadlineDay.getTime() > nowMs && adjustedDeadlineDay.getTime() <= deadlineMs) {
      results.push({
        reminder_type: 'deadline_day',
        scheduled_at: adjustedDeadlineDay.toISOString(),
      });
    }
  }

  return results;
}

/**
 * If target time falls in quiet hours, shift it forward to the end of quiet hours.
 */
export function adjustForQuietHours(date: Date, settings: AppSettings): Date {
  if (!settings.quietHoursEnabled) return date;

  if (isQuietHour(date, settings.quietHoursStart, settings.quietHoursEnd)) {
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
    const adjusted = new Date(date);

    // If quiet hours ended on the same calendar day
    const [startH] = settings.quietHoursStart.split(':').map(Number);
    if (startH > endH && date.getHours() >= startH) {
      // It was night time before midnight, quiet hours end the next morning
      adjusted.setDate(adjusted.getDate() + 1);
    }
    adjusted.setHours(endH, endM, 0, 0);
    return adjusted;
  }

  return date;
}

/**
 * Determine if an overdue reminder should trigger for a task
 */
export function shouldTriggerOverdueReminder(
  task: Task,
  referenceNow = new Date()
): boolean {
  if (task.status !== 'pending') return false;
  const deadline = new Date(task.deadline_at).getTime();
  const now = referenceNow.getTime();
  return now > deadline;
}
