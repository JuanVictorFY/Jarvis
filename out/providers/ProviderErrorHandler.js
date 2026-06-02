"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyProviderError = classifyProviderError;
const logger_1 = require("../utils/logger");
function classifyProviderError(provider, error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const info = {
        provider,
        isAuthError: false,
        isRateLimit: false,
        isNetworkError: false,
        isModelUnavailable: false,
        userMessage: 'An unexpected error occurred. Please try again.',
        retryable: false,
    };
    if (msg.includes('401') || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('authentication')) {
        info.isAuthError = true;
        info.userMessage = `Invalid API key for ${provider}. Please check your settings.`;
        info.retryable = false;
    }
    else if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many')) {
        info.isRateLimit = true;
        info.userMessage = `Rate limit exceeded for ${provider}. Please wait before trying again.`;
        info.retryable = true;
        info.retryAfterMs = 60_000;
    }
    else if (msg.includes('network') || msg.includes('econnreset') || msg.includes('timeout') || msg.includes('enotfound')) {
        info.isNetworkError = true;
        info.userMessage = 'Network error. Please check your internet connection.';
        info.retryable = true;
        info.retryAfterMs = 5_000;
    }
    else if (msg.includes('model') && (msg.includes('not found') || msg.includes('unavailable') || msg.includes('deprecated'))) {
        info.isModelUnavailable = true;
        info.userMessage = 'The selected model is unavailable. Please choose a different model in settings.';
        info.retryable = false;
    }
    logger_1.logger.warn(`Provider error [${provider}]: ${msg}`, 'ProviderErrorHandler');
    return info;
}
//# sourceMappingURL=ProviderErrorHandler.js.map