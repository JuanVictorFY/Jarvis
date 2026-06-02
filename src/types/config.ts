export type ModelId =
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-8'
  | 'claude-haiku-4-5-20251001';

export type ProviderType = 'anthropic' | 'openai' | 'gemini';

export type ThemeMode = 'dark' | 'light' | 'system';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface JarvisConfig {
  anthropicApiKey: string;
  model: ModelId;
  maxTokens: number;
  provider: ProviderType;
  theme: ThemeMode;
  language: string;
  enableVoice: boolean;
  enableNotifications: boolean;
  enableMemory: boolean;
  globalShortcut: string;
  logLevel: LogLevel;
  autoCheckUpdates: boolean;
  saveConversations: boolean;
}

export const DEFAULT_CONFIG: JarvisConfig = {
  anthropicApiKey: '',
  model: 'claude-sonnet-4-6',
  maxTokens: 8192,
  provider: 'anthropic',
  theme: 'dark',
  language: 'en-US',
  enableVoice: false,
  enableNotifications: true,
  enableMemory: true,
  globalShortcut: 'CommandOrControl+Shift+J',
  logLevel: 'info',
  autoCheckUpdates: true,
  saveConversations: true,
};
