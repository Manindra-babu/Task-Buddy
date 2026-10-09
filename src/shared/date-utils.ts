/**
 * Date and time utilities for TaskBuddy
 */

export function parseISO(isoString: string): Date {
  return new Date(isoString);
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time for input[type="time"] (HH:mm)
 */
export function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Combine date string (YYYY-MM-DD) and optional time string (HH:mm)
 * If no time provided, defaults to defaultTime (e.g. "09:00").
 */
export function combineDateTime(dateStr: string, timeStr?: string | null, defaultTime = '09:00'): string {
  const time = timeStr && timeStr.trim().length > 0 ? timeStr.trim() : defaultTime;
  const [hours, minutes] = time.split(':').map((n) => parseInt(n, 10));
  const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10));

  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return d.toISOString();
}

/**
 * Format deadline human-readable e.g. "Tomorrow at 9:00 AM" or "Fri, Oct 10 at 2:00 PM"
 */
export function formatDeadline(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const timeFormatted = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeFormatted}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeFormatted}`;
  }

  const dateFormatted = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${dateFormatted} at ${timeFormatted}`;
}

/**
 * Get human remaining time string e.g. "in 2 days", "in 4 hours", "3 hours overdue"
 */
export function getTimeRemaining(isoString: string, relativeTo = new Date()): {
  text: string;
  isOverdue: boolean;
  diffMinutes: number;
} {
  const target = new Date(isoString).getTime();
  const now = relativeTo.getTime();
  const diffMs = target - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const isOverdue = diffMs < 0;

  const absMinutes = Math.abs(diffMinutes);
  const days = Math.floor(absMinutes / (60 * 24));
  const hours = Math.floor((absMinutes % (60 * 24)) / 60);
  const minutes = absMinutes % 60;

  let unitText = '';
  if (days > 1) {
    unitText = `${days} days`;
  } else if (days === 1) {
    unitText = `1 day ${hours > 0 ? `${hours}h` : ''}`;
  } else if (hours > 0) {
    unitText = `${hours}h ${minutes}m`;
  } else {
    unitText = `${minutes} min`;
  }

  if (isOverdue) {
    return {
      text: `${unitText} overdue`,
      isOverdue: true,
      diffMinutes,
    };
  }

  return {
    text: `in ${unitText}`,
    isOverdue: false,
    diffMinutes,
  };
}

/**
 * Check if the current time falls inside quiet hours
 * Supports overnight quiet hours (e.g. 22:00 to 07:00)
 */
export function isQuietHour(
  now: Date,
  quietStart = '22:00',
  quietEnd = '07:00'
): boolean {
  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Overnight window (e.g. 22:00 -> 07:00 next day)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else if (startMinutes < endMinutes) {
    // Same day window (e.g. 13:00 -> 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return false;
}

/**
 * Calculate snooze date (e.g. 15 minutes, 1 hour, or until quiet hours end)
 */
export function calculateSnoozeDate(minutes: number, baseDate = new Date()): Date {
  const snoozed = new Date(baseDate.getTime() + minutes * 60 * 1000);
  return snoozed;
}

/**
 * Generate friendly, supportive speech text according to prompt guidelines
 */
export function generateReminderMessage(
  title: string,
  categoryLabel: string,
  reminderType: string,
  isOverdue: boolean
): string {
  if (isOverdue) {
    return `Your task "${title}" is overdue. Let's decide the next step together!`;
  }

  switch (reminderType) {
    case 'two_day':
      return `Hey! Your ${categoryLabel.toLowerCase()} task "${title}" is due in two days. Let's make steady progress today.`;
    case 'one_day':
      return `Quick reminder! "${title}" is due tomorrow. Have you finished preparing?`;
    case 'deadline_day':
      return `Your task "${title}" is due today. Let's make sure everything is ready and completed on time!`;
    default:
      return `Here is your reminder for "${title}". Let's get to work!`;
  }
}
