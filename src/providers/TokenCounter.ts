import type { ProviderType } from '../types/config';

const CHARS_PER_TOKEN: Record<ProviderType, number> = {
  anthropic: 4,
  openai: 4,
  gemini: 4,
};

const CONTEXT_LIMITS: Record<string, number> = {
  'claude-sonnet-4-6': 200_000,
  'claude-opus-4-8': 200_000,
  'claude-haiku-4-5-20251001': 200_000,
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-3.5-turbo': 16_000,
  'gemini-2.0-flash': 1_000_000,
  'gemini-2.0-pro': 2_000_000,
  'gemini-1.5-flash': 1_000_000,
  'gemini-1.5-pro': 2_000_000,
};

export function estimateTokens(text: string, provider: ProviderType = 'anthropic'): number {
  const charsPerToken = CHARS_PER_TOKEN[provider];
  return Math.ceil(text.length / charsPerToken);
}

export function getContextLimit(model: string): number {
  return CONTEXT_LIMITS[model] ?? 100_000;
}

export function isWithinContextLimit(
  text: string,
  model: string,
  provider: ProviderType = 'anthropic'
): boolean {
  return estimateTokens(text, provider) <= getContextLimit(model);
}

export function getTokenBudget(
  model: string,
  usedTokens: number,
  maxOutputTokens: number
): number {
  const limit = getContextLimit(model);
  return Math.max(0, limit - usedTokens - maxOutputTokens);
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) { return `${(count / 1_000_000).toFixed(1)}M`; }
  if (count >= 1_000) { return `${(count / 1_000).toFixed(1)}K`; }
  return String(count);
}
