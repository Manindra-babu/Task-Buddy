-- TaskBuddy Initial SQLite Schema

CREATE TABLE IF NOT EXISTS migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('online_tests', 'hackathons', 'reviews', 'presentations', 'academics', 'personal', 'other')),
  deadline_at TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'canceled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline_at);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK(reminder_type IN ('two_day', 'one_day', 'deadline_day', 'overdue', 'custom')),
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'delivered', 'dismissed', 'snoozed', 'canceled', 'failed')),
  delivered_at TEXT,
  snoozed_until TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(task_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_status ON reminders(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
