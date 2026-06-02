"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const ClaudeService_1 = require("./services/ClaudeService");
const ConfigService_1 = require("./services/ConfigService");
const WindowStateService_1 = require("./services/WindowStateService");
const MemoryStore_1 = require("./services/memory/MemoryStore");
const MemoryPersistence_1 = require("./services/memory/MemoryPersistence");
const ConversationHistory_1 = require("./services/history/ConversationHistory");
const NotificationService_1 = require("./services/notifications/NotificationService");
const logger_1 = require("./utils/dev/logger");
const log = (0, logger_1.createLogger)('main');
// ── State ─────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
const pendingConfirms = new Map();
const configService = new ConfigService_1.ConfigService();
const windowStateService = new WindowStateService_1.WindowStateService();
const memoryStore = new MemoryStore_1.MemoryStore();
const memoryPersistence = new MemoryPersistence_1.MemoryPersistence(path.join(electron_1.app.getPath('userData'), 'memory.json'));
const conversationHistory = new ConversationHistory_1.ConversationHistory();
const notificationService = new NotificationService_1.NotificationService();
const claudeService = new ClaudeService_1.ClaudeService(() => configService.get(), (id, action, detail) => {
    mainWindow?.webContents.send('agent:event', {
        type: 'confirm', id, action, detail,
    });
    return new Promise((resolve) => {
        pendingConfirms.set(id, resolve);
    });
});
// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
    const iconPath = path.join(__dirname, '../assets/icon.png');
    const winState = windowStateService.get();
    mainWindow = new electron_1.BrowserWindow({
        width: winState.width,
        height: winState.height,
        x: winState.x,
        y: winState.y,
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
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        if (winState.isMaximized)
            mainWindow?.maximize();
        log('info', 'Window ready and visible');
    });
    const saveState = () => {
        if (!mainWindow)
            return;
        windowStateService.save({
            ...mainWindow.getBounds(),
            isMaximized: mainWindow.isMaximized(),
        });
    };
    mainWindow.on('resize', saveState);
    mainWindow.on('move', saveState);
    mainWindow.on('maximize', saveState);
    mainWindow.on('unmaximize', saveState);
    mainWindow.on('close', (e) => {
        e.preventDefault();
        saveState();
        mainWindow?.hide();
    });
}
// ── Tray ──────────────────────────────────────────────────────────────────────
function createTray() {
    const iconPath = path.join(__dirname, '../assets/icon.png');
    const img = fs.existsSync(iconPath)
        ? electron_1.nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
        : electron_1.nativeImage.createEmpty();
    tray = new electron_1.Tray(img);
    tray.setToolTip('Jarvis — AI Desktop Agent');
    tray.setContextMenu(electron_1.Menu.buildFromTemplate([
        {
            label: 'Open Jarvis',
            click: () => { mainWindow?.show(); mainWindow?.focus(); },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                mainWindow?.removeAllListeners('close');
                electron_1.app.quit();
            },
        },
    ]));
    tray.on('click', () => {
        if (mainWindow?.isVisible() && mainWindow.isFocused()) {
            mainWindow.hide();
        }
        else {
            mainWindow?.show();
            mainWindow?.focus();
        }
    });
}
// ── App lifecycle ─────────────────────────────────────────────────────────────
electron_1.app.whenReady().then(async () => {
    try {
        const entries = await memoryPersistence.load();
        entries.forEach(e => memoryStore.set(e.key, e.value));
        log('info', `Memory restored: ${entries.length} entries`);
    }
    catch (err) {
        log('warn', 'Could not restore memory', err);
    }
    createWindow();
    createTray();
    electron_1.globalShortcut.register('CommandOrControl+Shift+J', () => {
        if (mainWindow?.isVisible() && mainWindow.isFocused()) {
            mainWindow.hide();
        }
        else {
            mainWindow?.show();
            mainWindow?.focus();
        }
    });
    log('info', 'Jarvis started');
});
electron_1.app.on('will-quit', async () => {
    electron_1.globalShortcut.unregisterAll();
    try {
        await memoryPersistence.save(memoryStore.all());
        log('info', 'Memory persisted on exit');
    }
    catch (err) {
        log('warn', 'Could not persist memory on exit', err);
    }
    await claudeService.closeBrowser();
});
electron_1.app.on('window-all-closed', () => {
    // Stay alive in system tray on all platforms
});
// ── Core agent IPC ────────────────────────────────────────────────────────────
const IPC_TIMEOUT_MS = 5 * 60 * 1000;
electron_1.ipcMain.handle('send-message', async (event, text) => {
    const sender = event.sender;
    const timer = setTimeout(() => {
        if (!sender.isDestroyed()) {
            log('warn', 'Agent loop timed out');
            sender.send('agent:event', {
                type: 'error',
                message: 'Agent timed out after 5 minutes. Please try again.',
            });
        }
    }, IPC_TIMEOUT_MS);
    try {
        for await (const ev of claudeService.agentLoop(text)) {
            if (!sender.isDestroyed())
                sender.send('agent:event', ev);
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log('error', 'agentLoop error', message);
        if (!sender.isDestroyed()) {
            sender.send('agent:event', { type: 'error', message });
        }
    }
    finally {
        clearTimeout(timer);
    }
});
electron_1.ipcMain.handle('confirm-action', (_event, id, approved) => {
    pendingConfirms.get(id)?.(approved);
    pendingConfirms.delete(id);
});
electron_1.ipcMain.handle('clear-history', () => {
    claudeService.clearHistory();
    log('info', 'Conversation history cleared');
});
electron_1.ipcMain.handle('get-config', () => configService.get());
electron_1.ipcMain.handle('save-config', (_event, partial) => {
    configService.update(partial);
    log('info', 'Config saved:', Object.keys(partial).join(', '));
});
electron_1.ipcMain.handle('open-external', (_event, url) => {
    void electron_1.shell.openExternal(url);
});
electron_1.ipcMain.handle('open-settings', () => {
    mainWindow?.webContents.send('open-settings', configService.get());
    mainWindow?.show();
    mainWindow?.focus();
});
// ── Memory IPC ────────────────────────────────────────────────────────────────
electron_1.ipcMain.handle('memory:set', (_event, key, value) => {
    const entry = memoryStore.set(key, value);
    void memoryPersistence.save(memoryStore.all());
    return entry;
});
electron_1.ipcMain.handle('memory:get', (_event, key) => memoryStore.get(key));
electron_1.ipcMain.handle('memory:delete', (_event, key) => {
    const ok = memoryStore.delete(key);
    void memoryPersistence.save(memoryStore.all());
    return ok;
});
electron_1.ipcMain.handle('memory:all', () => memoryStore.all());
// ── Conversation history IPC ──────────────────────────────────────────────────
electron_1.ipcMain.handle('history:create', (_event, title) => conversationHistory.create(title));
electron_1.ipcMain.handle('history:all', () => conversationHistory.getAll());
electron_1.ipcMain.handle('history:delete', (_event, id) => conversationHistory.delete(id));
electron_1.ipcMain.handle('history:add-message', (_event, conversationId, msg) => conversationHistory.addMessage(conversationId, {
    ...msg,
    timestamp: Date.now(),
}));
// ── Notifications IPC ─────────────────────────────────────────────────────────
electron_1.ipcMain.handle('notifications:send', (_event, title, body, level) => notificationService.send(title, body, level ?? 'info'));
electron_1.ipcMain.handle('notifications:all', () => notificationService.getAll());
electron_1.ipcMain.handle('notifications:unread', () => notificationService.getUnread());
electron_1.ipcMain.handle('notifications:mark-read', (_event, id) => notificationService.markRead(id));
notificationService.onNotification((n) => {
    mainWindow?.webContents.send('notification:new', n);
});
//# sourceMappingURL=main.js.map