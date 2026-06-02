import type { ProviderType } from '../types/config';
import { logger } from '../utils/logger';

export interface ProviderErrorInfo {
  provider: ProviderType;
  isAuthError: boolean;
  isRateLimit: boolean;
  isNetworkError: boolean;
  isModelUnavailable: boolean;
  userMessage: string;
  retryable: boolean;
  retryAfterMs?: number;
}

export function classifyProviderError(
  provider: ProviderType,
  error: unknown
): ProviderErrorInfo {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const info: ProviderErrorInfo = {
    provider,
    isAuthError: false,
    isRateLimit: false,
    isNetworkError: false,
    isModelUnavailable: false,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: false,
  };

  if (msg.includes('401') || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('authentication')) {
    info.isAuthError = true;
    info.userMessage = `Invalid API key for ${provider}. Please check your settings.`;
    info.retryable = false;
  } else if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many')) {
    info.isRateLimit = true;
    info.userMessage = `Rate limit exceeded for ${provider}. Please wait before trying again.`;
    info.retryable = true;
    info.retryAfterMs = 60_000;
  } else if (msg.includes('network') || msg.includes('econnreset') || msg.includes('timeout') || msg.includes('enotfound')) {
    info.isNetworkError = true;
    info.userMessage = 'Network error. Please check your internet connection.';
    info.retryable = true;
    info.retryAfterMs = 5_000;
  } else if (msg.includes('model') && (msg.includes('not found') || msg.includes('unavailable') || msg.includes('deprecated'))) {
    info.isModelUnavailable = true;
    info.userMessage = 'The selected model is unavailable. Please choose a different model in settings.';
    info.retryable = false;
  }

  logger.warn(`Provider error [${provider}]: ${msg}`, 'ProviderErrorHandler');
  return info;
}
