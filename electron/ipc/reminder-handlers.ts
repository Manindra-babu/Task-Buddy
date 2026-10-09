import { ipcMain, shell } from 'electron';
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

      // Hide beacon window after action
      windowManager.hideCharacter();

      if (action === 'start') {
        windowManager.createMainWindow();
        const mainWindow = windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }

      // If marked done or updated, refresh main dashboard if open
      const mainWindow = windowManager.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tasks:refreshed');
      }
    }
  );

  const handlePreview = async () => {
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
        notes: 'Final slide deck and live demo test.',
        next_action: 'Finish the final demo and verify the submission.',
        destination_url: 'https://devpost.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      message: 'Hackathon presentation is due in 2 hours! Finish the final demo and verify the submission.',
      categoryLabel: 'Hackathons',
      isOverdue: false,
      remainingText: 'Due in 2 hours',
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
  };

  ipcMain.handle('beacon:preview', handlePreview);
  ipcMain.handle('character:preview', handlePreview);

  ipcMain.handle('beacon:hide', async () => {
    voiceService.stop();
    windowManager.hideCharacter();
  });
  ipcMain.handle('character:hide', async () => {
    voiceService.stop();
    windowManager.hideCharacter();
  });

  ipcMain.handle('system:openExternal', async (_event, url: string) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });
}
