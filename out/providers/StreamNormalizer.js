"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamNormalizer = void 0;
class StreamNormalizer {
    pendingToolCalls = new Map();
    normalize(chunk) {
        switch (chunk.type) {
            case 'text':
                return { type: 'text', text: chunk.text };
            case 'tool_call': {
                const call = chunk.toolCall;
                if (!call) {
                    return null;
                }
                this.pendingToolCalls.set(call.id, { name: call.name, inputBuffer: '' });
                return {
                    type: 'tool_start',
                    toolName: call.name,
                    toolUseId: call.id,
                    toolInput: call.input,
                };
            }
            case 'done':
                return {
                    type: 'done',
                    stopReason: chunk.stopReason,
                    inputTokens: chunk.inputTokens,
                    outputTokens: chunk.outputTokens,
                };
            default:
                return null;
        }
    }
    appendToolInput(toolId, jsonDelta) {
        const call = this.pendingToolCalls.get(toolId);
        if (call) {
            call.inputBuffer += jsonDelta;
        }
    }
    finalizeToolCall(toolId) {
        const call = this.pendingToolCalls.get(toolId);
        if (!call) {
            return null;
        }
        try {
            const input = JSON.parse(call.inputBuffer);
            this.pendingToolCalls.delete(toolId);
            return input;
        }
        catch {
            this.pendingToolCalls.delete(toolId);
            return {};
        }
    }
    reset() {
        this.pendingToolCalls.clear();
    }
}
exports.StreamNormalizer = StreamNormalizer;
//# sourceMappingURL=StreamNormalizer.js.map