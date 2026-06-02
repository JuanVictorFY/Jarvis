"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelCapabilities = getModelCapabilities;
exports.supportsFeature = supportsFeature;
const PROVIDER_CAPS = {
    'claude-sonnet-4-6': {
        supportsStreaming: true,
        supportsToolUse: true,
        supportsVision: true,
        supportsSystemPrompt: true,
        supportsMultiTurn: true,
        maxContextTokens: 200_000,
        maxOutputTokens: 8192,
    },
    'claude-opus-4-8': {
        supportsStreaming: true,
        supportsToolUse: true,
        supportsVision: true,
        supportsSystemPrompt: true,
        supportsMultiTurn: true,
        maxContextTokens: 200_000,
        maxOutputTokens: 8192,
    },
    'gpt-4o': {
        supportsStreaming: true,
        supportsToolUse: true,
        supportsVision: true,
        supportsSystemPrompt: true,
        supportsMultiTurn: true,
        maxContextTokens: 128_000,
        maxOutputTokens: 4096,
    },
    'gpt-4o-mini': {
        supportsStreaming: true,
        supportsToolUse: true,
        supportsVision: true,
        supportsSystemPrompt: true,
        supportsMultiTurn: true,
        maxContextTokens: 128_000,
        maxOutputTokens: 4096,
    },
    'gemini-2.0-flash': {
        supportsStreaming: true,
        supportsToolUse: true,
        supportsVision: true,
        supportsSystemPrompt: true,
        supportsMultiTurn: true,
        maxContextTokens: 1_000_000,
        maxOutputTokens: 8192,
    },
};
function getModelCapabilities(model) {
    return PROVIDER_CAPS[model];
}
function supportsFeature(model, feature) {
    const caps = PROVIDER_CAPS[model];
    if (!caps) {
        return false;
    }
    const value = caps[feature];
    return typeof value === 'boolean' ? value : true;
}
//# sourceMappingURL=ProviderCapabilities.js.map