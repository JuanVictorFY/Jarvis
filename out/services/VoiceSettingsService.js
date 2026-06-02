"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceSettingsService = void 0;
const voice_1 = require("../types/voice");
class VoiceSettingsService {
    configService;
    config = { ...voice_1.DEFAULT_VOICE_CONFIG };
    constructor(configService) {
        this.configService = configService;
        this.loadFromAppConfig();
    }
    loadFromAppConfig() {
        const appConfig = this.configService.get();
        this.config = {
            ...voice_1.DEFAULT_VOICE_CONFIG,
            enabled: appConfig.enableVoice ?? false,
            language: appConfig.language ?? 'en-US',
        };
    }
    getConfig() {
        return { ...this.config };
    }
    update(partial) {
        this.config = { ...this.config, ...partial };
        if ('enabled' in partial) {
            this.configService.update({ enableVoice: partial.enabled });
        }
        if ('language' in partial && partial.language) {
            this.configService.update({ language: partial.language });
        }
    }
    getSupportedLanguages() {
        return voice_1.SUPPORTED_LANGUAGES;
    }
    isLanguageSupported(code) {
        return voice_1.SUPPORTED_LANGUAGES.some((l) => l.code === code);
    }
}
exports.VoiceSettingsService = VoiceSettingsService;
//# sourceMappingURL=VoiceSettingsService.js.map