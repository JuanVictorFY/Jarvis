"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGES = exports.DEFAULT_VOICE_CONFIG = void 0;
exports.DEFAULT_VOICE_CONFIG = {
    enabled: false,
    language: 'en-US',
    mode: 'manual',
    silenceTimeoutMs: 2000,
    maxDurationMs: 60_000,
    interimResults: true,
    confidenceThreshold: 0.7,
};
exports.SUPPORTED_LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'es-MX', name: 'Español (México)' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文 (简体)' },
];
//# sourceMappingURL=voice.js.map