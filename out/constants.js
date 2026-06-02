"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP = exports.MODELS = exports.BROWSER_SERVICE = exports.SHELL_SERVICE = exports.FILE_SERVICE = exports.AGENT = exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
    SEND_MESSAGE: 'send-message',
    AGENT_EVENT: 'agent:event',
    CONFIRM_ACTION: 'confirm-action',
    ACTION_RESPONSE: 'action-response',
    GET_CONFIG: 'get-config',
    SET_CONFIG: 'set-config',
    CLEAR_HISTORY: 'clear-history',
    GET_VERSION: 'get-version',
};
exports.AGENT = {
    MAX_ITERATIONS: 15,
    MAX_HISTORY_MESSAGES: 30,
    DEFAULT_MAX_TOKENS: 8192,
    TOOL_TIMEOUT_MS: 30_000,
};
exports.FILE_SERVICE = {
    MAX_READ_TOKENS: 4_000,
    MAX_CHARS: 16_000,
};
exports.SHELL_SERVICE = {
    MAX_OUTPUT_TOKENS: 2_000,
    MAX_BYTES: 10 * 1024 * 1024,
    TIMEOUT_MS: 30_000,
};
exports.BROWSER_SERVICE = {
    MAX_CONTENT_TOKENS: 4_000,
    NAVIGATION_TIMEOUT_MS: 30_000,
    SEARCH_RESULTS_LIMIT: 8,
};
exports.MODELS = {
    SONNET: 'claude-sonnet-4-6',
    OPUS: 'claude-opus-4-8',
    HAIKU: 'claude-haiku-4-5-20251001',
};
exports.APP = {
    NAME: 'Jarvis',
    CONFIG_FILE: 'jarvis-config.json',
    WINDOW_WIDTH: 420,
    WINDOW_HEIGHT: 700,
    TRAY_TOOLTIP: 'Jarvis — AI Desktop Agent',
    GLOBAL_SHORTCUT: 'CommandOrControl+Shift+J',
};
//# sourceMappingURL=constants.js.map