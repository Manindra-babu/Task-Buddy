import { describe, it, expect } from 'vitest';
import { validateTaskInput } from '../../src/tasks/validation/task-validator';

describe('Task Validator Unit Tests', () => {
  it('validates a complete, valid task input', () => {
    const res = validateTaskInput({
      title: 'Operating Systems Midterm',
      category: 'online_tests',
      deadlineDate: '2026-10-15',
      deadlineToTime: '10:00',
      priority: 'high',
      notes: 'Chapters 1-5',
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it('fails when title is empty or missing', () => {
    const res = validateTaskInput({
      title: '   ',
      category: 'hackathons',
      deadlineDate: '2026-10-15',
      priority: 'medium',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.title).toBe('Title is required');
  });

  it('fails when title exceeds maximum length', () => {
    const res = validateTaskInput({
      title: 'a'.repeat(201),
      category: 'academics',
      deadlineDate: '2026-10-15',
      priority: 'low',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.title).toContain('200 characters');
  });

  it('fails on invalid category', () => {
    const res = validateTaskInput({
      title: 'Project Demo',
      category: 'invalid_category' as any,
      deadlineDate: '2026-10-15',
      priority: 'low',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.category).toBe('Invalid category selected');
  });

  it('fails on invalid or empty date', () => {
    const res = validateTaskInput({
      title: 'Project Demo',
      category: 'reviews',
      deadlineDate: '',
      priority: 'low',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.deadlineDate).toBe('Deadline date is required');
  });

  it('fails on invalid priority', () => {
    const res = validateTaskInput({
      title: 'Project Demo',
      category: 'presentations',
      deadlineDate: '2026-10-15',
      priority: 'urgent' as any,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.priority).toBe('Priority must be Low, Medium, or High');
  });

  it('validates optional next_action and destination_url', () => {
    const res = validateTaskInput({
      title: 'Hackathon Submission',
      category: 'hackathons',
      deadlineDate: '2026-10-15',
      priority: 'high',
      next_action: 'Record final demo video',
      destination_url: 'https://devpost.com',
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it('fails when destination_url has invalid format or non-http protocol', () => {
    const res = validateTaskInput({
      title: 'Hackathon Submission',
      category: 'hackathons',
      deadlineDate: '2026-10-15',
      priority: 'high',
      destination_url: 'ftp://not-allowed.com',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.destination_url).toContain('http:// or https://');

    const res2 = validateTaskInput({
      title: 'Hackathon Submission',
      category: 'hackathons',
      deadlineDate: '2026-10-15',
      priority: 'high',
      destination_url: 'invalid-url',
    });
    expect(res2.valid).toBe(false);
    expect(res2.errors.destination_url).toContain('valid URL');
  });
});
