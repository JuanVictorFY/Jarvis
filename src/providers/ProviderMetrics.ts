import type { ProviderType } from '../types/config';
import { metrics } from '../utils/metrics';

export class ProviderMetrics {
  recordRequest(provider: ProviderType, model: string, durationMs: number): void {
    metrics.increment(`provider.${provider}.requests`);
    metrics.increment(`model.${model}.requests`);
    metrics.recordDuration(`provider.${provider}.latency`, durationMs);
    metrics.recordDuration(`model.${model}.latency`, durationMs);
  }

  recordTokens(provider: ProviderType, input: number, output: number): void {
    metrics.increment(`provider.${provider}.input_tokens`, input);
    metrics.increment(`provider.${provider}.output_tokens`, output);
  }

  recordError(provider: ProviderType, errorType: string): void {
    metrics.increment(`provider.${provider}.errors`);
    metrics.increment(`provider.${provider}.error.${errorType}`);
  }

  recordCacheHit(provider: ProviderType): void {
    metrics.increment(`provider.${provider}.cache_hits`);
  }

  getProviderStats(provider: ProviderType): {
    requests: number;
    errors: number;
    avgLatencyMs: number | null;
    inputTokens: number;
    outputTokens: number;
  } {
    const latencyStats = metrics.getTimerStats(`provider.${provider}.latency`);
    return {
      requests: metrics.getCounter(`provider.${provider}.requests`),
      errors: metrics.getCounter(`provider.${provider}.errors`),
      avgLatencyMs: latencyStats?.avg ?? null,
      inputTokens: metrics.getCounter(`provider.${provider}.input_tokens`),
      outputTokens: metrics.getCounter(`provider.${provider}.output_tokens`),
    };
  }
}

export const providerMetrics = new ProviderMetrics();
