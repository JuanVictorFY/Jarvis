import type { AIProvider } from './AIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import type { ProviderType } from '../types/config';

export interface ProviderCredentials {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

export class ProviderFactory {
  private readonly providers = new Map<ProviderType, AIProvider>();

  constructor(credentials: ProviderCredentials) {
    this.providers.set(
      'anthropic',
      new AnthropicProvider(credentials.anthropicApiKey ?? '')
    );
    this.providers.set(
      'openai',
      new OpenAIProvider(credentials.openaiApiKey ?? '')
    );
    this.providers.set(
      'gemini',
      new GeminiProvider(credentials.geminiApiKey ?? '')
    );
  }

  getProvider(type: ProviderType): AIProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unknown provider: ${type}`);
    }
    return provider;
  }

  updateCredentials(credentials: Partial<ProviderCredentials>): void {
    if (credentials.anthropicApiKey !== undefined) {
      (this.providers.get('anthropic') as AnthropicProvider).updateApiKey(
        credentials.anthropicApiKey
      );
    }
    if (credentials.openaiApiKey !== undefined) {
      (this.providers.get('openai') as OpenAIProvider).updateApiKey(credentials.openaiApiKey);
    }
    if (credentials.geminiApiKey !== undefined) {
      (this.providers.get('gemini') as GeminiProvider).updateApiKey(credentials.geminiApiKey);
    }
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getConfiguredProviders(): AIProvider[] {
    return this.listProviders().filter((p) => p.isConfigured());
  }

  async getHealthStatus(): Promise<Record<ProviderType, boolean>> {
    const results: Partial<Record<ProviderType, boolean>> = {};
    for (const [type, provider] of this.providers) {
      results[type] = provider.isConfigured();
    }
    return results as Record<ProviderType, boolean>;
  }
}
