import { BrowserWindow, screen, app } from 'electron';
import path from 'path';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private characterWindow: BrowserWindow | null = null;
  private isQuitting = false;

  constructor(private isDev: boolean, private devServerUrl: string) {}

  setQuitting(val: boolean) {
    this.isQuitting = val;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getCharacterWindow(): BrowserWindow | null {
    return this.characterWindow;
  }

  createMainWindow(): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show();
      this.mainWindow.focus();
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 1180,
      height: 760,
      minWidth: 920,
      minHeight: 600,
      title: 'TaskBuddy',
      backgroundColor: '#f8fafc',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    if (this.isDev) {
      this.mainWindow.loadURL(`${this.devServerUrl}#dashboard`);
    } else {
      this.mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        hash: 'dashboard',
      });
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Minimize to tray on close unless quitting
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  createCharacterWindow(): BrowserWindow {
    if (this.characterWindow && !this.characterWindow.isDestroyed()) {
      return this.characterWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { workArea } = primaryDisplay;

    const winWidth = 460;
    const winHeight = 440;
    const x = Math.round(workArea.x + workArea.width - winWidth - 20);
    const y = Math.round(workArea.y + workArea.height - winHeight - 20);

    this.characterWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      x,
      y,
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    // Keep always-on-top above ordinary windows
    this.characterWindow.setAlwaysOnTop(true, 'screen-saver');

    if (this.isDev) {
      this.characterWindow.loadURL(`${this.devServerUrl}#character`);
    } else {
      this.characterWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        hash: 'character',
      });
    }

    this.characterWindow.on('closed', () => {
      this.characterWindow = null;
    });

    return this.characterWindow;
  }

  showCharacterWithoutFocus(): void {
    if (!this.characterWindow || this.characterWindow.isDestroyed()) {
      this.createCharacterWindow();
    }
    // Reposition to current work area in case of resolution changes
    const primaryDisplay = screen.getPrimaryDisplay();
    const { workArea } = primaryDisplay;
    const winWidth = 460;
    const winHeight = 440;
    const x = Math.round(workArea.x + workArea.width - winWidth - 20);
    const y = Math.round(workArea.y + workArea.height - winHeight - 20);

    this.characterWindow?.setBounds({ x, y, width: winWidth, height: winHeight });
    this.characterWindow?.showInactive();
  }

  hideCharacter(): void {
    if (this.characterWindow && !this.characterWindow.isDestroyed()) {
      this.characterWindow.hide();
    }
  }
}
