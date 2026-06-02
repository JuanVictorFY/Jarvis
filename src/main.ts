import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, nativeImage, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ClaudeService } from './services/ClaudeService';
import { ConfigService } from './services/ConfigService';
import type { AgentEvent, JarvisConfig } from './types/index';

// ── State ─────────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const pendingConfirms = new Map<string, (ok: boolean) => void>();

const configService = new ConfigService();

const claudeService = new ClaudeService(
  () => configService.get(),
  (id, action, detail) => {
    mainWindow?.webContents.send('agent:event', {
      type: 'confirm', id, action, detail,
    } satisfies AgentEvent);
    return new Promise<boolean>((resolve) => {
      pendingConfirms.set(id, resolve);
    });
  },
);

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow(): void {
  const iconPath = path.join(__dirname, '../assets/icon.png');

  mainWindow = new BrowserWindow({
    width: 460,
    height: 800,
    minWidth: 380,
    minHeight: 500,
    title: 'Jarvis',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#1a1a1a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });
}

// ── Tray ──────────────────────────────────────────────────────────────────────
function createTray(): void {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const img = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();

  tray = new Tray(img);
  tray.setToolTip('Jarvis — AI Desktop Agent');

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Jarvis',
        click: () => { mainWindow?.show(); mainWindow?.focus(); },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          mainWindow?.removeAllListeners('close');
          app.quit();
        },
      },
    ]),
  );

  tray.on('click', () => {
    if (mainWindow?.isVisible() && mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+J', () => {
    if (mainWindow?.isVisible() && mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  void claudeService.closeBrowser();
});

app.on('window-all-closed', () => {
  // Keep running in tray on all platforms
});

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.handle('send-message', async (event, text: string) => {
  const sender = event.sender;
  try {
    for await (const ev of claudeService.agentLoop(text)) {
      if (!sender.isDestroyed()) {
        sender.send('agent:event', ev);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!sender.isDestroyed()) {
      sender.send('agent:event', { type: 'error', message } satisfies AgentEvent);
    }
  }
});

ipcMain.handle('confirm-action', (_event, id: string, approved: boolean) => {
  pendingConfirms.get(id)?.(approved);
  pendingConfirms.delete(id);
});

ipcMain.handle('clear-history', () => {
  claudeService.clearHistory();
});

ipcMain.handle('get-config', (): JarvisConfig => configService.get());

ipcMain.handle('save-config', (_event, partial: Partial<JarvisConfig>) => {
  configService.update(partial);
});

ipcMain.handle('open-external', (_event, url: string) => {
  void shell.openExternal(url);
});

ipcMain.handle('open-settings', () => {
  mainWindow?.webContents.send('open-settings', configService.get());
  mainWindow?.show();
  mainWindow?.focus();
});
