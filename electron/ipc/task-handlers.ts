import { ipcMain } from 'electron';
import { TaskRepository } from '../../database/task-repository';
import { ReminderScheduler } from '../../src/reminders/scheduler';
import { validateTaskInput, TaskInput } from '../../src/tasks/validation/task-validator';
import { combineDateTime } from '../../src/shared/date-utils';
import { SettingsRepository } from '../../database/settings-repository';

export function registerTaskHandlers(
  taskRepo: TaskRepository,
  settingsRepo: SettingsRepository,
  scheduler: ReminderScheduler
): void {
  ipcMain.handle('tasks:getAll', async () => {
    return taskRepo.getAll();
  });

  ipcMain.handle('tasks:create', async (_event, input: TaskInput) => {
    const validation = validateTaskInput(input);
    if (!validation.valid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }

    const settings = settingsRepo.getSettings();
    const deadlineIso = combineDateTime(
      input.deadlineDate,
      input.deadlineToTime,
      settings.defaultDeadlineTime
    );

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task = taskRepo.create({
      id: taskId,
      title: input.title,
      category: input.category,
      deadline_at: deadlineIso,
      priority: input.priority,
      notes: input.notes,
      next_action: input.next_action,
      destination_url: input.destination_url,
    });

    scheduler.onTaskChanged(task);
    return { success: true, task };
  });

  ipcMain.handle(
    'tasks:update',
    async (_event, id: string, updates: Partial<TaskInput>) => {
      const existing = taskRepo.getById(id);
      if (!existing) return { success: false, error: 'Task not found' };

      const settings = settingsRepo.getSettings();
      let newDeadlineIso = existing.deadline_at;

      if (updates.deadlineDate) {
        newDeadlineIso = combineDateTime(
          updates.deadlineDate,
          updates.deadlineToTime,
          settings.defaultDeadlineTime
        );
      }

      const updated = taskRepo.update(id, {
        title: updates.title,
        category: updates.category,
        deadline_at: newDeadlineIso,
        priority: updates.priority,
        notes: updates.notes,
        next_action: updates.next_action,
        destination_url: updates.destination_url,
      });

      if (updated) {
        scheduler.onTaskChanged(updated);
        return { success: true, task: updated };
      }
      return { success: false, error: 'Update failed' };
    }
  );

  ipcMain.handle('tasks:complete', async (_event, id: string) => {
    const task = taskRepo.complete(id);
    if (task) {
      scheduler.onTaskChanged(task);
      return { success: true, task };
    }
    return { success: false, error: 'Task not found' };
  });

  ipcMain.handle('tasks:reopen', async (_event, id: string) => {
    const task = taskRepo.reopen(id);
    if (task) {
      scheduler.onTaskChanged(task);
      return { success: true, task };
    }
    return { success: false, error: 'Task not found' };
  });

  ipcMain.handle('tasks:delete', async (_event, id: string) => {
    const success = taskRepo.delete(id);
    return { success };
  });
}
