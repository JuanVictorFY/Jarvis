import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, nativeImage, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ClaudeService } from './services/ClaudeService';
import { ConfigService } from './services/ConfigService';
import { WindowStateService } from './services/WindowStateService';
import { MemoryStore } from './services/memory/MemoryStore';
import { MemoryPersistence } from './services/memory/MemoryPersistence';
import { ConversationHistory } from './services/history/ConversationHistory';
import { NotificationService } from './services/notifications/NotificationService';
import { createLogger } from './utils/dev/logger';
import type { AgentEvent, JarvisConfig } from './types/index';

const log = createLogger('main');

// ── State ─────────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const pendingConfirms = new Map<string, (ok: boolean) => void>();

const configService       = new ConfigService();
const windowStateService  = new WindowStateService();
const memoryStore         = new MemoryStore();
const memoryPersistence   = new MemoryPersistence(
  path.join(app.getPath('userData'), 'memory.json'),
);
const conversationHistory = new ConversationHistory();
const notificationService = new NotificationService();

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
  const winState = windowStateService.get();

  mainWindow = new BrowserWindow({
    width:     winState.width,
    height:    winState.height,
    x:         winState.x,
    y:         winState.y,
    minWidth:  380,
    minHeight: 500,
    title:     'Jarvis',
    icon:      fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#1a1a1a',
    show: false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (winState.isMaximized) mainWindow?.maximize();
    log('info', 'Window ready and visible');
  });

  const saveState = () => {
    if (!mainWindow) return;
    windowStateService.save({
      ...mainWindow.getBounds(),
      isMaximized: mainWindow.isMaximized(),
    });
  };
  mainWindow.on('resize',     saveState);
  mainWindow.on('move',       saveState);
  mainWindow.on('maximize',   saveState);
  mainWindow.on('unmaximize', saveState);

  mainWindow.on('close', (e) => {
    e.preventDefault();
    saveState();
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
app.whenReady().then(async () => {
  try {
    const entries = await memoryPersistence.load();
    entries.forEach(e => memoryStore.set(e.key, e.value));
    log('info', `Memory restored: ${entries.length} entries`);
  } catch (err) {
    log('warn', 'Could not restore memory', err);
  }

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

  log('info', 'Jarvis started');
});

app.on('will-quit', async () => {
  globalShortcut.unregisterAll();
  try {
    await memoryPersistence.save(memoryStore.all());
    log('info', 'Memory persisted on exit');
  } catch (err) {
    log('warn', 'Could not persist memory on exit', err);
  }
  await claudeService.closeBrowser();
});

app.on('window-all-closed', () => {
  // Stay alive in system tray on all platforms
});

// ── Core agent IPC ────────────────────────────────────────────────────────────
const IPC_TIMEOUT_MS = 5 * 60 * 1000;

ipcMain.handle('send-message', async (event, text: string) => {
  const sender = event.sender;

  const timer = setTimeout(() => {
    if (!sender.isDestroyed()) {
      log('warn', 'Agent loop timed out');
      sender.send('agent:event', {
        type: 'error',
        message: 'Agent timed out after 5 minutes. Please try again.',
      } satisfies AgentEvent);
    }
  }, IPC_TIMEOUT_MS);

  try {
    for await (const ev of claudeService.agentLoop(text)) {
      if (!sender.isDestroyed()) sender.send('agent:event', ev);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'agentLoop error', message);
    if (!sender.isDestroyed()) {
      sender.send('agent:event', { type: 'error', message } satisfies AgentEvent);
    }
  } finally {
    clearTimeout(timer);
  }
});

ipcMain.handle('confirm-action', (_event, id: string, approved: boolean) => {
  pendingConfirms.get(id)?.(approved);
  pendingConfirms.delete(id);
});

ipcMain.handle('clear-history', () => {
  claudeService.clearHistory();
  log('info', 'Conversation history cleared');
});

ipcMain.handle('get-config', (): JarvisConfig => configService.get());

ipcMain.handle('save-config', (_event, partial: Partial<JarvisConfig>) => {
  configService.update(partial);
  log('info', 'Config saved:', Object.keys(partial).join(', '));
});

ipcMain.handle('open-external', (_event, url: string) => {
  void shell.openExternal(url);
});

ipcMain.handle('open-settings', () => {
  mainWindow?.webContents.send('open-settings', configService.get());
  mainWindow?.show();
  mainWindow?.focus();
});

// ── Memory IPC ────────────────────────────────────────────────────────────────
ipcMain.handle('memory:set', (_event, key: string, value: unknown) => {
  const entry = memoryStore.set(key, value);
  void memoryPersistence.save(memoryStore.all());
  return entry;
});

ipcMain.handle('memory:get', (_event, key: string) => memoryStore.get(key));

ipcMain.handle('memory:delete', (_event, key: string) => {
  const ok = memoryStore.delete(key);
  void memoryPersistence.save(memoryStore.all());
  return ok;
});

ipcMain.handle('memory:all', () => memoryStore.all());

// ── Conversation history IPC ──────────────────────────────────────────────────
ipcMain.handle('history:create', (_event, title?: string) =>
  conversationHistory.create(title),
);

ipcMain.handle('history:all', () => conversationHistory.getAll());

ipcMain.handle('history:delete', (_event, id: string) =>
  conversationHistory.delete(id),
);

ipcMain.handle('history:add-message', (
  _event,
  conversationId: string,
  msg: { role: 'user' | 'assistant' | 'system'; content: string },
) =>
  conversationHistory.addMessage(conversationId, {
    ...msg,
    timestamp: Date.now(),
  }),
);

// ── Notifications IPC ─────────────────────────────────────────────────────────
ipcMain.handle('notifications:send', (
  _event,
  title: string,
  body: string,
  level?: 'info' | 'success' | 'warning' | 'error',
) => notificationService.send(title, body, level ?? 'info'));

ipcMain.handle('notifications:all',   () => notificationService.getAll());
ipcMain.handle('notifications:unread', () => notificationService.getUnread());

ipcMain.handle('notifications:mark-read', (_event, id: string) =>
  notificationService.markRead(id),
);

notificationService.onNotification((n) => {
  mainWindow?.webContents.send('notification:new', n);
});
