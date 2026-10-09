import { contextBridge, ipcRenderer } from 'electron';
import { Task, AppSettings, ReminderEventPayload, DailyBriefingPayload } from '../src/shared/types';
import { TaskInput } from '../src/tasks/validation/task-validator';

export interface ITaskBuddyAPI {
  // Tasks
  getTasks: () => Promise<Task[]>;
  createTask: (input: TaskInput) => Promise<{ success: boolean; task?: Task; error?: string }>;
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<{ success: boolean; task?: Task; error?: string }>;
  completeTask: (id: string) => Promise<{ success: boolean; task?: Task }>;
  reopenTask: (id: string) => Promise<{ success: boolean; task?: Task }>;
  deleteTask: (id: string) => Promise<{ success: boolean }>;

  // Reminders & Actions
  handleReminderAction: (action: 'start' | 'snooze' | 'done' | 'dismiss', reminderId: string, snoozeMinutes?: number) => Promise<void>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings>;
  previewCharacter: () => Promise<void>;

  // System & Navigation
  openDashboard: () => Promise<void>;
  hideCharacter: () => Promise<void>;
  quitApp: () => Promise<void>;

  // Event Listeners
  onReminderDue: (callback: (payload: ReminderEventPayload) => void) => () => void;
  onDailyBriefing: (callback: (payload: DailyBriefingPayload) => void) => () => void;
  onPreviewTriggered: (callback: (payload: ReminderEventPayload) => void) => () => void;
}

const api: ITaskBuddyAPI = {
  getTasks: () => ipcRenderer.invoke('tasks:getAll'),
  createTask: (input) => ipcRenderer.invoke('tasks:create', input),
  updateTask: (id, updates) => ipcRenderer.invoke('tasks:update', id, updates),
  completeTask: (id) => ipcRenderer.invoke('tasks:complete', id),
  reopenTask: (id) => ipcRenderer.invoke('tasks:reopen', id),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),

  handleReminderAction: (action, reminderId, snoozeMinutes) =>
    ipcRenderer.invoke('reminders:action', action, reminderId, snoozeMinutes),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (updates) => ipcRenderer.invoke('settings:update', updates),
  previewCharacter: () => ipcRenderer.invoke('character:preview'),

  openDashboard: () => ipcRenderer.invoke('system:openDashboard'),
  hideCharacter: () => ipcRenderer.invoke('character:hide'),
  quitApp: () => ipcRenderer.invoke('system:quit'),

  onReminderDue: (callback) => {
    const handler = (_event: any, payload: ReminderEventPayload) => callback(payload);
    ipcRenderer.on('reminder:due', handler);
    return () => ipcRenderer.removeListener('reminder:due', handler);
  },

  onDailyBriefing: (callback) => {
    const handler = (_event: any, payload: DailyBriefingPayload) => callback(payload);
    ipcRenderer.on('reminder:briefing', handler);
    return () => ipcRenderer.removeListener('reminder:briefing', handler);
  },

  onPreviewTriggered: (callback) => {
    const handler = (_event: any, payload: ReminderEventPayload) => callback(payload);
    ipcRenderer.on('character:previewEvent', handler);
    return () => ipcRenderer.removeListener('character:previewEvent', handler);
  },
};

contextBridge.exposeInMainWorld('taskBuddy', api);
