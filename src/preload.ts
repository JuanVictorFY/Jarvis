import { contextBridge, ipcRenderer } from 'electron';
import type { AgentEvent, JarvisConfig } from './types/index';
import type { VoiceTranscript } from './types/voice';

type AgentEventCallback = (event: AgentEvent) => void;
type ConfigCallback = (config: JarvisConfig) => void;
type VoiceTranscriptCallback = (transcript: VoiceTranscript) => void;
type VoiceStateCallback = (state: string) => void;

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

  // Voice recognition API
  voice: {
    start: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('voice:start'),

    stop: (): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('voice:stop'),

    sendTranscript: (transcript: VoiceTranscript): void =>
      ipcRenderer.send('voice:result', transcript),

    sendError: (error: { code: string; message: string }): void =>
      ipcRenderer.send('voice:error', error),

    onStart: (cb: VoiceStateCallback): void => {
      ipcRenderer.on('voice:start', (_: Electron.IpcRendererEvent) => cb('listening'));
    },

    onStop: (cb: VoiceStateCallback): void => {
      ipcRenderer.on('voice:stop', (_: Electron.IpcRendererEvent) => cb('idle'));
    },
  },
});
