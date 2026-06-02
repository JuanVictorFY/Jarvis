"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerMetrics = exports.ProviderMetrics = void 0;
const metrics_1 = require("../utils/metrics");
class ProviderMetrics {
    recordRequest(provider, model, durationMs) {
        metrics_1.metrics.increment(`provider.${provider}.requests`);
        metrics_1.metrics.increment(`model.${model}.requests`);
        metrics_1.metrics.recordDuration(`provider.${provider}.latency`, durationMs);
        metrics_1.metrics.recordDuration(`model.${model}.latency`, durationMs);
    }
    recordTokens(provider, input, output) {
        metrics_1.metrics.increment(`provider.${provider}.input_tokens`, input);
        metrics_1.metrics.increment(`provider.${provider}.output_tokens`, output);
    }
    recordError(provider, errorType) {
        metrics_1.metrics.increment(`provider.${provider}.errors`);
        metrics_1.metrics.increment(`provider.${provider}.error.${errorType}`);
    }
    recordCacheHit(provider) {
        metrics_1.metrics.increment(`provider.${provider}.cache_hits`);
    }
    getProviderStats(provider) {
        const latencyStats = metrics_1.metrics.getTimerStats(`provider.${provider}.latency`);
        return {
            requests: metrics_1.metrics.getCounter(`provider.${provider}.requests`),
            errors: metrics_1.metrics.getCounter(`provider.${provider}.errors`),
            avgLatencyMs: latencyStats?.avg ?? null,
            inputTokens: metrics_1.metrics.getCounter(`provider.${provider}.input_tokens`),
            outputTokens: metrics_1.metrics.getCounter(`provider.${provider}.output_tokens`),
        };
    }
}
exports.ProviderMetrics = ProviderMetrics;
exports.providerMetrics = new ProviderMetrics();
//# sourceMappingURL=ProviderMetrics.js.map