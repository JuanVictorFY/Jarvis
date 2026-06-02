"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("./voice");
// Type-level tests: verify the config satisfies the expected shape
const _config = voice_1.DEFAULT_VOICE_CONFIG;
const _state = 'idle';
const _mode = 'manual';
const _transcript = {
    text: 'hello world',
    confidence: 0.95,
    isFinal: true,
    timestamp: new Date(),
};
void _state;
void _mode;
void _transcript;
const _langs = voice_1.SUPPORTED_LANGUAGES;
// Verify all language codes are valid BCP-47 tags
const bcp47Pattern = /^[a-z]{2}-[A-Z]{2}$/;
for (const lang of _langs) {
    if (!bcp47Pattern.test(lang.code)) {
        throw new Error(`Invalid language code: ${lang.code}`);
    }
}
// Verify default config has valid language
if (!_langs.some((l) => l.code === _config.language)) {
    throw new Error(`Default language ${_config.language} not in supported list`);
}
//# sourceMappingURL=voice.test.js.map