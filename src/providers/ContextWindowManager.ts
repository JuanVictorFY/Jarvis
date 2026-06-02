import type { ProviderMessage } from './AIProvider';
import { estimateTokens } from './TokenCounter';
import type { ProviderType } from '../types/config';

export class ContextWindowManager {
  constructor(
    private readonly maxContextTokens: number,
    private readonly reservedForOutput: number,
    private readonly provider: ProviderType = 'anthropic'
  ) {}

  get availableTokens(): number {
    return this.maxContextTokens - this.reservedForOutput;
  }

  trimMessages(messages: ProviderMessage[], systemPrompt?: string): ProviderMessage[] {
    const systemTokens = systemPrompt ? estimateTokens(systemPrompt, this.provider) : 0;
    let budget = this.availableTokens - systemTokens;

    if (budget <= 0) {
      return messages.slice(-1);
    }

    const result: ProviderMessage[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const tokens = estimateTokens(messages[i].content, this.provider);
      if (tokens > budget) {
        break;
      }
      result.unshift(messages[i]);
      budget -= tokens;
    }

    if (result.length === 0 && messages.length > 0) {
      const last = messages[messages.length - 1];
      result.push({
        role: last.role,
        content: last.content.slice(0, budget * 4),
      });
    }

    return result;
  }

  countTokens(messages: ProviderMessage[], systemPrompt?: string): number {
    const systemTokens = systemPrompt ? estimateTokens(systemPrompt, this.provider) : 0;
    const messageTokens = messages.reduce(
      (sum, m) => sum + estimateTokens(m.content, this.provider),
      0
    );
    return systemTokens + messageTokens;
  }

  isWithinLimit(messages: ProviderMessage[], systemPrompt?: string): boolean {
    return this.countTokens(messages, systemPrompt) <= this.availableTokens;
  }
}
