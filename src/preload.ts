import { contextBridge, ipcRenderer } from 'electron';
import type { AgentEvent, JarvisConfig } from './types/index';

type AgentEventCallback   = (event: AgentEvent) => void;
type ConfigCallback       = (config: JarvisConfig) => void;
type NotificationCallback = (n: unknown) => void;

contextBridge.exposeInMainWorld('jarvis', {
  // ── Agent ────────────────────────────────────────────────────────────────
  sendMessage: (text: string): Promise<void> =>
    ipcRenderer.invoke('send-message', text),

  clearHistory: (): Promise<void> =>
    ipcRenderer.invoke('clear-history'),

  confirmAction: (id: string, approved: boolean): Promise<void> =>
    ipcRenderer.invoke('confirm-action', id, approved),

  onAgentEvent: (cb: AgentEventCallback): (() => void) => {
    const wrapped = (_: Electron.IpcRendererEvent, ev: AgentEvent) => cb(ev);
    ipcRenderer.on('agent:event', wrapped);
    return () => ipcRenderer.removeListener('agent:event', wrapped);
  },

  // ── Config ───────────────────────────────────────────────────────────────
  getConfig: (): Promise<JarvisConfig> =>
    ipcRenderer.invoke('get-config'),

  saveConfig: (partial: Partial<JarvisConfig>): Promise<void> =>
    ipcRenderer.invoke('save-config', partial),

  onOpenSettings: (cb: ConfigCallback): void => {
    ipcRenderer.on('open-settings', (_: Electron.IpcRendererEvent, cfg: JarvisConfig) => cb(cfg));
  },

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),

  // ── Memory ───────────────────────────────────────────────────────────────
  memory: {
    set:    (key: string, value: unknown) => ipcRenderer.invoke('memory:set', key, value),
    get:    (key: string)                 => ipcRenderer.invoke('memory:get', key),
    delete: (key: string)                 => ipcRenderer.invoke('memory:delete', key),
    all:    ()                            => ipcRenderer.invoke('memory:all'),
  },

  // ── Conversation history ──────────────────────────────────────────────────
  history: {
    create:     (title?: string) =>
      ipcRenderer.invoke('history:create', title),
    all:        () =>
      ipcRenderer.invoke('history:all'),
    delete:     (id: string) =>
      ipcRenderer.invoke('history:delete', id),
    addMessage: (conversationId: string, msg: { role: string; content: string }) =>
      ipcRenderer.invoke('history:add-message', conversationId, msg),
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    send:     (title: string, body: string, level?: string) =>
      ipcRenderer.invoke('notifications:send', title, body, level),
    all:      () => ipcRenderer.invoke('notifications:all'),
    unread:   () => ipcRenderer.invoke('notifications:unread'),
    markRead: (id: string) => ipcRenderer.invoke('notifications:mark-read', id),
    onNew: (cb: NotificationCallback): (() => void) => {
      const wrapped = (_: Electron.IpcRendererEvent, n: unknown) => cb(n);
      ipcRenderer.on('notification:new', wrapped);
      return () => ipcRenderer.removeListener('notification:new', wrapped);
    },
  },
});
