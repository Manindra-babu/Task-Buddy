import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskBuddyDatabase } from '../../database/database';
import { TaskRepository } from '../../database/task-repository';
import { ReminderRepository } from '../../database/reminder-repository';
import { SettingsRepository } from '../../database/settings-repository';
import fs from 'fs';
import path from 'path';

describe('Database & Repositories Unit Tests', () => {
  let db: TaskBuddyDatabase;
  let taskRepo: TaskRepository;
  let reminderRepo: ReminderRepository;
  let settingsRepo: SettingsRepository;
  const testDbPath = path.join(__dirname, 'test_taskbuddy.sqlite');

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    db = new TaskBuddyDatabase();
    await db.init({ dbPath: testDbPath });
    taskRepo = new TaskRepository(db);
    reminderRepo = new ReminderRepository(db);
    settingsRepo = new SettingsRepository(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(`${testDbPath}.tmp`)) fs.unlinkSync(`${testDbPath}.tmp`);
  });

  it('initializes migrations and creates tables successfully', () => {
    const raw = db.getRawDatabase();
    const tables = db
      .all<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table'")
      .map((t) => t.name);

    expect(tables).toContain('migrations');
    expect(tables).toContain('tasks');
    expect(tables).toContain('reminders');
    expect(tables).toContain('settings');
  });

  it('creates and retrieves tasks', () => {
    const task = taskRepo.create({
      id: 'task_1',
      title: 'Math Quiz',
      category: 'online_tests',
      deadline_at: new Date('2026-10-15T10:00:00Z').toISOString(),
      priority: 'high',
      notes: 'Formulas sheet allowed',
    });

    expect(task.id).toBe('task_1');
    expect(task.title).toBe('Math Quiz');
    expect(task.status).toBe('pending');

    const fetched = taskRepo.getById('task_1');
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Math Quiz');
  });

  it('updates, completes, and reopens tasks', () => {
    taskRepo.create({
      id: 'task_2',
      title: 'Original Title',
      category: 'hackathons',
      deadline_at: new Date('2026-10-20T10:00:00Z').toISOString(),
      priority: 'medium',
    });

    // Update
    const updated = taskRepo.update('task_2', { title: 'Updated Title', priority: 'high' });
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.priority).toBe('high');

    // Complete
    const completed = taskRepo.complete('task_2');
    expect(completed?.status).toBe('completed');
    expect(completed?.completed_at).not.toBeNull();

    // Reopen
    const reopened = taskRepo.reopen('task_2');
    expect(reopened?.status).toBe('pending');
    expect(reopened?.completed_at).toBeNull();
  });

  it('deletes tasks cleanly', () => {
    taskRepo.create({
      id: 'task_3',
      title: 'To Delete',
      category: 'personal',
      deadline_at: new Date('2026-10-20T10:00:00Z').toISOString(),
      priority: 'low',
    });

    const deleted = taskRepo.delete('task_3');
    expect(deleted).toBe(true);
    expect(taskRepo.getById('task_3')).toBeNull();
  });

  it('manages reminders lifecycle: upsert, query due, delivered, snooze', () => {
    taskRepo.create({
      id: 'task_rem',
      title: 'Project Review',
      category: 'reviews',
      deadline_at: '2026-10-18T14:00:00Z',
      priority: 'high',
    });

    const scheduledTime = '2026-10-16T14:00:00Z';
    const rem = reminderRepo.upsert({
      id: 'rem_1',
      task_id: 'task_rem',
      reminder_type: 'two_day',
      scheduled_at: scheduledTime,
    });

    expect(rem.id).toBe('rem_1');
    expect(rem.status).toBe('scheduled');

    // Query due before scheduled time -> empty
    expect(reminderRepo.getDueReminders('2026-10-15T00:00:00Z')).toHaveLength(0);

    // Query due at or after scheduled time -> returns rem_1
    const due = reminderRepo.getDueReminders('2026-10-16T14:05:00Z');
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('rem_1');

    // Mark snoozed until future
    const snoozeUntil = '2026-10-16T14:30:00Z';
    reminderRepo.markSnoozed('rem_1', snoozeUntil);
    const snoozedRem = reminderRepo.getById('rem_1');
    expect(snoozedRem?.status).toBe('snoozed');
    expect(snoozedRem?.snoozed_until).toBe(snoozeUntil);

    // Before snooze time -> not due
    expect(reminderRepo.getDueReminders('2026-10-16T14:15:00Z')).toHaveLength(0);

    // At snooze time -> due!
    expect(reminderRepo.getDueReminders('2026-10-16T14:35:00Z')).toHaveLength(1);

    // Mark delivered
    reminderRepo.markDelivered('rem_1');
    expect(reminderRepo.getById('rem_1')?.status).toBe('delivered');
  });

  it('persists and updates settings', () => {
    const s1 = settingsRepo.getSettings();
    expect(s1.defaultDeadlineTime).toBe('09:00');

    const s2 = settingsRepo.updateSettings({
      defaultDeadlineTime: '10:30',
      voiceEnabled: false,
    });

    expect(s2.defaultDeadlineTime).toBe('10:30');
    expect(s2.voiceEnabled).toBe(false);

    // Re-query from fresh call
    const s3 = settingsRepo.getSettings();
    expect(s3.defaultDeadlineTime).toBe('10:30');
    expect(s3.voiceEnabled).toBe(false);
  });
});
