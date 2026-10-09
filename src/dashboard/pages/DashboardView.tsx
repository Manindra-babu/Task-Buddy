import React, { useState, useEffect, useMemo } from 'react';
import { Task, AppSettings, TaskCategory } from '../../shared/types';
import { Header } from '../components/Header';
import { Sidebar, DashboardTab } from '../components/Sidebar';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { DailyBriefingBanner } from '../components/DailyBriefingBanner';
import { SettingsView } from './SettingsView';
import { OnboardingModal } from './OnboardingModal';
import { CATEGORY_LABELS, DEFAULT_SETTINGS } from '../../shared/constants';
import { Plus, CheckCircle, Calendar, Sparkles } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [briefingDismissed, setBriefingDismissed] = useState(false);

  // Load data
  const refreshTasks = async () => {
    if (window.taskBuddy) {
      const all = await window.taskBuddy.getTasks();
      setTasks(all || []);
    }
  };

  const loadSettings = async () => {
    if (window.taskBuddy) {
      const s = await window.taskBuddy.getSettings();
      if (s) setSettings(s);
    }
  };

  useEffect(() => {
    refreshTasks();
    loadSettings();

    // Listen for background updates
    if (window.taskBuddy) {
      const interval = setInterval(refreshTasks, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  // Compute tabs and counts
  const now = new Date();
  const nowMs = now.getTime();

  const counts = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let overdue = 0;
    let completed = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        completed++;
        return;
      }
      const d = new Date(t.deadline_at);
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      if (isToday) today++;
      if (d.getTime() < nowMs) {
        overdue++;
      } else {
        upcoming++;
      }
    });

    return { today, upcoming, overdue, completed };
  }, [tasks, nowMs]);

  // Filter tasks based on active tab
  const displayedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (currentTab === 'completed') {
        return t.status === 'completed';
      }

      if (t.status === 'completed') return false;

      const d = new Date(t.deadline_at);

      if (currentTab === 'today') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }

      if (currentTab === 'overdue') {
        return d.getTime() < nowMs;
      }

      if (currentTab === 'upcoming') {
        return d.getTime() >= nowMs;
      }

      if (currentTab === 'category') {
        return selectedCategory ? t.category === selectedCategory : true;
      }

      return true;
    });
  }, [tasks, currentTab, selectedCategory, nowMs]);

  // Tasks for daily briefing
  const briefingTasks = useMemo(() => {
    if (briefingDismissed) return [];
    return tasks
      .filter((t) => t.status === 'pending')
      .sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime())
      .slice(0, 4);
  }, [tasks, briefingDismissed]);

  const handleTaskSubmit = async (taskData: any) => {
    if (!window.taskBuddy) return;
    if (editingTask) {
      await window.taskBuddy.updateTask(editingTask.id, taskData);
    } else {
      await window.taskBuddy.createTask(taskData);
    }
    await refreshTasks();
  };

  const handleCompleteToggle = async (task: Task) => {
    if (!window.taskBuddy) return;
    if (task.status === 'completed') {
      await window.taskBuddy.reopenTask(task.id);
    } else {
      await window.taskBuddy.completeTask(task.id);
    }
    await refreshTasks();
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.taskBuddy) return;
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await window.taskBuddy.deleteTask(task.id);
      await refreshTasks();
    }
  };

  const handleSaveSettings = async (updates: Partial<AppSettings>) => {
    if (window.taskBuddy) {
      const updated = await window.taskBuddy.updateSettings(updates);
      setSettings(updated);
    }
  };

  const handlePreviewCharacter = async () => {
    if (window.taskBuddy) {
      await window.taskBuddy.previewCharacter();
    }
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case 'today':
        return 'Today’s Deadlines';
      case 'upcoming':
        return 'Upcoming Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      case 'completed':
        return 'Completed Tasks';
      case 'category':
        return selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'Category';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc' }}>
      <Header
        upcomingCount={counts.upcoming + counts.today}
        onAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onPreviewCharacter={handlePreviewCharacter}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          currentTab={currentTab}
          selectedCategory={selectedCategory}
          onSelectTab={setCurrentTab}
          onSelectCategory={setSelectedCategory}
          counts={counts}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {currentTab === 'settings' ? (
            <SettingsView
              settings={settings}
              onSave={handleSaveSettings}
              onPreviewCharacter={handlePreviewCharacter}
            />
          ) : (
            <div>
              {/* Daily Briefing Banner if actionable tasks exist */}
              {!briefingDismissed && briefingTasks.length > 0 && (
                <DailyBriefingBanner
                  tasks={briefingTasks}
                  onDismiss={() => setBriefingDismissed(true)}
                  onSelectTask={(t) => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}

              {/* View Title */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    {getTabTitle()}
                  </h2>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    Showing {displayedTasks.length}{' '}
                    {displayedTasks.length === 1 ? 'task' : 'tasks'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} />
                  Add Task
                </button>
              </div>

              {/* Task list or empty state */}
              {displayedTasks.length > 0 ? (
                <div>
                  {displayedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onCompleteToggle={handleCompleteToggle}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <CheckCircle size={22} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    No tasks found
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, maxWidth: 360, margin: '6px auto 16px' }}>
                    You have no {currentTab} tasks right now. Stay ahead by adding your deadlines early!
                  </p>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={14} />
                    Add a Task
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
        defaultDeadlineTime={settings.defaultDeadlineTime}
      />

      {/* Onboarding Modal on First Launch */}
      <OnboardingModal
        isOpen={!settings.onboardingCompleted}
        settings={settings}
        onComplete={handleSaveSettings}
        onPreviewCharacter={handlePreviewCharacter}
      />
    </div>
  );
};
