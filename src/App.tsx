import React, { useState, useEffect } from 'react';
import { DashboardView } from './dashboard/pages/DashboardView';
import { CharacterWindow } from './character/CharacterWindow';
import { ITaskBuddyAPI } from '../electron/preload';
import { DEFAULT_SETTINGS } from './shared/constants';
import { Task } from './shared/types';

// Mock API for browser preview if window.taskBuddy not exposed by Electron
function setupBrowserMockIfNecessary() {
  if (typeof window !== 'undefined' && !window.taskBuddy) {
    const mockTasks: Task[] = [
      {
        id: 'mock_1',
        title: 'Machine Learning Final Presentation',
        category: 'presentations',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
        priority: 'high',
        status: 'pending',
        notes: 'Prepare 10 slides on model performance and future work.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      {
        id: 'mock_2',
        title: 'Hackathon Submission (Devpost)',
        category: 'hackathons',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 42).toISOString(),
        priority: 'high',
        status: 'pending',
        notes: 'Record 2-min demo video and commit repo README.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      {
        id: 'mock_3',
        title: 'Operating Systems Online Quiz',
        category: 'online_tests',
        deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 68).toISOString(),
        priority: 'medium',
        status: 'pending',
        notes: 'Chapters 4-7 virtual memory and scheduling.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
    ];

    let mockSettings = { ...DEFAULT_SETTINGS, onboardingCompleted: true };

    const mockApi: ITaskBuddyAPI = {
      getTasks: async () => [...mockTasks],
      createTask: async (input) => {
        const t: Task = {
          id: `task_${Date.now()}`,
          title: input.title,
          category: input.category,
          deadline_at: new Date(input.deadlineDate).toISOString(),
          priority: input.priority,
          status: 'pending',
          notes: input.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
        };
        mockTasks.push(t);
        return { success: true, task: t };
      },
      updateTask: async (id, updates) => {
        const t = mockTasks.find((x) => x.id === id);
        if (t) {
          if (updates.title) t.title = updates.title;
          if (updates.category) t.category = updates.category;
          if (updates.priority) t.priority = updates.priority;
          if (updates.notes !== undefined) t.notes = updates.notes || null;
          return { success: true, task: t };
        }
        return { success: false, error: 'Not found' };
      },
      completeTask: async (id) => {
        const t = mockTasks.find((x) => x.id === id);
        if (t) {
          t.status = 'completed';
          t.completed_at = new Date().toISOString();
          return { success: true, task: t };
        }
        return { success: false };
      },
      reopenTask: async (id) => {
        const t = mockTasks.find((x) => x.id === id);
        if (t) {
          t.status = 'pending';
          t.completed_at = null;
          return { success: true, task: t };
        }
        return { success: false };
      },
      deleteTask: async (id) => {
        const idx = mockTasks.findIndex((x) => x.id === id);
        if (idx !== -1) mockTasks.splice(idx, 1);
        return { success: true };
      },
      handleReminderAction: async () => {},
      getSettings: async () => mockSettings,
      updateSettings: async (updates) => {
        mockSettings = { ...mockSettings, ...updates };
        return mockSettings;
      },
      previewCharacter: async () => {
        alert('Character preview triggered! Switch hash to #character to see 3D companion.');
      },
      openDashboard: async () => {},
      hideCharacter: async () => {},
      quitApp: async () => {},
      onReminderDue: () => () => {},
      onDailyBriefing: () => () => {},
      onPreviewTriggered: () => () => {},
    };

    (window as any).taskBuddy = mockApi;
  }
}

setupBrowserMockIfNecessary();

export const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash === '#character') {
    return <CharacterWindow />;
  }

  return <DashboardView />;
};
