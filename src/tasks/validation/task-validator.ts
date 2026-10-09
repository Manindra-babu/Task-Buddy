import { TaskCategory, TaskPriority } from '../../shared/types';

export interface TaskInput {
  title: string;
  category: TaskCategory;
  deadlineDate: string; // YYYY-MM-DD
  deadlineToTime?: string; // HH:mm
  priority: TaskPriority;
  notes?: string;
  next_action?: string;
  destination_url?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const VALID_CATEGORIES: TaskCategory[] = [
  'online_tests',
  'hackathons',
  'reviews',
  'presentations',
  'academics',
  'personal',
  'other',
];

const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function validateTaskInput(input: Partial<TaskInput>): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (input.title.trim().length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  // Category validation
  if (!input.category) {
    errors.category = 'Category is required';
  } else if (!VALID_CATEGORIES.includes(input.category)) {
    errors.category = 'Invalid category selected';
  }

  // Deadline date validation
  if (!input.deadlineDate || input.deadlineDate.trim().length === 0) {
    errors.deadlineDate = 'Deadline date is required';
  } else {
    const parts = input.deadlineDate.split('-');
    if (parts.length !== 3 || isNaN(new Date(input.deadlineDate).getTime())) {
      errors.deadlineDate = 'Please provide a valid date (YYYY-MM-DD)';
    }
  }

  // Priority validation
  if (!input.priority) {
    errors.priority = 'Priority is required';
  } else if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.priority = 'Priority must be Low, Medium, or High';
  }

  // Notes validation (optional)
  if (input.notes && input.notes.length > 2000) {
    errors.notes = 'Notes must be 2000 characters or less';
  }

  // Next action validation (optional)
  if (input.next_action && input.next_action.length > 500) {
    errors.next_action = 'Next action must be 500 characters or less';
  }

  // Destination URL validation (optional)
  if (input.destination_url && input.destination_url.trim().length > 0) {
    const trimmedUrl = input.destination_url.trim();
    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.destination_url = 'Destination URL must begin with http:// or https://';
      }
    } catch {
      errors.destination_url = 'Please provide a valid URL (e.g. https://github.com)';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
