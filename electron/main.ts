import { app, BrowserWindow, powerMonitor, Notification, Menu } from 'electron';
import path from 'path';
import { TaskBuddyDatabase } from '../database/database';
import { TaskRepository } from '../database/task-repository';
import { ReminderRepository } from '../database/reminder-repository';
import { SettingsRepository } from '../database/settings-repository';
import { ReminderScheduler } from '../src/reminders/scheduler';
import { WindowsVoiceService } from '../src/voice/voice-service';
import { WindowManager } from './windows';
import { TrayManager } from './tray';
import { registerTaskHandlers } from './ipc/task-handlers';
import { registerReminderHandlers } from './ipc/reminder-handlers';
import { registerSettingsHandlers } from './ipc/settings-handlers';
import { StartupManager } from './startup';

const isDev = (process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true') && !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/';

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let database: TaskBuddyDatabase;
let taskRepo: TaskRepository;
let reminderRepo: ReminderRepository;
let settingsRepo: SettingsRepository;
let scheduler: ReminderScheduler;
let voiceService: WindowsVoiceService;
let windowManager: WindowManager;
let trayManager: TrayManager;

async function bootstrap() {
  // Determine SQLite storage location in per-user AppData
  const dbPath = path.join(app.getPath('userData'), 'taskbuddy.sqlite');
  const resourcesPath = (process as any).resourcesPath;
  const wasmPath = resourcesPath ? path.join(resourcesPath, 'sql-wasm.wasm') : undefined;

  database = new TaskBuddyDatabase();
  await database.init({ dbPath, wasmBinaryPath: wasmPath });

  taskRepo = new TaskRepository(database);
  reminderRepo = new ReminderRepository(database);
  settingsRepo = new SettingsRepository(database);

  // Initialize services
  voiceService = new WindowsVoiceService();
  scheduler = new ReminderScheduler(taskRepo, reminderRepo, settingsRepo);
  windowManager = new WindowManager(isDev, devServerUrl);

  // Setup delivery callback
  scheduler.onDeliver(async (payload) => {
    try {
      windowManager.showCharacterWithoutFocus();
      const charWin = windowManager.getCharacterWindow();
      if (charWin && !charWin.isDestroyed()) {
        charWin.webContents.send('reminder:due', payload);
      }

      const settings = settingsRepo.getSettings();
      if (settings.voiceEnabled) {
        voiceService.speak(payload.message, {
          volume: settings.voiceVolume,
          rate: settings.voiceRate,
          voiceEnabled: settings.voiceEnabled,
        });
      }

      // Windows native toast notification fallback if supported
      if (Notification.isSupported()) {
        const notif = new Notification({
          title: `TaskBuddy: ${payload.task.title}`,
          body: payload.message,
          silent: true, // We already use our offline voice / speech
        });
        notif.on('click', () => {
          windowManager.createMainWindow();
        });
        notif.show();
      }
    } catch (err) {
      console.error('Failed to present reminder:', err);
    }
  });

  // Tray manager
  trayManager = new TrayManager(windowManager, scheduler, () => {
    // Character preview from tray
    const charWin = windowManager.createCharacterWindow();
    windowManager.showCharacterWithoutFocus();
    charWin.webContents.send('character:previewEvent');
  });
  trayManager.init();

  // Register IPC handlers
  registerTaskHandlers(taskRepo, settingsRepo, scheduler);
  registerReminderHandlers(scheduler, windowManager, voiceService, settingsRepo);
  registerSettingsHandlers(settingsRepo, windowManager);

  // Start background scheduler
  scheduler.start();

  // Configure Windows startup if enabled
  const currentSettings = settingsRepo.getSettings();
  if (currentSettings.startupEnabled) {
    StartupManager.configureStartup(true);
  }

  // Windows Sleep / Wakeup handler
  powerMonitor.on('resume', () => {
    scheduler.reconcile();
  });

  // Remove default application menu so no unwanted white menu strip appears
  Menu.setApplicationMenu(null);

  // TaskBuddy is designed to be quiet by default, running via Windows system tray.
  // The signature Deadline Beacon appears at the bottom-right when reminders are due.
  // The dashboard window is only rendered when explicitly opened from the tray or beacon.
  const isExplicitShow = process.argv.includes('--show-dashboard') || process.argv.includes('--show');
  if (isExplicitShow) {
    windowManager.createMainWindow();
  }
}

app.on('second-instance', () => {
  const mainWin = windowManager?.getMainWindow();
  if (mainWin) {
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.show();
    mainWin.focus();
  } else {
    windowManager?.createMainWindow();
  }
});

app.whenReady().then(async () => {
  try {
    await bootstrap();
  } catch (err: any) {
    console.error('TaskBuddy bootstrap failed:', err);
    try {
      const { dialog } = require('electron');
      dialog.showErrorBox('TaskBuddy Initialization Error', String(err?.stack || err?.message || err));
    } catch {
      // ignore dialog error
    }
  }
});

app.on('before-quit', () => {
  windowManager?.setQuitting(true);
  scheduler?.stop();
  voiceService?.stop();
  trayManager?.destroy();
  database?.close();
});

app.on('window-all-closed', () => {
  // On Windows, keep running in tray when dashboard window is closed
});
