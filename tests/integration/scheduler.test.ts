import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskBuddyDatabase } from '../../database/database';
import { TaskRepository } from '../../database/task-repository';
import { ReminderRepository } from '../../database/reminder-repository';
import { SettingsRepository } from '../../database/settings-repository';
import { ReminderScheduler } from '../../src/reminders/scheduler';
import { ReminderEventPayload } from '../../src/shared/types';
import path from 'path';
import fs from 'fs';

describe('Reminder Scheduler Integration Tests', () => {
  let db: TaskBuddyDatabase;
  let taskRepo: TaskRepository;
  let reminderRepo: ReminderRepository;
  let settingsRepo: SettingsRepository;
  let scheduler: ReminderScheduler;
  let simulatedTime: Date;
  let deliveredPayloads: ReminderEventPayload[] = [];

  const testDbPath = path.join(__dirname, 'test_scheduler.sqlite');

  beforeEach(async () => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    db = new TaskBuddyDatabase();
    await db.init({ dbPath: testDbPath });

    taskRepo = new TaskRepository(db);
    reminderRepo = new ReminderRepository(db);
    settingsRepo = new SettingsRepository(db);

    // Disable quiet hours in test settings so test clock triggers without sleep suppression
    settingsRepo.updateSettings({
      quietHoursEnabled: false,
    });

    scheduler = new ReminderScheduler(taskRepo, reminderRepo, settingsRepo);

    // Base test time: Monday Oct 12, 2026 10:00 AM
    simulatedTime = new Date('2026-10-12T10:00:00Z');
    scheduler.setClock(() => simulatedTime);

    deliveredPayloads = [];
    scheduler.onDeliver((payload) => {
      deliveredPayloads.push(payload);
    });

    scheduler.start();
  });

  afterEach(() => {
    scheduler.stop();
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(`${testDbPath}.tmp`)) fs.unlinkSync(`${testDbPath}.tmp`);
  });

  it('schedules reminders on task creation and delivers when time advances', () => {
    // Deadline is Thursday Oct 15, 2026 10:00 AM (72 hours away)
    const deadline = new Date('2026-10-15T10:00:00Z').toISOString();
    const task = taskRepo.create({
      id: 'task_exam',
      title: 'Database Systems Exam',
      category: 'online_tests',
      deadline_at: deadline,
      priority: 'high',
    });

    scheduler.onTaskChanged(task);

    // Scheduled reminders should exist in DB
    const reminders = reminderRepo.getForTask('task_exam');
    expect(reminders.length).toBeGreaterThanOrEqual(2);

    // Initial check at Oct 12 10:00 AM: nothing due yet
    expect(deliveredPayloads).toHaveLength(0);

    // Advance time to 2 days before (Tuesday Oct 13, 2026 10:01 AM)
    simulatedTime = new Date('2026-10-13T10:01:00Z');
    scheduler.checkDueReminders();

    // Should deliver the two-day reminder!
    expect(deliveredPayloads).toHaveLength(1);
    expect(deliveredPayloads[0].task.id).toBe('task_exam');
    expect(deliveredPayloads[0].reminder.reminder_type).toBe('two_day');
    expect(deliveredPayloads[0].message).toContain('Database Systems Exam');
  });

  it('prevents duplicate delivery for an active reminder', () => {
    const deadline = new Date('2026-10-15T10:00:00Z').toISOString();
    const task = taskRepo.create({
      id: 'task_dup',
      title: 'Algorithm Homework',
      category: 'academics',
      deadline_at: deadline,
      priority: 'medium',
    });
    scheduler.onTaskChanged(task);

    // Advance time to 2 days before
    simulatedTime = new Date('2026-10-13T10:05:00Z');
    scheduler.checkDueReminders();
    expect(deliveredPayloads).toHaveLength(1);

    // Repeated check should NOT re-deliver duplicate while active
    scheduler.checkDueReminders();
    scheduler.checkDueReminders();
    expect(deliveredPayloads).toHaveLength(1);
  });

  it('cancels pending reminders when task is completed', () => {
    const deadline = new Date('2026-10-15T10:00:00Z').toISOString();
    const task = taskRepo.create({
      id: 'task_cancel',
      title: 'Hackathon Submission',
      category: 'hackathons',
      deadline_at: deadline,
      priority: 'high',
    });
    scheduler.onTaskChanged(task);

    // Complete task
    scheduler.handleUserAction('done', 'rem_task_cancel_two_day');

    const updatedTask = taskRepo.getById('task_cancel');
    expect(updatedTask?.status).toBe('completed');

    // All pending reminders for this task are canceled
    const taskReminders = reminderRepo.getForTask('task_cancel');
    const pendingReminders = taskReminders.filter(
      (r) => r.status === 'scheduled' || r.status === 'snoozed'
    );
    expect(pendingReminders).toHaveLength(0);
  });

  it('handles snooze and delivers again after snooze duration', () => {
    const deadline = new Date('2026-10-15T10:00:00Z').toISOString();
    const task = taskRepo.create({
      id: 'task_snooze',
      title: 'Team Standup Review',
      category: 'reviews',
      deadline_at: deadline,
      priority: 'medium',
    });
    scheduler.onTaskChanged(task);

    // Trigger two-day reminder
    simulatedTime = new Date('2026-10-13T10:00:00Z');
    scheduler.checkDueReminders();
    expect(deliveredPayloads).toHaveLength(1);

    const activeRemId = deliveredPayloads[0].reminder.id;

    // User clicks snooze for 15 minutes
    scheduler.handleUserAction('snooze', activeRemId, 15);

    // 5 minutes later: not due
    simulatedTime = new Date('2026-10-13T10:05:00Z');
    scheduler.checkDueReminders();
    expect(deliveredPayloads).toHaveLength(1); // no new delivery

    // 16 minutes later: snooze expired, delivers!
    simulatedTime = new Date('2026-10-13T10:16:00Z');
    scheduler.checkDueReminders();
    expect(deliveredPayloads).toHaveLength(2);
  });

  it('recovers missed reminders on restart/reconciliation', () => {
    // Task created with deadline 2 days ago (missed while offline)
    taskRepo.create({
      id: 'task_missed',
      title: 'Scholarship Application',
      category: 'personal',
      deadline_at: '2026-10-12T09:00:00Z',
      priority: 'high',
    });

    reminderRepo.upsert({
      id: 'rem_missed',
      task_id: 'task_missed',
      reminder_type: 'deadline_day',
      scheduled_at: '2026-10-12T07:00:00Z',
      status: 'scheduled',
    });

    // Scheduler starts up at Oct 12 10:00 AM (3 hours after scheduled time)
    scheduler.reconcile();
    scheduler.checkDueReminders();

    // Catch-up reminder delivered!
    expect(deliveredPayloads).toHaveLength(1);
    expect(deliveredPayloads[0].task.id).toBe('task_missed');
  });
});
