import { BrowserWindow } from 'electron';
import { logger } from '../utils/logger';

export type FallbackReason =
  | 'not-supported'
  | 'permission-denied'
  | 'network-error'
  | 'no-microphone';

export interface FallbackAction {
  reason: FallbackReason;
  userMessage: string;
  recoverySuggestion: string;
}

const FALLBACK_MESSAGES: Record<FallbackReason, FallbackAction> = {
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

export class VoiceFallbackService {
  constructor(private readonly window: BrowserWindow) {}

  handle(reason: FallbackReason): void {
    const action = FALLBACK_MESSAGES[reason];
    logger.warn(`Voice fallback triggered: ${reason}`, 'VoiceFallbackService');
    this.window.webContents.send('voice:fallback', action);
  }

  getFallbackAction(reason: FallbackReason): FallbackAction {
    return FALLBACK_MESSAGES[reason];
  }
}
