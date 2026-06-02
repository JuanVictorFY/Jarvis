import { ipcMain } from 'electron';
import { Channel } from './channels';
import type { VoiceService } from '../services/VoiceService';
import type { VoiceSettingsService } from '../services/VoiceSettingsService';
import { logger } from '../utils/logger';

export function registerVoiceHandlers(
  voiceService: VoiceService,
  settingsService: VoiceSettingsService
): void {
  ipcMain.handle('voice:get-config', () => {
    return settingsService.getConfig();
  });

  ipcMain.handle('voice:update-config', (_event, partial: Record<string, unknown>) => {
    settingsService.update(partial);
    voiceService.updateConfig(settingsService.getConfig());
    logger.info('Voice config updated', 'voiceHandlers');
    return { success: true };
  });

  ipcMain.handle('voice:get-languages', () => {
    return settingsService.getSupportedLanguages();
  });

  ipcMain.handle('voice:is-enabled', () => {
    return voiceService.isEnabled();
  });

  ipcMain.handle(Channel.VOICE_START, async () => {
    if (!voiceService.isEnabled()) {
      return { success: false, error: 'Voice recognition is disabled' };
    }
    logger.info('Voice recognition requested', 'voiceHandlers');
    return { success: true };
  });

  ipcMain.handle(Channel.VOICE_STOP, async () => {
    logger.info('Voice recognition stop requested', 'voiceHandlers');
    return { success: true };
  });
}
