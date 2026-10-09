import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { WindowManager } from './windows';
import { ReminderScheduler } from '../src/reminders/scheduler';

export class TrayManager {
  private tray: Tray | null = null;

  constructor(
    private windowManager: WindowManager,
    private scheduler: ReminderScheduler,
    private onPreview: () => void
  ) {}

  init(): void {
    // Generate simple 16x16 tray icon programmatically or from assets
    const icon = this.createDefaultIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip('TaskBuddy - Deadline Companion');

    this.tray.on('double-click', () => {
      this.windowManager.createMainWindow();
    });

    this.updateContextMenu();
  }

  updateContextMenu(): void {
    if (!this.tray) return;

    const isPaused = this.scheduler.getIsPaused();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open TaskBuddy',
        click: () => {
          this.windowManager.createMainWindow();
        },
      },
      {
        label: 'Character Preview',
        click: () => {
          this.onPreview();
        },
      },
      { type: 'separator' },
      {
        label: isPaused ? 'Resume Reminders' : 'Pause Reminders',
        click: () => {
          if (isPaused) {
            this.scheduler.resume();
          } else {
            this.scheduler.pause();
          }
          this.updateContextMenu();
        },
      },
      { type: 'separator' },
      {
        label: 'Exit TaskBuddy',
        click: () => {
          this.windowManager.setQuitting(true);
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  private createDefaultIcon(): Electron.NativeImage {
    // 16x16 PNG with blue circle for TaskBuddy
    // Base64 transparent 16x16 PNG with blue badge
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAHBJREFUOE+lk8ERwCAIA8m2XIdd1A2cwS9H8DGl71Yk4DmhgCSzXQAA3jW0l8W5xghGZp7sO5s5g6R+s9/eB2QAVgZ8V4RkJ0kZIBGf2aT7J5Akz6r/eUAmwG1W9c4Dkguw6nUeYBXWep/gLwX1B9bWd/P+v8lVAAAAAElFTkSuQmCC';
    const buffer = Buffer.from(pngBase64, 'base64');
    return nativeImage.createFromBuffer(buffer);
  }
}
