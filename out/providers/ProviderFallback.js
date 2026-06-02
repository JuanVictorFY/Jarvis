"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFallback = void 0;
const logger_1 = require("../utils/logger");
class ProviderFallback {
    chain;
    constructor(providers) {
        this.chain = providers.filter((p) => p.isConfigured());
    }
    async streamWithFallback(request, modelsByProvider, onChunk) {
        const errors = [];
        for (const provider of this.chain) {
            const model = modelsByProvider.get(provider.id);
            if (!model) {
                continue;
            }
            try {
                await provider.streamCompletion(request, model, onChunk);
                return provider.id;
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                errors.push(`${provider.name}: ${msg}`);
                logger_1.logger.warn(`Provider ${provider.name} failed, trying next. Error: ${msg}`, 'ProviderFallback');
            }
        }
        throw new Error(`All providers failed:\n${errors.join('\n')}`);
    }
    getChain() {
        return [...this.chain];
    }
    addProvider(provider) {
        if (provider.isConfigured() && !this.chain.some((p) => p.id === provider.id)) {
            this.chain.push(provider);
        }
    }
    removeProvider(id) {
        const idx = this.chain.findIndex((p) => p.id === id);
        if (idx !== -1) {
            this.chain.splice(idx, 1);
        }
    }
}
exports.ProviderFallback = ProviderFallback;
//# sourceMappingURL=ProviderFallback.js.map