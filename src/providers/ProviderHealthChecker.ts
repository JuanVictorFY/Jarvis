import type { AIProvider } from './AIProvider';
import type { ProviderType } from '../types/config';
import { logger } from '../utils/logger';

export interface ProviderHealthResult {
  provider: ProviderType;
  name: string;
  configured: boolean;
  reachable: boolean;
  latencyMs?: number;
  error?: string;
  checkedAt: Date;
}

export class ProviderHealthChecker {
  async checkProvider(
    providerId: ProviderType,
    provider: AIProvider,
    apiKey: string
  ): Promise<ProviderHealthResult> {
    const result: ProviderHealthResult = {
      provider: providerId,
      name: provider.name,
      configured: provider.isConfigured(),
      reachable: false,
      checkedAt: new Date(),
    };

    if (!result.configured || !apiKey) {
      result.error = 'API key not configured';
      return result;
    }

    const start = Date.now();
    try {
      result.reachable = await provider.validateApiKey(apiKey);
      result.latencyMs = Date.now() - start;
      logger.info(
        `Provider ${provider.name}: reachable=${result.reachable} latency=${result.latencyMs}ms`,
        'ProviderHealthChecker'
      );
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      result.latencyMs = Date.now() - start;
      logger.warn(`Provider ${provider.name} health check failed: ${result.error}`, 'ProviderHealthChecker');
    }

    return result;
  }

  formatResult(result: ProviderHealthResult): string {
    const status = result.reachable ? '✓' : '✗';
    const latency = result.latencyMs !== undefined ? ` (${result.latencyMs}ms)` : '';
    const error = result.error ? ` — ${result.error}` : '';
    return `${status} ${result.name}${latency}${error}`;
  }
}
