"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceCommandParser = void 0;
const COMMAND_PREFIXES = ['jarvis', 'hey jarvis', 'ok jarvis'];
const ACTION_KEYWORDS = {
    clear: ['clear', 'clear chat', 'clear conversation', 'reset'],
    stop: ['stop', 'cancel', 'abort', 'stop it'],
    settings: ['open settings', 'settings', 'preferences'],
    copy: ['copy', 'copy that', 'copy response'],
    run: ['run', 'execute', 'run that'],
};
class VoiceCommandParser {
    parse(transcript) {
        const lower = transcript.toLowerCase().trim();
        for (const prefix of COMMAND_PREFIXES) {
            if (lower.startsWith(prefix)) {
                const remainder = lower.slice(prefix.length).trim();
                const action = this.detectAction(remainder);
                return { isCommand: true, action, text: remainder };
            }
        }
        const action = this.detectAction(lower);
        if (action) {
            return { isCommand: true, action, text: lower };
        }
        return { isCommand: false, text: transcript };
    }
    detectAction(text) {
        for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
            if (keywords.some((kw) => text === kw || text.startsWith(kw + ' '))) {
                return action;
            }
        }
        return undefined;
    }
    cleanTranscript(transcript) {
        let cleaned = transcript;
        for (const prefix of COMMAND_PREFIXES) {
            if (cleaned.toLowerCase().startsWith(prefix)) {
                cleaned = cleaned.slice(prefix.length).trim();
                break;
            }
        }
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
}
exports.VoiceCommandParser = VoiceCommandParser;
//# sourceMappingURL=VoiceCommandParser.js.map