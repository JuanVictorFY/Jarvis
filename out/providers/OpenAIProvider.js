"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const https_1 = __importDefault(require("https"));
class OpenAIProvider {
    apiKey;
    name = 'OpenAI';
    id = 'openai';
    availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    baseUrl = 'api.openai.com';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    isConfigured() {
        return Boolean(this.apiKey);
    }
    updateApiKey(key) {
        this.apiKey = key;
    }
    async validateApiKey(key) {
        return new Promise((resolve) => {
            const req = https_1.default.request({
                hostname: this.baseUrl,
                path: '/v1/models',
                method: 'GET',
                headers: { Authorization: `Bearer ${key}` },
            }, (res) => resolve(res.statusCode === 200));
            req.on('error', () => resolve(false));
            req.setTimeout(8_000, () => { req.destroy(); resolve(false); });
            req.end();
        });
    }
    async streamCompletion(request, model, onChunk) {
        const body = JSON.stringify({
            model,
            max_tokens: request.maxTokens,
            stream: true,
            messages: [
                ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                ...request.messages,
            ],
            tools: request.tools?.map((t) => ({
                type: 'function',
                function: { name: t.name, description: t.description, parameters: t.parameters },
            })),
        });
        return new Promise((resolve, reject) => {
            const req = https_1.default.request({
                hostname: this.baseUrl,
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
            }, (res) => {
                let buffer = '';
                res.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';
                    for (const line of lines) {
                        if (!line.startsWith('data: ')) {
                            continue;
                        }
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            onChunk({ type: 'done', stopReason: 'stop' });
                            continue;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta;
                            if (delta?.content) {
                                onChunk({ type: 'text', text: delta.content });
                            }
                        }
                        catch { /* skip malformed */ }
                    }
                });
                res.on('end', resolve);
                res.on('error', reject);
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=OpenAIProvider.js.map