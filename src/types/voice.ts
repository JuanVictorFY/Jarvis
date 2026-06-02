export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export type VoiceMode = 'push-to-talk' | 'continuous' | 'manual';

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  mode: VoiceMode;
  silenceTimeoutMs: number;
  maxDurationMs: number;
  interimResults: boolean;
  confidenceThreshold: number;
}

export interface VoiceTranscript {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface VoiceError {
  code: string;
  message: string;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: false,
  language: 'en-US',
  mode: 'manual',
  silenceTimeoutMs: 2000,
  maxDurationMs: 60_000,
  interimResults: true,
  confidenceThreshold: 0.7,
};

export const SUPPORTED_LANGUAGES = [
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
] as const;
