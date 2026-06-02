"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTokens = estimateTokens;
exports.getContextLimit = getContextLimit;
exports.isWithinContextLimit = isWithinContextLimit;
exports.getTokenBudget = getTokenBudget;
exports.formatTokenCount = formatTokenCount;
const CHARS_PER_TOKEN = {
    anthropic: 4,
    openai: 4,
    gemini: 4,
};
const CONTEXT_LIMITS = {
    'claude-sonnet-4-6': 200_000,
    'claude-opus-4-8': 200_000,
    'claude-haiku-4-5-20251001': 200_000,
    'gpt-4o': 128_000,
    'gpt-4o-mini': 128_000,
    'gpt-4-turbo': 128_000,
    'gpt-3.5-turbo': 16_000,
    'gemini-2.0-flash': 1_000_000,
    'gemini-2.0-pro': 2_000_000,
    'gemini-1.5-flash': 1_000_000,
    'gemini-1.5-pro': 2_000_000,
};
function estimateTokens(text, provider = 'anthropic') {
    const charsPerToken = CHARS_PER_TOKEN[provider];
    return Math.ceil(text.length / charsPerToken);
}
function getContextLimit(model) {
    return CONTEXT_LIMITS[model] ?? 100_000;
}
function isWithinContextLimit(text, model, provider = 'anthropic') {
    return estimateTokens(text, provider) <= getContextLimit(model);
}
function getTokenBudget(model, usedTokens, maxOutputTokens) {
    const limit = getContextLimit(model);
    return Math.max(0, limit - usedTokens - maxOutputTokens);
}
function formatTokenCount(count) {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(1)}K`;
    }
    return String(count);
}
//# sourceMappingURL=TokenCounter.js.map