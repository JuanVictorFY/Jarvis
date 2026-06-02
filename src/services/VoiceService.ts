import { ipcMain, BrowserWindow } from 'electron';
import { Channel } from '../ipc/channels';
import type { VoiceConfig, VoiceTranscript } from '../types/voice';
import { DEFAULT_VOICE_CONFIG } from '../types/voice';
import { logger } from '../utils/logger';

export class VoiceService {
  private config: VoiceConfig = { ...DEFAULT_VOICE_CONFIG };
  private readonly window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
    this.registerHandlers();
  }

  private registerHandlers(): void {
    ipcMain.handle(Channel.VOICE_START, async () => {
      if (!this.config.enabled) {
        return { success: false, error: 'Voice recognition is disabled in settings' };
      }
      this.window.webContents.send(Channel.VOICE_START);
      logger.info('Voice recognition started', 'VoiceService');
      return { success: true };
    });

    ipcMain.handle(Channel.VOICE_STOP, async () => {
      this.window.webContents.send(Channel.VOICE_STOP);
      logger.info('Voice recognition stopped', 'VoiceService');
      return { success: true };
    });

    ipcMain.on(Channel.VOICE_RESULT, (_event, transcript: VoiceTranscript) => {
      logger.debug(`Voice transcript: "${transcript.text}"`, 'VoiceService');
    });

    ipcMain.on(Channel.VOICE_ERROR, (_event, error: { code: string; message: string }) => {
      logger.error(`Voice error: ${error.message}`, 'VoiceService');
    });
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}
