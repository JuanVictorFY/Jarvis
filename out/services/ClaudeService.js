"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const vscode = __importStar(require("vscode"));
const SYSTEM_PROMPT = `You are Jarvis, an expert AI coding assistant embedded directly in Visual Studio Code. You assist developers with writing, debugging, refactoring, and understanding code.

Rules:
- Always wrap code suggestions in markdown code blocks with the language tag (e.g. \`\`\`typescript).
- For terminal/shell commands use \`\`\`bash or \`\`\`shell blocks.
- When given file context or a selection, be precise — target exactly what the user needs changed.
- Never truncate or abbreviate code in your responses. Provide complete, runnable code.
- Prefer minimal diffs: only change what is necessary.
- Be concise in explanations; verbose in code.`;
const MAX_HISTORY_MESSAGES = 20;
class ClaudeService {
    client = null;
    history = [];
    getClient() {
        if (this.client !== null) {
            return this.client;
        }
        const config = vscode.workspace.getConfiguration('jarvis');
        const apiKey = config.get('anthropicApiKey') ?? '';
        if (!apiKey) {
            throw new Error('Anthropic API key not configured. Open Settings → search "Jarvis" → set your key.');
        }
        this.client = new sdk_1.default({ apiKey });
        return this.client;
    }
    clearHistory() {
        this.history = [];
    }
    resetClient() {
        this.client = null;
    }
    async *stream(userMessage, contextString) {
        const client = this.getClient();
        const config = vscode.workspace.getConfiguration('jarvis');
        const model = config.get('model') ?? 'claude-sonnet-4-6';
        const maxTokens = config.get('maxTokens') ?? 8192;
        const fullUserMessage = contextString
            ? `<context>\n${contextString}\n</context>\n\n${userMessage}`
            : userMessage;
        this.history.push({ role: 'user', content: fullUserMessage });
        if (this.history.length > MAX_HISTORY_MESSAGES) {
            this.history = this.history.slice(-MAX_HISTORY_MESSAGES);
        }
        let fullResponse = '';
        const messageStream = client.messages.stream({
            model,
            max_tokens: maxTokens,
            system: SYSTEM_PROMPT,
            messages: this.history,
        });
        for await (const event of messageStream) {
            if (event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta') {
                fullResponse += event.delta.text;
                yield event.delta.text;
            }
        }
        this.history.push({ role: 'assistant', content: fullResponse });
    }
}
exports.ClaudeService = ClaudeService;
//# sourceMappingURL=ClaudeService.js.map