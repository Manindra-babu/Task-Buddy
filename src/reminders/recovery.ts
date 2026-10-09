import { TaskRepository } from '../../database/task-repository';
import { ReminderRepository } from '../../database/reminder-repository';
import { SettingsRepository } from '../../database/settings-repository';
import { calculateRemindersForTask } from './policy';
import { Reminder, Task } from '../shared/types';

export interface RecoveryResult {
  missedRemindersCount: number;
  catchUpReminder: { reminder: Reminder; task: Task } | null;
  overdueTasksCount: number;
}

/**
 * Reconciles the database on startup or system resume from sleep:
 * 1. Ensure all pending tasks have appropriate future reminder records.
 * 2. Detect reminders that became due while the app was offline.
 * 3. Pick the most urgent single catch-up reminder (avoid spamming user).
 * 4. Cancel stale reminders for completed/canceled tasks.
 */
export function reconcileReminders(
  taskRepo: TaskRepository,
  reminderRepo: ReminderRepository,
  settingsRepo: SettingsRepository,
  referenceNow = new Date()
): RecoveryResult {
  const settings = settingsRepo.getSettings();
  const pendingTasks = taskRepo.getPending();
  const nowIso = referenceNow.toISOString();
  const nowMs = referenceNow.getTime();

  // 1. For each pending task, reconcile future reminders
  for (const task of pendingTasks) {
    const existingReminders = reminderRepo.getForTask(task.id);
    const calculated = calculateRemindersForTask(task, settings, referenceNow);

    for (const calc of calculated) {
      const existing = existingReminders.find((r) => r.reminder_type === calc.reminder_type);
      if (!existing) {
        reminderRepo.upsert({
          id: `rem_${task.id}_${calc.reminder_type}`,
          task_id: task.id,
          reminder_type: calc.reminder_type,
          scheduled_at: calc.scheduled_at,
          status: 'scheduled',
        });
      } else if (existing.status === 'scheduled') {
        // If deadline or setting changed, update scheduled time
        if (existing.scheduled_at !== calc.scheduled_at) {
          reminderRepo.upsert({
            id: existing.id,
            task_id: task.id,
            reminder_type: calc.reminder_type,
            scheduled_at: calc.scheduled_at,
            status: 'scheduled',
          });
        }
      }
    }
  }

  // 2. Cancel reminders for tasks that are no longer pending
  const allReminders = reminderRepo.getAll();
  for (const reminder of allReminders) {
    if (reminder.status === 'scheduled' || reminder.status === 'snoozed') {
      const task = taskRepo.getById(reminder.task_id);
      if (!task || task.status !== 'pending') {
        reminderRepo.cancelPendingForTask(reminder.task_id);
      }
    }
  }

  // 3. Find due reminders (missed while offline or due now)
  const dueReminders = reminderRepo.getDueReminders(nowIso);
  const eligibleMissed: { reminder: Reminder; task: Task }[] = [];

  for (const reminder of dueReminders) {
    const task = taskRepo.getById(reminder.task_id);
    if (task && task.status === 'pending') {
      eligibleMissed.push({ reminder, task });
    } else {
      // Stale reminder
      reminderRepo.cancelPendingForTask(reminder.task_id);
    }
  }

  // 4. Sort eligible missed by priority and urgency
  eligibleMissed.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    const pDiff = pOrder[a.task.priority] - pOrder[b.task.priority];
    if (pDiff !== 0) return pDiff;
    return (
      new Date(a.task.deadline_at).getTime() - new Date(b.task.deadline_at).getTime()
    );
  });

  // Pick top 1 for catch-up presentation, mark others as delivered or keep in queue
  let catchUpReminder: { reminder: Reminder; task: Task } | null = null;
  if (eligibleMissed.length > 0) {
    catchUpReminder = eligibleMissed[0];
  }

  const overdueTasksCount = pendingTasks.filter(
    (t) => new Date(t.deadline_at).getTime() < nowMs
  ).length;

  // Record reconciliation timestamp
  settingsRepo.updateSettings({ lastReconciliationAt: nowIso });

  return {
    missedRemindersCount: eligibleMissed.length,
    catchUpReminder,
    overdueTasksCount,
  };
}
