import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority } from '../../shared/types';
import { CATEGORY_LABELS } from '../../shared/constants';
import { formatDateForInput, formatTimeForInput } from '../../shared/date-utils';
import { validateTaskInput } from '../../tasks/validation/task-validator';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    category: TaskCategory;
    deadlineDate: string;
    deadlineToTime?: string;
    priority: TaskPriority;
    notes?: string;
    next_action?: string;
    destination_url?: string;
  }) => Promise<void>;
  initialTask?: Task | null;
  defaultDeadlineTime?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDeadlineTime = '09:00',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('online_tests');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineToTime, setDeadlineToTime] = useState(defaultDeadlineTime);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      const d = new Date(initialTask.deadline_at);
      setDeadlineDate(formatDateForInput(d));
      setDeadlineToTime(formatTimeForInput(d));
      setPriority(initialTask.priority);
      setNotes(initialTask.notes || '');
      setNextAction(initialTask.next_action || '');
      setDestinationUrl(initialTask.destination_url || '');
    } else {
      setTitle('');
      setCategory('online_tests');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeadlineDate(formatDateForInput(tomorrow));
      setDeadlineToTime(defaultDeadlineTime);
      setPriority('medium');
      setNotes('');
      setNextAction('');
      setDestinationUrl('');
    }
    setErrors({});
  }, [initialTask, isOpen, defaultDeadlineTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTaskInput({
      title,
      category,
      deadlineDate,
      deadlineToTime,
      priority,
      notes,
      next_action: nextAction,
      destination_url: destinationUrl,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        category,
        deadlineDate,
        deadlineToTime,
        priority,
        notes: notes.trim() ? notes.trim() : undefined,
        next_action: nextAction.trim() ? nextAction.trim() : undefined,
        destination_url: destinationUrl.trim() ? destinationUrl.trim() : undefined,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errors.form && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Physics Midterm Exam or Final Demo Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          {/* Category */}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            {errors.category && <div className="form-error">{errors.category}</div>}
          </div>

          {/* Deadline Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="form-label">Deadline Date *</label>
              <input
                type="date"
                className="form-input"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
              {errors.deadlineDate && (
                <div className="form-error">{errors.deadlineDate}</div>
              )}
            </div>

            <div>
              <label className="form-label">Time (Optional)</label>
              <input
                type="time"
                className="form-input"
                value={deadlineToTime}
                onChange={(e) => setDeadlineToTime(e.target.value)}
              />
            </div>
          </div>

          {/* Priority */}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Priority *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: isSelected
                        ? '2px solid #2563eb'
                        : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#475569',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Action / Step */}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Next Action / Immediate Step (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Finish demo video, review slides with team..."
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
            {errors.next_action && <div className="form-error">{errors.next_action}</div>}
          </div>

          {/* Destination URL */}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Destination URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://devpost.com, https://canvas.edu..."
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
            {errors.destination_url && <div className="form-error">{errors.destination_url}</div>}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Guidelines, rules, or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {errors.notes && <div className="form-error">{errors.notes}</div>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
