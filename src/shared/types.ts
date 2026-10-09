export type TaskCategory =
  | 'online_tests'
  | 'hackathons'
  | 'reviews'
  | 'presentations'
  | 'academics'
  | 'personal'
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed' | 'canceled';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  deadline_at: string; // ISO 8601 string
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type ReminderType =
  | 'two_day'
  | 'one_day'
  | 'deadline_day'
  | 'overdue'
  | 'custom';

export type ReminderStatus =
  | 'scheduled'
  | 'delivered'
  | 'dismissed'
  | 'snoozed'
  | 'canceled'
  | 'failed';

export interface Reminder {
  id: string;
  task_id: string;
  reminder_type: ReminderType;
  scheduled_at: string; // ISO 8601 string
  status: ReminderStatus;
  delivered_at: string | null;
  snoozed_until: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  defaultReminderTwoDay: boolean;
  defaultReminderOneDay: boolean;
  defaultReminderDeadlineDay: boolean;
  defaultDeadlineTime: string; // "09:00"
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  voiceEnabled: boolean;
  voiceVolume: number; // 0 to 1
  voiceRate: number; // 0.5 to 1.5
  characterSize: 'normal' | 'large' | 'compact';
  avatarModel: 'student' | 'robot';
  startupEnabled: boolean;
  onboardingCompleted: boolean;
  lastReconciliationAt: string | null;
}

export type CharacterAnimationState =
  | 'hidden'
  | 'entering'
  | 'idle'
  | 'speaking'
  | 'pointing'
  | 'celebrating'
  | 'dismissed'
  | 'exiting'
  | 'error';

export interface ReminderEventPayload {
  reminder: Reminder;
  task: Task;
  message: string;
  categoryLabel: string;
  isOverdue: boolean;
  remainingText: string;
  queueCount?: number;
}

export interface DailyBriefingPayload {
  tasks: Task[];
  summaryMessage: string;
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
}
