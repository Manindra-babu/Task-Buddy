import { TaskBuddyDatabase } from './database';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../src/shared/types';

export class TaskRepository {
  constructor(private db: TaskBuddyDatabase) {}

  create(params: {
    id: string;
    title: string;
    category: TaskCategory;
    deadline_at: string;
    priority: TaskPriority;
    notes?: string | null;
    next_action?: string | null;
    destination_url?: string | null;
    remind_at?: string | null;
  }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: params.id,
      title: params.title.trim(),
      category: params.category,
      deadline_at: params.deadline_at,
      priority: params.priority,
      status: 'pending',
      notes: params.notes ? params.notes.trim() : null,
      next_action: params.next_action ? params.next_action.trim() : null,
      destination_url: params.destination_url ? params.destination_url.trim() : null,
      remind_at: params.remind_at ? params.remind_at : null,
      created_at: now,
      updated_at: now,
      completed_at: null,
    };

    this.db.run(
      `INSERT INTO tasks (id, title, category, deadline_at, priority, status, notes, next_action, destination_url, remind_at, created_at, updated_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.category,
        task.deadline_at,
        task.priority,
        task.status,
        task.notes,
        task.next_action,
        task.destination_url,
        task.remind_at,
        task.created_at,
        task.updated_at,
        task.completed_at,
      ]
    );

    return task;
  }

  getById(id: string): Task | null {
    return this.db.get<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
  }

  getAll(): Task[] {
    return this.db.all<Task>('SELECT * FROM tasks ORDER BY deadline_at ASC');
  }

  getPending(): Task[] {
    return this.db.all<Task>(
      "SELECT * FROM tasks WHERE status = 'pending' ORDER BY deadline_at ASC"
    );
  }

  update(
    id: string,
    updates: Partial<{
      title: string;
      category: TaskCategory;
      deadline_at: string;
      priority: TaskPriority;
      notes: string | null;
      next_action: string | null;
      destination_url: string | null;
      remind_at: string | null;
      status: TaskStatus;
    }>
  ): Task | null {
    const current = this.getById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const newTitle = updates.title !== undefined ? updates.title.trim() : current.title;
    const newCategory = updates.category !== undefined ? updates.category : current.category;
    const newDeadline = updates.deadline_at !== undefined ? updates.deadline_at : current.deadline_at;
    const newPriority = updates.priority !== undefined ? updates.priority : current.priority;
    const newNotes = updates.notes !== undefined ? (updates.notes ? updates.notes.trim() : null) : current.notes;
    const newNextAction = updates.next_action !== undefined ? (updates.next_action ? updates.next_action.trim() : null) : current.next_action;
    const newDestUrl = updates.destination_url !== undefined ? (updates.destination_url ? updates.destination_url.trim() : null) : current.destination_url;
    const newRemindAt = updates.remind_at !== undefined ? (updates.remind_at ? updates.remind_at : null) : (current as any).remind_at;
    const newStatus = updates.status !== undefined ? updates.status : current.status;
    const completedAt =
      newStatus === 'completed' ? (current.completed_at || now) : null;

    this.db.run(
      `UPDATE tasks
       SET title = ?, category = ?, deadline_at = ?, priority = ?, notes = ?, next_action = ?, destination_url = ?, remind_at = ?, status = ?, completed_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        newTitle,
        newCategory,
        newDeadline,
        newPriority,
        newNotes,
        newNextAction,
        newDestUrl,
        newRemindAt,
        newStatus,
        completedAt,
        now,
        id,
      ]
    );

    return this.getById(id);
  }

  complete(id: string): Task | null {
    return this.update(id, { status: 'completed' });
  }

  reopen(id: string): Task | null {
    return this.update(id, { status: 'pending' });
  }

  delete(id: string): boolean {
    const existing = this.getById(id);
    if (!existing) return false;
    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }
}
