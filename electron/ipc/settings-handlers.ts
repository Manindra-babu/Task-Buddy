import { ipcMain, app } from 'electron';
import { SettingsRepository } from '../../database/settings-repository';
import { AppSettings } from '../../src/shared/types';
import { StartupManager } from '../startup';
import { WindowManager } from '../windows';

export function registerSettingsHandlers(
  settingsRepo: SettingsRepository,
  windowManager: WindowManager
): void {
  ipcMain.handle('settings:get', async () => {
    return settingsRepo.getSettings();
  });

  ipcMain.handle('settings:update', async (_event, updates: Partial<AppSettings>) => {
    const updated = settingsRepo.updateSettings(updates);
    if (updates.startupEnabled !== undefined) {
      StartupManager.configureStartup(updates.startupEnabled);
    }
    return updated;
  });

  ipcMain.handle('system:openDashboard', async () => {
    windowManager.createMainWindow();
  });

  ipcMain.handle('system:quit', async () => {
    windowManager.setQuitting(true);
    app.quit();
  });
}
