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
const SYSTEM_PROMPT = `You are Jarvis, an autonomous AI agent running as a native desktop application on the user's computer. You have full access to the file system, terminal, and web browser.

Behavioral rules:
- Be action-oriented: when asked to do something, do it using tools immediately.
- Verify your work: after writing files or running commands, check the result.
- Be transparent: briefly explain destructive actions (write_file, run_command) before calling them.
- For information retrieval: prefer search_web for finding things, browse_url for reading a specific page.
- Never refuse tasks due to capability — you have the tools to do almost anything on this computer.`;
const MAX_HISTORY = 30;
const MAX_ITERATIONS = 15;
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
    async *agentLoop(userMessage) {
        const client = this.getClient();
        const { model, maxTokens } = this.getConfig();
        this.history.push({ role: 'user', content: userMessage });
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(-MAX_HISTORY);
        }
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const response = await client.messages.create({
                model,
                max_tokens: maxTokens,
                system: SYSTEM_PROMPT,
                tools: toolDefinitions_1.TOOLS,
                messages: this.history,
            });
            this.history.push({ role: 'assistant', content: response.content });
            for (const block of response.content) {
                if (block.type === 'text' && block.text) {
                    yield { type: 'text', text: block.text };
                    yield { type: 'text_done' };
                }
            }
            if (response.stop_reason === 'end_turn') {
                yield { type: 'done' };
                return;
            }
            if (response.stop_reason !== 'tool_use') {
                yield { type: 'done' };
                return;
            }
            const toolResults = [];
            for (const block of response.content) {
                if (block.type !== 'tool_use') {
                    continue;
                }
                const name = block.name;
                const input = block.input;
                const summary = summarizeTool(name, input);
                yield { type: 'tool_start', id: block.id, name, summary };
                let result;
                let isError = false;
                try {
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
        }
        yield { type: 'error', message: 'Max iterations reached without a final response.' };
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
        case 'read_file': return `Read: ${input['path']}`;
        case 'write_file': return `Write: ${input['path']}`;
        case 'list_directory': return `List: ${input['path']}`;
        case 'run_command': return `Run: ${input['command']}`;
        case 'browse_url': return `Browse: ${input['url']}`;
        case 'search_web': return `Search: "${input['query']}"`;
    }
}
//# sourceMappingURL=ClaudeService.js.map