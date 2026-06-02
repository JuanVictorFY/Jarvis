"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const AnthropicProvider_1 = require("./AnthropicProvider");
const OpenAIProvider_1 = require("./OpenAIProvider");
const GeminiProvider_1 = require("./GeminiProvider");
class ProviderFactory {
    providers = new Map();
    constructor(credentials) {
        this.providers.set('anthropic', new AnthropicProvider_1.AnthropicProvider(credentials.anthropicApiKey ?? ''));
        this.providers.set('openai', new OpenAIProvider_1.OpenAIProvider(credentials.openaiApiKey ?? ''));
        this.providers.set('gemini', new GeminiProvider_1.GeminiProvider(credentials.geminiApiKey ?? ''));
    }
    getProvider(type) {
        const provider = this.providers.get(type);
        if (!provider) {
            throw new Error(`Unknown provider: ${type}`);
        }
        return provider;
    }
    updateCredentials(credentials) {
        if (credentials.anthropicApiKey !== undefined) {
            this.providers.get('anthropic').updateApiKey(credentials.anthropicApiKey);
        }
        if (credentials.openaiApiKey !== undefined) {
            this.providers.get('openai').updateApiKey(credentials.openaiApiKey);
        }
        if (credentials.geminiApiKey !== undefined) {
            this.providers.get('gemini').updateApiKey(credentials.geminiApiKey);
        }
    }
    listProviders() {
        return Array.from(this.providers.values());
    }
    getConfiguredProviders() {
        return this.listProviders().filter((p) => p.isConfigured());
    }
    async getHealthStatus() {
        const results = {};
        for (const [type, provider] of this.providers) {
            results[type] = provider.isConfigured();
        }
        return results;
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=ProviderFactory.js.map