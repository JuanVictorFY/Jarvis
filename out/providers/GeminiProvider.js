"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const https_1 = __importDefault(require("https"));
class GeminiProvider {
    apiKey;
    name = 'Google Gemini';
    id = 'gemini';
    availableModels = [
        'gemini-2.0-flash',
        'gemini-2.0-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
    ];
    baseHost = 'generativelanguage.googleapis.com';
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
            const req = https_1.default.get(`https://${this.baseHost}/v1beta/models?key=${key}`, (res) => resolve(res.statusCode === 200));
            req.on('error', () => resolve(false));
            req.setTimeout(8_000, () => { req.destroy(); resolve(false); });
        });
    }
    async streamCompletion(request, model, onChunk) {
        const contents = request.messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));
        const body = JSON.stringify({
            contents,
            systemInstruction: request.systemPrompt
                ? { parts: [{ text: request.systemPrompt }] }
                : undefined,
            generationConfig: { maxOutputTokens: request.maxTokens },
        });
        const path = `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
        return new Promise((resolve, reject) => {
            const req = https_1.default.request({
                hostname: this.baseHost,
                path,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                        const raw = line.slice(6).trim();
                        try {
                            const parsed = JSON.parse(raw);
                            const text = parsed.candidates?.[0]?.content?.parts[0]?.text;
                            if (text) {
                                onChunk({ type: 'text', text });
                            }
                            const finishReason = parsed.candidates?.[0]?.finishReason;
                            if (finishReason) {
                                onChunk({
                                    type: 'done',
                                    stopReason: finishReason,
                                    inputTokens: parsed.usageMetadata?.promptTokenCount,
                                    outputTokens: parsed.usageMetadata?.candidatesTokenCount,
                                });
                            }
                        }
                        catch { /* skip */ }
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
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=GeminiProvider.js.map