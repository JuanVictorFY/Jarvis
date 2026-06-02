"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
exports.Channel = {
    // Agent communication
    SEND_MESSAGE: 'send-message',
    AGENT_EVENT: 'agent:event',
    AGENT_ERROR: 'agent:error',
    CLEAR_HISTORY: 'clear-history',
    // Tool confirmation flow
    CONFIRM_ACTION: 'confirm-action',
    ACTION_RESPONSE: 'action-response',
    // Configuration
    GET_CONFIG: 'get-config',
    SET_CONFIG: 'set-config',
    CONFIG_CHANGED: 'config:changed',
    // App lifecycle
    GET_VERSION: 'get-version',
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error',
    // Voice
    VOICE_START: 'voice:start',
    VOICE_STOP: 'voice:stop',
    VOICE_RESULT: 'voice:result',
    VOICE_ERROR: 'voice:error',
    // Notifications
    NOTIFY: 'notify',
    NOTIFICATION_CLICKED: 'notification:clicked',
    // Conversations
    SAVE_CONVERSATION: 'conversation:save',
    LOAD_CONVERSATION: 'conversation:load',
    LIST_CONVERSATIONS: 'conversation:list',
    DELETE_CONVERSATION: 'conversation:delete',
    // Memory
    MEMORY_SAVE: 'memory:save',
    MEMORY_QUERY: 'memory:query',
    MEMORY_DELETE: 'memory:delete',
};
//# sourceMappingURL=channels.js.map