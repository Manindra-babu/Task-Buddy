import { TaskBuddyDatabase } from './database';
import { Reminder, ReminderStatus, ReminderType } from '../src/shared/types';

export class ReminderRepository {
  constructor(private db: TaskBuddyDatabase) {}

  upsert(params: {
    id: string;
    task_id: string;
    reminder_type: ReminderType;
    scheduled_at: string;
    status?: ReminderStatus;
  }): Reminder {
    const now = new Date().toISOString();
    const status = params.status || 'scheduled';

    const existing = this.db.get<Reminder>(
      'SELECT * FROM reminders WHERE task_id = ? AND reminder_type = ?',
      [params.task_id, params.reminder_type]
    );

    if (existing) {
      this.db.run(
        `UPDATE reminders
         SET scheduled_at = ?, status = ?, updated_at = ?
         WHERE id = ?`,
        [params.scheduled_at, status, now, existing.id]
      );
      return this.getById(existing.id)!;
    } else {
      this.db.run(
        `INSERT INTO reminders (id, task_id, reminder_type, scheduled_at, status, attempt_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          params.id,
          params.task_id,
          params.reminder_type,
          params.scheduled_at,
          status,
          now,
          now,
        ]
      );
      return this.getById(params.id)!;
    }
  }

  getById(id: string): Reminder | null {
    return this.db.get<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
  }

  getAll(): Reminder[] {
    return this.db.all<Reminder>('SELECT * FROM reminders ORDER BY scheduled_at ASC');
  }

  getForTask(taskId: string): Reminder[] {
    return this.db.all<Reminder>(
      'SELECT * FROM reminders WHERE task_id = ? ORDER BY scheduled_at ASC',
      [taskId]
    );
  }

  /**
   * Find reminders that are eligible to trigger now:
   * 1. Status is 'scheduled' AND scheduled_at <= isoTime
   * 2. Status is 'snoozed' AND snoozed_until <= isoTime
   */
  getDueReminders(isoTime: string): Reminder[] {
    return this.db.all<Reminder>(
      `SELECT * FROM reminders
       WHERE (status = 'scheduled' AND scheduled_at <= ?)
          OR (status = 'snoozed' AND snoozed_until IS NOT NULL AND snoozed_until <= ?)
       ORDER BY scheduled_at ASC`,
      [isoTime, isoTime]
    );
  }

  markDelivered(id: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders
       SET status = 'delivered', delivered_at = ?, updated_at = ?, attempt_count = attempt_count + 1
       WHERE id = ?`,
      [now, now, id]
    );
  }

  markSnoozed(id: string, snoozedUntilIso: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders
       SET status = 'snoozed', snoozed_until = ?, updated_at = ?, attempt_count = attempt_count + 1
       WHERE id = ?`,
      [snoozedUntilIso, now, id]
    );
  }

  markDismissed(id: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders
       SET status = 'dismissed', updated_at = ?
       WHERE id = ?`,
      [now, id]
    );
  }

  markFailed(id: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders
       SET status = 'failed', updated_at = ?, attempt_count = attempt_count + 1
       WHERE id = ?`,
      [now, id]
    );
  }

  cancelPendingForTask(taskId: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders
       SET status = 'canceled', updated_at = ?
       WHERE task_id = ? AND status IN ('scheduled', 'snoozed')`,
      [now, taskId]
    );
  }

  deleteForTask(taskId: string): void {
    this.db.run('DELETE FROM reminders WHERE task_id = ?', [taskId]);
  }
}
