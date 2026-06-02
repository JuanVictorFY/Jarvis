export const IPC_CHANNELS = {
  SEND_MESSAGE: 'send-message',
  AGENT_EVENT: 'agent:event',
  CONFIRM_ACTION: 'confirm-action',
  ACTION_RESPONSE: 'action-response',
  GET_CONFIG: 'get-config',
  SET_CONFIG: 'set-config',
  CLEAR_HISTORY: 'clear-history',
  GET_VERSION: 'get-version',
} as const;

export const AGENT = {
  MAX_ITERATIONS: 15,
  MAX_HISTORY_MESSAGES: 30,
  DEFAULT_MAX_TOKENS: 8192,
  TOOL_TIMEOUT_MS: 30_000,
} as const;

export const FILE_SERVICE = {
  MAX_READ_TOKENS: 4_000,
  MAX_CHARS: 16_000,
} as const;

export const SHELL_SERVICE = {
  MAX_OUTPUT_TOKENS: 2_000,
  MAX_BYTES: 10 * 1024 * 1024,
  TIMEOUT_MS: 30_000,
} as const;

export const BROWSER_SERVICE = {
  MAX_CONTENT_TOKENS: 4_000,
  NAVIGATION_TIMEOUT_MS: 30_000,
  SEARCH_RESULTS_LIMIT: 8,
} as const;

export const MODELS = {
  SONNET: 'claude-sonnet-4-6',
  OPUS: 'claude-opus-4-8',
  HAIKU: 'claude-haiku-4-5-20251001',
} as const;

export const APP = {
  NAME: 'Jarvis',
  CONFIG_FILE: 'jarvis-config.json',
  WINDOW_WIDTH: 420,
  WINDOW_HEIGHT: 700,
  TRAY_TOOLTIP: 'Jarvis — AI Desktop Agent',
  GLOBAL_SHORTCUT: 'CommandOrControl+Shift+J',
} as const;
