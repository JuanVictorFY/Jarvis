"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('jarvis', {
    sendMessage: (text) => electron_1.ipcRenderer.invoke('send-message', text),
    clearHistory: () => electron_1.ipcRenderer.invoke('clear-history'),
    confirmAction: (id, approved) => electron_1.ipcRenderer.invoke('confirm-action', id, approved),
    getConfig: () => electron_1.ipcRenderer.invoke('get-config'),
    saveConfig: (partial) => electron_1.ipcRenderer.invoke('save-config', partial),
    onAgentEvent: (cb) => {
        const wrapped = (_, ev) => cb(ev);
        electron_1.ipcRenderer.on('agent:event', wrapped);
        return () => electron_1.ipcRenderer.removeListener('agent:event', wrapped);
    },
    onOpenSettings: (cb) => {
        electron_1.ipcRenderer.on('open-settings', (_, cfg) => cb(cfg));
    },
});
//# sourceMappingURL=preload.js.map