import { ipcMain } from 'electron';
import { ReminderScheduler } from '../../src/reminders/scheduler';
import { WindowManager } from '../windows';
import { WindowsVoiceService } from '../../src/voice/voice-service';
import { SettingsRepository } from '../../database/settings-repository';
import { ReminderEventPayload } from '../../src/shared/types';

export function registerReminderHandlers(
  scheduler: ReminderScheduler,
  windowManager: WindowManager,
  voiceService: WindowsVoiceService,
  settingsRepo: SettingsRepository
): void {
  ipcMain.handle(
    'reminders:action',
    async (_event, action: 'start' | 'snooze' | 'done' | 'dismiss', reminderId: string, snoozeMinutes?: number) => {
      voiceService.stop();
      scheduler.handleUserAction(action, reminderId, snoozeMinutes ?? 15);

      // Hide character after user dismisses or acts on it
      windowManager.hideCharacter();

      // If marked done or updated, refresh main dashboard if open
      const mainWindow = windowManager.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tasks:refreshed');
      }
    }
  );

  ipcMain.handle('character:preview', async () => {
    const settings = settingsRepo.getSettings();
    const previewPayload: ReminderEventPayload = {
      reminder: {
        id: 'preview_reminder',
        task_id: 'preview_task',
        reminder_type: 'deadline_day',
        scheduled_at: new Date().toISOString(),
        status: 'scheduled',
        delivered_at: null,
        snoozed_until: null,
        attempt_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      task: {
        id: 'preview_task',
        title: 'Complete Hackathon Presentation',
        category: 'hackathons',
        deadline_at: new Date(Date.now() + 3600000 * 2).toISOString(),
        priority: 'high',
        status: 'pending',
        notes: 'Preview demo for character companion.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      message:
        "Hey! I'm TaskBuddy, your desktop deadline companion. I'll make sure you never miss a deadline!",
      categoryLabel: 'Hackathons',
      isOverdue: false,
      remainingText: 'in 2 hours',
      queueCount: 1,
    };

    windowManager.showCharacterWithoutFocus();
    const charWindow = windowManager.getCharacterWindow();
    if (charWindow && !charWindow.isDestroyed()) {
      charWindow.webContents.send('reminder:due', previewPayload);
    }

    if (settings.voiceEnabled) {
      voiceService.speak(previewPayload.message, {
        volume: settings.voiceVolume,
        rate: settings.voiceRate,
        voiceEnabled: settings.voiceEnabled,
      });
    }
  });

  ipcMain.handle('character:hide', async () => {
    voiceService.stop();
    windowManager.hideCharacter();
  });
}
