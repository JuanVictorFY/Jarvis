"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateCost = estimateCost;
exports.formatCost = formatCost;
exports.getPricing = getPricing;
exports.listPricedModels = listPricedModels;
const MODEL_PRICING = {
    'claude-sonnet-4-6': { inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0.015, currency: 'USD' },
    'claude-opus-4-8': { inputCostPer1kTokens: 0.015, outputCostPer1kTokens: 0.075, currency: 'USD' },
    'claude-haiku-4-5-20251001': { inputCostPer1kTokens: 0.00025, outputCostPer1kTokens: 0.00125, currency: 'USD' },
    'gpt-4o': { inputCostPer1kTokens: 0.005, outputCostPer1kTokens: 0.015, currency: 'USD' },
    'gpt-4o-mini': { inputCostPer1kTokens: 0.00015, outputCostPer1kTokens: 0.0006, currency: 'USD' },
    'gemini-2.0-flash': { inputCostPer1kTokens: 0.0001, outputCostPer1kTokens: 0.0004, currency: 'USD' },
    'gemini-1.5-pro': { inputCostPer1kTokens: 0.00125, outputCostPer1kTokens: 0.005, currency: 'USD' },
};
function estimateCost(model, inputTokens, outputTokens) {
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
        return null;
    }
    return ((inputTokens / 1000) * pricing.inputCostPer1kTokens +
        (outputTokens / 1000) * pricing.outputCostPer1kTokens);
}
function formatCost(usd) {
    if (usd === null) {
        return 'N/A';
    }
    if (usd < 0.001) {
        return `$${(usd * 1000).toFixed(4)}m`;
    }
    return `$${usd.toFixed(4)}`;
}
function getPricing(model) {
    return MODEL_PRICING[model];
}
function listPricedModels() {
    return Object.keys(MODEL_PRICING);
}
//# sourceMappingURL=CostEstimator.js.map