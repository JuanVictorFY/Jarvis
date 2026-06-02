"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropicToProvider = anthropicToProvider;
exports.providerToOpenAI = providerToOpenAI;
exports.providerToGemini = providerToGemini;
exports.estimateMessageTokens = estimateMessageTokens;
function anthropicToProvider(messages) {
    return messages.flatMap((msg) => {
        if (typeof msg.content === 'string') {
            return [{ role: msg.role, content: msg.content }];
        }
        const textBlocks = msg.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('\n');
        if (!textBlocks) {
            return [];
        }
        return [{ role: msg.role, content: textBlocks }];
    });
}
function providerToOpenAI(messages) {
    return messages.map((m) => ({ role: m.role, content: m.content }));
}
function providerToGemini(messages) {
    return messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));
}
function estimateMessageTokens(messages) {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4);
}
//# sourceMappingURL=MessageConverter.js.map