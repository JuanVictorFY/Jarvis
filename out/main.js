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
// ── State ─────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
const pendingConfirms = new Map();
const configService = new ConfigService_1.ConfigService();
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
    mainWindow = new electron_1.BrowserWindow({
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
electron_1.app.whenReady().then(() => {
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
});
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
    void claudeService.closeBrowser();
});
electron_1.app.on('window-all-closed', () => {
    // Keep running in tray on all platforms
});
// ── IPC ───────────────────────────────────────────────────────────────────────
electron_1.ipcMain.handle('send-message', async (event, text) => {
    const sender = event.sender;
    try {
        for await (const ev of claudeService.agentLoop(text)) {
            if (!sender.isDestroyed()) {
                sender.send('agent:event', ev);
            }
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!sender.isDestroyed()) {
            sender.send('agent:event', { type: 'error', message });
        }
    }
});
electron_1.ipcMain.handle('confirm-action', (_event, id, approved) => {
    pendingConfirms.get(id)?.(approved);
    pendingConfirms.delete(id);
});
electron_1.ipcMain.handle('clear-history', () => {
    claudeService.clearHistory();
});
electron_1.ipcMain.handle('get-config', () => configService.get());
electron_1.ipcMain.handle('save-config', (_event, partial) => {
    configService.update(partial);
});
electron_1.ipcMain.handle('open-external', (_event, url) => {
    void electron_1.shell.openExternal(url);
});
electron_1.ipcMain.handle('open-settings', () => {
    mainWindow?.webContents.send('open-settings', configService.get());
    mainWindow?.show();
    mainWindow?.focus();
});
//# sourceMappingURL=main.js.map