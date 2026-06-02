"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceFallbackService = void 0;
const logger_1 = require("../utils/logger");
const FALLBACK_MESSAGES = {
    'not-supported': {
        reason: 'not-supported',
        userMessage: 'Voice recognition is not supported in this environment.',
        recoverySuggestion: 'Use the text input to send messages.',
    },
    'permission-denied': {
        reason: 'permission-denied',
        userMessage: 'Microphone access was denied.',
        recoverySuggestion: 'Allow microphone access in system settings, then restart Jarvis.',
    },
    'network-error': {
        reason: 'network-error',
        userMessage: 'Voice recognition requires an internet connection.',
        recoverySuggestion: 'Check your connection and try again.',
    },
    'no-microphone': {
        reason: 'no-microphone',
        userMessage: 'No microphone detected.',
        recoverySuggestion: 'Connect a microphone and restart Jarvis.',
    },
};
class VoiceFallbackService {
    window;
    constructor(window) {
        this.window = window;
    }
    handle(reason) {
        const action = FALLBACK_MESSAGES[reason];
        logger_1.logger.warn(`Voice fallback triggered: ${reason}`, 'VoiceFallbackService');
        this.window.webContents.send('voice:fallback', action);
    }
    getFallbackAction(reason) {
        return FALLBACK_MESSAGES[reason];
    }
}
exports.VoiceFallbackService = VoiceFallbackService;
//# sourceMappingURL=VoiceFallbackService.js.map