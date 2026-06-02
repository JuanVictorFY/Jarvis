import { contextBridge, ipcRenderer } from 'electron';
import type { AgentEvent, JarvisConfig } from './types/index';

type AgentEventCallback = (event: AgentEvent) => void;
type ConfigCallback = (config: JarvisConfig) => void;

contextBridge.exposeInMainWorld('jarvis', {
  sendMessage: (text: string): Promise<void> =>
    ipcRenderer.invoke('send-message', text),

  clearHistory: (): Promise<void> =>
    ipcRenderer.invoke('clear-history'),

  confirmAction: (id: string, approved: boolean): Promise<void> =>
    ipcRenderer.invoke('confirm-action', id, approved),

  getConfig: (): Promise<JarvisConfig> =>
    ipcRenderer.invoke('get-config'),

  saveConfig: (partial: Partial<JarvisConfig>): Promise<void> =>
    ipcRenderer.invoke('save-config', partial),

  onAgentEvent: (cb: AgentEventCallback): (() => void) => {
    const wrapped = (_: Electron.IpcRendererEvent, ev: AgentEvent) => cb(ev);
    ipcRenderer.on('agent:event', wrapped);
    return () => ipcRenderer.removeListener('agent:event', wrapped);
  },

  onOpenSettings: (cb: ConfigCallback): void => {
    ipcRenderer.on('open-settings', (_: Electron.IpcRendererEvent, cfg: JarvisConfig) => cb(cfg));
  },
});
