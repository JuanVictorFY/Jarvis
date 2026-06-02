"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicProvider {
    apiKey;
    name = 'Anthropic (Claude)';
    id = 'anthropic';
    availableModels = [
        'claude-sonnet-4-6',
        'claude-opus-4-8',
        'claude-haiku-4-5-20251001',
    ];
    client = null;
    constructor(apiKey) {
        this.apiKey = apiKey;
        if (apiKey) {
            this.client = new sdk_1.default({ apiKey });
        }
    }
    updateApiKey(key) {
        this.apiKey = key;
        this.client = key ? new sdk_1.default({ apiKey: key }) : null;
    }
    isConfigured() {
        return Boolean(this.apiKey && this.client);
    }
    async validateApiKey(key) {
        try {
            const testClient = new sdk_1.default({ apiKey: key });
            await testClient.models.list();
            return true;
        }
        catch {
            return false;
        }
    }
    async streamCompletion(request, model, onChunk) {
        if (!this.client) {
            throw new Error('Anthropic API key not configured');
        }
        const tools = request.tools?.map(this.toAnthropicTool) ?? [];
        const stream = this.client.messages.stream({
            model,
            max_tokens: request.maxTokens,
            system: request.systemPrompt,
            messages: request.messages,
            tools: tools.length > 0 ? tools : undefined,
        });
        for await (const event of stream) {
            if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                    onChunk({ type: 'text', text: event.delta.text });
                }
                else if (event.delta.type === 'input_json_delta') {
                    // tool input streaming — handled in tool_use block
                }
            }
            else if (event.type === 'content_block_start') {
                if (event.content_block.type === 'tool_use') {
                    onChunk({
                        type: 'tool_call',
                        toolCall: {
                            id: event.content_block.id,
                            name: event.content_block.name,
                            input: {},
                        },
                    });
                }
            }
            else if (event.type === 'message_delta') {
                const usage = event.usage;
                onChunk({
                    type: 'done',
                    stopReason: event.delta.stop_reason ?? 'end_turn',
                    outputTokens: usage?.output_tokens,
                });
            }
        }
        const final = await stream.finalMessage();
        onChunk({
            type: 'done',
            stopReason: final.stop_reason ?? 'end_turn',
            inputTokens: final.usage.input_tokens,
            outputTokens: final.usage.output_tokens,
        });
    }
    toAnthropicTool(tool) {
        return {
            name: tool.name,
            description: tool.description,
            input_schema: { type: 'object', ...tool.parameters },
        };
    }
}
exports.AnthropicProvider = AnthropicProvider;
//# sourceMappingURL=AnthropicProvider.js.map