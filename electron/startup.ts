import { app } from 'electron';

export class StartupManager {
  static configureStartup(enable: boolean): boolean {
    try {
      if (app.isPackaged) {
        app.setLoginItemSettings({
          openAtLogin: enable,
          path: process.execPath,
          args: ['--hidden'],
        });
      } else {
        // In dev mode, don't corrupt registry with dev electron paths
        app.setLoginItemSettings({
          openAtLogin: enable,
        });
      }
      return true;
    } catch (err) {
      console.warn('Failed to configure Windows startup:', err);
      return false;
    }
  }

  static isStartupEnabled(): boolean {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch {
      return false;
    }
  }
}
