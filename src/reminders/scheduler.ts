import { TaskRepository } from '../../database/task-repository';
import { ReminderRepository } from '../../database/reminder-repository';
import { SettingsRepository } from '../../database/settings-repository';
import { ReminderEventPayload, Task } from '../shared/types';
import { reconcileReminders } from './recovery';
import { createDeliveryPayload } from './delivery';
import { isQuietHour } from '../shared/date-utils';

export type ReminderDeliveryHandler = (payload: ReminderEventPayload) => void;

export class ReminderScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isPaused = false;
  private deliveryHandler: ReminderDeliveryHandler | null = null;
  private activeDeliveryReminderId: string | null = null;
  private checkIntervalMs = 30000; // 30 seconds default
  private customClock: (() => Date) | null = null;

  constructor(
    private taskRepo: TaskRepository,
    private reminderRepo: ReminderRepository,
    private settingsRepo: SettingsRepository
  ) {}

  setClock(clockFn: () => Date): void {
    this.customClock = clockFn;
  }

  getCurrentTime(): Date {
    return this.customClock ? this.customClock() : new Date();
  }

  onDeliver(handler: ReminderDeliveryHandler): void {
    this.deliveryHandler = handler;
  }

  setIntervalMs(ms: number): void {
    this.checkIntervalMs = ms;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;

    // Run immediate reconciliation on startup
    this.reconcile();

    // Check immediately for due reminders
    this.checkDueReminders();

    // Setup periodic interval
    this.timer = setInterval(() => {
      this.checkDueReminders();
    }, this.checkIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.reconcile();
    this.checkDueReminders();
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  reconcile(): void {
    const now = this.getCurrentTime();
    reconcileReminders(this.taskRepo, this.reminderRepo, this.settingsRepo, now);
  }

  /**
   * Called when a task is created or updated to schedule future reminders immediately
   */
  onTaskChanged(task: Task): void {
    this.reconcile();
    this.checkDueReminders();
  }

  /**
   * Check for due reminders and deliver eligible ones
   */
  checkDueReminders(): void {
    if (!this.isRunning || this.isPaused) return;

    const now = this.getCurrentTime();
    const settings = this.settingsRepo.getSettings();

    // Check quiet hours
    if (
      settings.quietHoursEnabled &&
      isQuietHour(now, settings.quietHoursStart, settings.quietHoursEnd)
    ) {
      // In quiet hours: do not interrupt user with visual popups or voice
      return;
    }

    const dueList = this.reminderRepo.getDueReminders(now.toISOString());
    if (dueList.length === 0) return;

    // Filter valid pending tasks
    const eligible: { reminder: (typeof dueList)[0]; task: Task }[] = [];
    for (const rem of dueList) {
      // Avoid re-triggering the same reminder if it's currently on screen
      if (this.activeDeliveryReminderId === rem.id) continue;

      const task = this.taskRepo.getById(rem.task_id);
      if (task && task.status === 'pending') {
        eligible.push({ reminder: rem, task });
      } else {
        // Cancel stale reminder
        this.reminderRepo.cancelPendingForTask(rem.task_id);
      }
    }

    if (eligible.length === 0) return;

    // Deliver the first due reminder with queue count
    const top = eligible[0];
    this.activeDeliveryReminderId = top.reminder.id;

    const payload = createDeliveryPayload(
      top.reminder,
      top.task,
      eligible.length,
      now
    );

    if (this.deliveryHandler) {
      this.deliveryHandler(payload);
    }
  }

  handleUserAction(
    action: 'start' | 'snooze' | 'done' | 'dismiss',
    reminderId: string,
    snoozeMinutes = 15
  ): void {
    const reminder = this.reminderRepo.getById(reminderId);
    if (!reminder) return;

    const now = this.getCurrentTime();

    if (action === 'done') {
      this.taskRepo.complete(reminder.task_id);
      this.reminderRepo.cancelPendingForTask(reminder.task_id);
      this.reminderRepo.markDelivered(reminderId);
    } else if (action === 'snooze') {
      const snoozeTime = new Date(now.getTime() + snoozeMinutes * 60 * 1000);
      this.reminderRepo.markSnoozed(reminderId, snoozeTime.toISOString());
    } else if (action === 'dismiss') {
      this.reminderRepo.markDismissed(reminderId);
    } else if (action === 'start') {
      // Mark as delivered/acknowledged
      this.reminderRepo.markDelivered(reminderId);
    }

    if (this.activeDeliveryReminderId === reminderId) {
      this.activeDeliveryReminderId = null;
    }
  }
}
