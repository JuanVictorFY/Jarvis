import { systemPreferences } from 'electron';
import { logger } from '../utils/logger';

export type MicPermissionStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

export class VoicePermissionChecker {
  async checkMicrophonePermission(): Promise<MicPermissionStatus> {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      logger.info(`Microphone permission status: ${status}`, 'VoicePermissionChecker');
      return status as MicPermissionStatus;
    }
    // Windows and Linux: assume granted unless MediaDevices API fails
    return 'granted';
  }

  async requestMicrophonePermission(): Promise<boolean> {
    if (process.platform === 'darwin') {
      const granted = await systemPreferences.askForMediaAccess('microphone');
      logger.info(`Microphone permission request result: ${granted}`, 'VoicePermissionChecker');
      return granted;
    }
    return true;
  }

  async ensurePermission(): Promise<{ ok: boolean; status: MicPermissionStatus }> {
    let status = await this.checkMicrophonePermission();

    if (status === 'not-determined') {
      const granted = await this.requestMicrophonePermission();
      status = granted ? 'granted' : 'denied';
    }

    return { ok: status === 'granted', status };
  }
}
