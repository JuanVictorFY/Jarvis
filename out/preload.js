"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('jarvis', {
    // ── Agent ────────────────────────────────────────────────────────────────
    sendMessage: (text) => electron_1.ipcRenderer.invoke('send-message', text),
    clearHistory: () => electron_1.ipcRenderer.invoke('clear-history'),
    confirmAction: (id, approved) => electron_1.ipcRenderer.invoke('confirm-action', id, approved),
    onAgentEvent: (cb) => {
        const wrapped = (_, ev) => cb(ev);
        electron_1.ipcRenderer.on('agent:event', wrapped);
        return () => electron_1.ipcRenderer.removeListener('agent:event', wrapped);
    },
    // ── Config ───────────────────────────────────────────────────────────────
    getConfig: () => electron_1.ipcRenderer.invoke('get-config'),
    saveConfig: (partial) => electron_1.ipcRenderer.invoke('save-config', partial),
    onOpenSettings: (cb) => {
        electron_1.ipcRenderer.on('open-settings', (_, cfg) => cb(cfg));
    },
    openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
    // ── Memory ───────────────────────────────────────────────────────────────
    memory: {
        set: (key, value) => electron_1.ipcRenderer.invoke('memory:set', key, value),
        get: (key) => electron_1.ipcRenderer.invoke('memory:get', key),
        delete: (key) => electron_1.ipcRenderer.invoke('memory:delete', key),
        all: () => electron_1.ipcRenderer.invoke('memory:all'),
    },
    // ── Conversation history ──────────────────────────────────────────────────
    history: {
        create: (title) => electron_1.ipcRenderer.invoke('history:create', title),
        all: () => electron_1.ipcRenderer.invoke('history:all'),
        delete: (id) => electron_1.ipcRenderer.invoke('history:delete', id),
        addMessage: (conversationId, msg) => electron_1.ipcRenderer.invoke('history:add-message', conversationId, msg),
    },
    // ── Notifications ─────────────────────────────────────────────────────────
    notifications: {
        send: (title, body, level) => electron_1.ipcRenderer.invoke('notifications:send', title, body, level),
        all: () => electron_1.ipcRenderer.invoke('notifications:all'),
        unread: () => electron_1.ipcRenderer.invoke('notifications:unread'),
        markRead: (id) => electron_1.ipcRenderer.invoke('notifications:mark-read', id),
        onNew: (cb) => {
            const wrapped = (_, n) => cb(n);
            electron_1.ipcRenderer.on('notification:new', wrapped);
            return () => electron_1.ipcRenderer.removeListener('notification:new', wrapped);
        },
    },
});
//# sourceMappingURL=preload.js.map