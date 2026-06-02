"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const http_1 = __importDefault(require("http"));
class OllamaProvider {
    host;
    port;
    name = 'Ollama (Local)';
    id = 'ollama';
    availableModels = ['llama3.2', 'mistral', 'phi3', 'gemma2', 'qwen2.5'];
    constructor(host = 'localhost', port = 11434) {
        this.host = host;
        this.port = port;
    }
    isConfigured() {
        return true;
    }
    async validateApiKey(_key) {
        return new Promise((resolve) => {
            const req = http_1.default.get({ hostname: this.host, port: this.port, path: '/api/tags' }, (res) => {
                if (res.statusCode === 200) {
                    let data = '';
                    res.on('data', (c) => { data += c.toString(); });
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            this.availableModels = (parsed.models ?? []).map((m) => m.name);
                        }
                        catch { /* ignore */ }
                        resolve(true);
                    });
                }
                else {
                    resolve(false);
                }
            });
            req.on('error', () => resolve(false));
            req.setTimeout(5_000, () => { req.destroy(); resolve(false); });
        });
    }
    async streamCompletion(request, model, onChunk) {
        const body = JSON.stringify({
            model,
            messages: [
                ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                ...request.messages,
            ],
            stream: true,
            options: { num_predict: request.maxTokens },
        });
        return new Promise((resolve, reject) => {
            const req = http_1.default.request({
                hostname: this.host,
                port: this.port,
                path: '/api/chat',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }, (res) => {
                let buffer = '';
                res.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';
                    for (const line of lines) {
                        if (!line.trim()) {
                            continue;
                        }
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                onChunk({ type: 'text', text: parsed.message.content });
                            }
                            if (parsed.done) {
                                onChunk({
                                    type: 'done',
                                    stopReason: 'stop',
                                    inputTokens: parsed.prompt_eval_count,
                                    outputTokens: parsed.eval_count,
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
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=OllamaProvider.js.map