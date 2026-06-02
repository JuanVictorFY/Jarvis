"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextWindowManager = void 0;
const TokenCounter_1 = require("./TokenCounter");
class ContextWindowManager {
    maxContextTokens;
    reservedForOutput;
    provider;
    constructor(maxContextTokens, reservedForOutput, provider = 'anthropic') {
        this.maxContextTokens = maxContextTokens;
        this.reservedForOutput = reservedForOutput;
        this.provider = provider;
    }
    get availableTokens() {
        return this.maxContextTokens - this.reservedForOutput;
    }
    trimMessages(messages, systemPrompt) {
        const systemTokens = systemPrompt ? (0, TokenCounter_1.estimateTokens)(systemPrompt, this.provider) : 0;
        let budget = this.availableTokens - systemTokens;
        if (budget <= 0) {
            return messages.slice(-1);
        }
        const result = [];
        for (let i = messages.length - 1; i >= 0; i--) {
            const tokens = (0, TokenCounter_1.estimateTokens)(messages[i].content, this.provider);
            if (tokens > budget) {
                break;
            }
            result.unshift(messages[i]);
            budget -= tokens;
        }
        if (result.length === 0 && messages.length > 0) {
            const last = messages[messages.length - 1];
            result.push({
                role: last.role,
                content: last.content.slice(0, budget * 4),
            });
        }
        return result;
    }
    countTokens(messages, systemPrompt) {
        const systemTokens = systemPrompt ? (0, TokenCounter_1.estimateTokens)(systemPrompt, this.provider) : 0;
        const messageTokens = messages.reduce((sum, m) => sum + (0, TokenCounter_1.estimateTokens)(m.content, this.provider), 0);
        return systemTokens + messageTokens;
    }
    isWithinLimit(messages, systemPrompt) {
        return this.countTokens(messages, systemPrompt) <= this.availableTokens;
    }
}
exports.ContextWindowManager = ContextWindowManager;
//# sourceMappingURL=ContextWindowManager.js.map