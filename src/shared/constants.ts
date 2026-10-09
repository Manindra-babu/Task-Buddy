import { TaskCategory, AppSettings } from './types';

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  online_tests: 'Online Tests',
  hackathons: 'Hackathons',
  reviews: 'Reviews',
  presentations: 'Presentations',
  academics: 'Academics',
  personal: 'Personal',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  online_tests: 'GraduationCap',
  hackathons: 'Rocket',
  reviews: 'FileCheck',
  presentations: 'MonitorPlay',
  academics: 'BookOpen',
  personal: 'User',
  other: 'Tag',
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultReminderTwoDay: true,
  defaultReminderOneDay: true,
  defaultReminderDeadlineDay: true,
  defaultDeadlineTime: '09:00',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  voiceEnabled: true,
  voiceVolume: 0.9,
  voiceRate: 1.0,
  characterSize: 'normal',
  avatarModel: 'student',
  startupEnabled: true,
  onboardingCompleted: false,
  lastReconciliationAt: null,
};
