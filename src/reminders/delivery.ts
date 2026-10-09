import { Reminder, Task, ReminderEventPayload } from '../shared/types';
import { CATEGORY_LABELS } from '../shared/constants';
import { generateReminderMessage, getTimeRemaining } from '../shared/date-utils';

export function createDeliveryPayload(
  reminder: Reminder,
  task: Task,
  queueCount = 1,
  now = new Date()
): ReminderEventPayload {
  const isOverdue = new Date(task.deadline_at).getTime() < now.getTime();
  const categoryLabel = CATEGORY_LABELS[task.category] || 'Task';
  const remaining = getTimeRemaining(task.deadline_at, now);
  const message = generateReminderMessage(
    task.title,
    categoryLabel,
    reminder.reminder_type,
    isOverdue
  );

  return {
    reminder,
    task,
    message,
    categoryLabel,
    isOverdue,
    remainingText: remaining.text,
    queueCount,
  };
}
