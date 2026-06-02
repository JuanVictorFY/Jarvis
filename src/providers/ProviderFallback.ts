import type { AIProvider, ProviderCompletionRequest, ProviderStreamChunk } from './AIProvider';
import { logger } from '../utils/logger';

export class ProviderFallback {
  private readonly chain: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.chain = providers.filter((p) => p.isConfigured());
  }

  async streamWithFallback(
    request: ProviderCompletionRequest,
    modelsByProvider: Map<string, string>,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<string> {
    const errors: string[] = [];

    for (const provider of this.chain) {
      const model = modelsByProvider.get(provider.id);
      if (!model) { continue; }

      try {
        await provider.streamCompletion(request, model, onChunk);
        return provider.id;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.name}: ${msg}`);
        logger.warn(
          `Provider ${provider.name} failed, trying next. Error: ${msg}`,
          'ProviderFallback'
        );
      }
    }

    throw new Error(`All providers failed:\n${errors.join('\n')}`);
  }

  getChain(): AIProvider[] {
    return [...this.chain];
  }

  addProvider(provider: AIProvider): void {
    if (provider.isConfigured() && !this.chain.some((p) => p.id === provider.id)) {
      this.chain.push(provider);
    }
  }

  removeProvider(id: string): void {
    const idx = this.chain.findIndex((p) => p.id === id);
    if (idx !== -1) { this.chain.splice(idx, 1); }
  }
}
