"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const toolDefinitions_1 = require("../tools/toolDefinitions");
const FileSystemService_1 = require("./FileSystemService");
const ShellService_1 = require("./ShellService");
const BrowserService_1 = require("./BrowserService");
const tokenUtils_1 = require("../utils/tokenUtils");
const SYSTEM_PROMPT = `You are Jarvis, an autonomous AI agent running as a native desktop application on the user's computer. You have full access to the file system, terminal, and web browser.

Behavioral rules:
- Be action-oriented: when asked to do something, do it using tools immediately.
- Verify your work: after writing files or running commands, check the result.
- Be transparent: briefly explain destructive actions (write_file, run_command) before calling them.
- For information retrieval: prefer search_web for finding things, browse_url for reading a specific page.
- Never refuse tasks due to capability — you have the tools to do almost anything on this computer.`;
const SYSTEM_BLOCK = {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
};
const MAX_ITERATIONS = 15;
const HISTORY_TOKEN_BUDGET = 80_000;
class ClaudeService {
    getConfig;
    confirmFn;
    history = [];
    cachedClient = null;
    cachedKey = '';
    fsService = new FileSystemService_1.FileSystemService();
    shellService = new ShellService_1.ShellService();
    browserService = new BrowserService_1.BrowserService();
    constructor(getConfig, confirmFn) {
        this.getConfig = getConfig;
        this.confirmFn = confirmFn;
    }
    getClient() {
        const { anthropicApiKey } = this.getConfig();
        if (!anthropicApiKey) {
            throw new Error('API key not configured. Open Settings (⚙) and enter your Anthropic API key.');
        }
        if (this.cachedClient && this.cachedKey === anthropicApiKey) {
            return this.cachedClient;
        }
        this.cachedClient = new sdk_1.default({ apiKey: anthropicApiKey });
        this.cachedKey = anthropicApiKey;
        return this.cachedClient;
    }
    clearHistory() {
        this.history = [];
    }
    estimateHistoryTokens() {
        return this.history.reduce((sum, msg) => {
            if (typeof msg.content === 'string') {
                return sum + (0, tokenUtils_1.estimateTokens)(msg.content);
            }
            if (Array.isArray(msg.content)) {
                return sum + msg.content.reduce((s, block) => {
                    if ('text' in block && typeof block.text === 'string')
                        return s + (0, tokenUtils_1.estimateTokens)(block.text);
                    if ('content' in block && typeof block.content === 'string')
                        return s + (0, tokenUtils_1.estimateTokens)(block.content);
                    return s + 50;
                }, 0);
            }
            return sum;
        }, 0);
    }
    trimHistory() {
        while (this.history.length > 2 && this.estimateHistoryTokens() > HISTORY_TOKEN_BUDGET) {
            this.history.splice(0, 2);
        }
    }
    validateToolInput(name, input) {
        const tool = toolDefinitions_1.TOOLS.find(t => t.name === name);
        if (!tool)
            return;
        const required = (tool.input_schema.required ?? []);
        for (const field of required) {
            if (!(field in input) || input[field] === undefined || input[field] === '') {
                throw new Error(`Tool "${name}": missing required field "${field}"`);
            }
        }
    }
    async *agentLoop(userMessage) {
        const client = this.getClient();
        const { model, maxTokens } = this.getConfig();
        this.history.push({ role: 'user', content: userMessage });
        this.trimHistory();
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const stream = client.messages.stream({
                model,
                max_tokens: maxTokens,
                system: [SYSTEM_BLOCK],
                tools: toolDefinitions_1.TOOLS_WITH_CACHE,
                messages: this.history,
            });
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' &&
                    chunk.delta.type === 'text_delta' &&
                    chunk.delta.text) {
                    yield { type: 'text', text: chunk.delta.text };
                }
            }
            const response = await stream.finalMessage();
            totalInputTokens += response.usage.input_tokens;
            totalOutputTokens += response.usage.output_tokens;
            this.history.push({ role: 'assistant', content: response.content });
            const hasText = response.content.some(b => b.type === 'text' && b.text);
            if (hasText) {
                yield { type: 'text_done' };
            }
            if (response.stop_reason === 'end_turn') {
                yield { type: 'done', inputTokens: totalInputTokens, outputTokens: totalOutputTokens };
                return;
            }
            if (response.stop_reason !== 'tool_use') {
                yield { type: 'done', inputTokens: totalInputTokens, outputTokens: totalOutputTokens };
                return;
            }
            const toolResults = [];
            for (const block of response.content) {
                if (block.type !== 'tool_use')
                    continue;
                const name = block.name;
                const input = block.input;
                const summary = summarizeTool(name, input);
                yield { type: 'tool_start', id: block.id, name, summary };
                let result;
                let isError = false;
                try {
                    this.validateToolInput(name, input);
                    if (toolDefinitions_1.REQUIRES_CONFIRMATION.has(name)) {
                        const approved = await this.confirmFn(block.id, name, summary);
                        if (!approved) {
                            result = 'User denied this action.';
                            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
                            yield { type: 'tool_done', id: block.id, result, isError: false };
                            continue;
                        }
                    }
                    result = await this.executeTool(name, input);
                }
                catch (err) {
                    result = err instanceof Error ? err.message : String(err);
                    isError = true;
                }
                toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
                yield { type: 'tool_done', id: block.id, result, isError };
            }
            this.history.push({ role: 'user', content: toolResults });
            this.trimHistory();
        }
        yield {
            type: 'error',
            message: `Agent reached the maximum of ${MAX_ITERATIONS} iterations without completing.`,
        };
    }
    async executeTool(name, input) {
        switch (name) {
            case 'read_file':
                return this.fsService.readFile(input['path'] ?? '');
            case 'write_file':
                this.fsService.writeFile(input['path'] ?? '', input['content'] ?? '');
                return `Written: ${input['path']}`;
            case 'list_directory':
                return this.fsService.listDirectory(input['path'] ?? '');
            case 'run_command':
                return this.shellService.runCommand(input['command'] ?? '', input['cwd']);
            case 'browse_url':
                return this.browserService.browseUrl(input['url'] ?? '');
            case 'search_web':
                return this.browserService.searchWeb(input['query'] ?? '');
        }
    }
    async closeBrowser() {
        await this.browserService.close();
    }
}
exports.ClaudeService = ClaudeService;
function summarizeTool(name, input) {
    switch (name) {
        case 'read_file': return `Read: ${String(input['path'] ?? '')}`;
        case 'write_file': return `Write: ${String(input['path'] ?? '')}`;
        case 'list_directory': return `List: ${String(input['path'] ?? '')}`;
        case 'run_command': return `Run: ${String(input['command'] ?? '')}`;
        case 'browse_url': return `Browse: ${String(input['url'] ?? '')}`;
        case 'search_web': return `Search: "${String(input['query'] ?? '')}"`;
    }
}
//# sourceMappingURL=ClaudeService.js.map