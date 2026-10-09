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

    console.log('[WindowManager] Creating main window...');
    this.mainWindow = new BrowserWindow({
      width: 1180,
      height: 760,
      minWidth: 920,
      minHeight: 600,
      title: 'TaskBuddy',
      backgroundColor: '#f8fafc',
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] [Level ${level}] ${message} (${sourceId}:${line})`);
    });

    this.mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error(`[WindowManager] Main window failed to load: ${errorCode} - ${errorDescription} (${validatedURL})`);
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('[WindowManager] Main window finished loading HTML');
    });

    if (this.isDev) {
      console.log('[WindowManager] Loading dev URL:', `${this.devServerUrl}#dashboard`);
      this.mainWindow.loadURL(`${this.devServerUrl}#dashboard`);
    } else {
      const indexPath = path.join(app.getAppPath(), 'dist/index.html');
      console.log('[WindowManager] Loading production file:', indexPath);
      this.mainWindow.loadFile(indexPath, {
        hash: 'dashboard',
      }).catch((err) => {
        console.error('[WindowManager] Failed to loadFile indexPath:', indexPath, err);
      });
    }

    this.mainWindow.once('ready-to-show', () => {
      console.log('[WindowManager] ready-to-show fired');
      this.mainWindow?.show();
      this.mainWindow?.focus();
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

    const winWidth = 570;
    const winHeight = 265;
    const x = Math.round(workArea.x + workArea.width - winWidth - 16);
    const y = Math.round(workArea.y + workArea.height - winHeight - 16);

    this.characterWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      x,
      y,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      autoHideMenuBar: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    // Keep always-on-top above ordinary windows
    this.characterWindow.setAlwaysOnTop(true, 'screen-saver');

    if (this.isDev) {
      this.characterWindow.loadURL(`${this.devServerUrl}#beacon`);
    } else {
      this.characterWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        hash: 'beacon',
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
    const winWidth = 570;
    const winHeight = 265;
    const x = Math.round(workArea.x + workArea.width - winWidth - 16);
    const y = Math.round(workArea.y + workArea.height - winHeight - 16);

    this.characterWindow?.setBounds({ x, y, width: winWidth, height: winHeight });
    this.characterWindow?.showInactive();
  }

  hideCharacter(): void {
    if (this.characterWindow && !this.characterWindow.isDestroyed()) {
      this.characterWindow.hide();
    }
  }
}
