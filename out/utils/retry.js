"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
exports.isRetryableNetworkError = isRetryableNetworkError;
async function withRetry(fn, options) {
    const { maxAttempts, delayMs, backoffFactor = 2, shouldRetry = () => true } = options;
    let lastError;
    let delay = delayMs;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            if (attempt === maxAttempts || !shouldRetry(err)) {
                throw err;
            }
            await sleep(delay);
            delay *= backoffFactor;
        }
    }
    throw lastError;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableNetworkError(err) {
    if (!(err instanceof Error)) {
        return false;
    }
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    const msg = err.message.toLowerCase();
    return (retryableCodes.some((code) => msg.includes(code.toLowerCase())) ||
        msg.includes('network') ||
        msg.includes('timeout'));
}
//# sourceMappingURL=retry.js.map