"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderHealthChecker = void 0;
const logger_1 = require("../utils/logger");
class ProviderHealthChecker {
    async checkProvider(providerId, provider, apiKey) {
        const result = {
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
            logger_1.logger.info(`Provider ${provider.name}: reachable=${result.reachable} latency=${result.latencyMs}ms`, 'ProviderHealthChecker');
        }
        catch (err) {
            result.error = err instanceof Error ? err.message : String(err);
            result.latencyMs = Date.now() - start;
            logger_1.logger.warn(`Provider ${provider.name} health check failed: ${result.error}`, 'ProviderHealthChecker');
        }
        return result;
    }
    formatResult(result) {
        const status = result.reachable ? '✓' : '✗';
        const latency = result.latencyMs !== undefined ? ` (${result.latencyMs}ms)` : '';
        const error = result.error ? ` — ${result.error}` : '';
        return `${status} ${result.name}${latency}${error}`;
    }
}
exports.ProviderHealthChecker = ProviderHealthChecker;
//# sourceMappingURL=ProviderHealthChecker.js.map