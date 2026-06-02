import type { VoiceConfig } from '../types/voice';
import { DEFAULT_VOICE_CONFIG, SUPPORTED_LANGUAGES } from '../types/voice';
import { ConfigService } from './ConfigService';

export class VoiceSettingsService {
  private config: VoiceConfig = { ...DEFAULT_VOICE_CONFIG };

  constructor(private readonly configService: ConfigService) {
    this.loadFromAppConfig();
  }

  private loadFromAppConfig(): void {
    const appConfig = this.configService.get();
    this.config = {
      ...DEFAULT_VOICE_CONFIG,
      enabled: appConfig.enableVoice ?? false,
      language: appConfig.language ?? 'en-US',
    };
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  update(partial: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...partial };
    if ('enabled' in partial) {
      this.configService.update({ enableVoice: partial.enabled });
    }
    if ('language' in partial && partial.language) {
      this.configService.update({ language: partial.language });
    }
  }

  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }

  isLanguageSupported(code: string): boolean {
    return SUPPORTED_LANGUAGES.some((l) => l.code === code);
  }
}
