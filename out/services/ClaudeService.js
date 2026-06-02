"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const http_1 = __importDefault(require("http"));
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
const MAX_ITERATIONS = 15;
const HISTORY_TOKEN_BUDGET = 80_000;
function parseOllamaUrl(baseUrl) {
    try {
        const u = new URL(baseUrl ?? 'http://localhost:11434');
        return { host: u.hostname, port: parseInt(u.port || '11434', 10) };
    }
    catch {
        return { host: 'localhost', port: 11434 };
    }
}
class ClaudeService {
    getConfig;
    confirmFn;
    history = [];
    fsService = new FileSystemService_1.FileSystemService();
    shellService = new ShellService_1.ShellService();
    browserService = new BrowserService_1.BrowserService();
    constructor(getConfig, confirmFn) {
        this.getConfig = getConfig;
        this.confirmFn = confirmFn;
    }
    clearHistory() {
        this.history = [];
    }
    estimateHistoryTokens() {
        return this.history.reduce((sum, msg) => sum + (0, tokenUtils_1.estimateTokens)(msg.content), 0);
    }
    trimHistory() {
        while (this.history.length > 2 && this.estimateHistoryTokens() > HISTORY_TOKEN_BUDGET) {
            this.history.splice(0, 2);
        }
    }
    streamOllama(messages) {
        const { model, maxTokens, ollamaBaseUrl } = this.getConfig();
        const { host, port } = parseOllamaUrl(ollamaBaseUrl ?? 'http://localhost:11434');
        const body = JSON.stringify({
            model: model || 'llama3.2',
            messages,
            tools: toolDefinitions_1.TOOLS,
            stream: true,
            options: { num_predict: maxTokens || 8192 },
        });
        const queue = [];
        let notify = null;
        const push = (item) => {
            queue.push(item);
            const r = notify;
            notify = null;
            r?.();
        };
        const req = http_1.default.request({
            hostname: host,
            port,
            path: '/api/chat',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }, (res) => {
            let buf = '';
            res.on('data', (chunk) => {
                buf += chunk.toString();
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    try {
                        const parsed = JSON.parse(line);
                        push(parsed);
                    }
                    catch { /* skip malformed */ }
                }
            });
            res.on('end', () => push('end'));
            res.on('error', (e) => push(e));
        });
        req.on('error', (e) => push(e));
        req.setTimeout(120_000, () => {
            req.destroy();
            push(new Error('Ollama request timed out after 2 minutes'));
        });
        req.write(body);
        req.end();
        return {
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        while (queue.length === 0) {
                            await new Promise((r) => { notify = r; });
                        }
                        const item = queue.shift();
                        if (item === 'end')
                            return { done: true, value: undefined };
                        if (item instanceof Error)
                            throw item;
                        return { done: false, value: item };
                    },
                    return() {
                        req.destroy();
                        return Promise.resolve({ done: true, value: undefined });
                    },
                };
            },
        };
    }
    validateToolInput(name, input) {
        const tool = toolDefinitions_1.TOOLS.find(t => t.function.name === name);
        if (!tool)
            return;
        for (const field of tool.function.parameters.required) {
            if (!(field in input) || input[field] === undefined || input[field] === '') {
                throw new Error(`Tool "${name}": missing required field "${field}"`);
            }
        }
    }
    async *agentLoop(userMessage) {
        this.history.push({ role: 'user', content: userMessage });
        this.trimHistory();
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...this.history,
            ];
            let accContent = '';
            let finalToolCalls = [];
            let hasText = false;
            try {
                for await (const chunk of this.streamOllama(messages)) {
                    if (chunk.error) {
                        yield { type: 'error', message: `Ollama error: ${chunk.error}` };
                        return;
                    }
                    if (chunk.message?.content) {
                        yield { type: 'text', text: chunk.message.content };
                        accContent += chunk.message.content;
                        hasText = true;
                    }
                    if (chunk.done) {
                        finalToolCalls = chunk.message?.tool_calls ?? [];
                        totalInputTokens += chunk.prompt_eval_count ?? 0;
                        totalOutputTokens += chunk.eval_count ?? 0;
                    }
                }
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                const friendly = msg.includes('ECONNREFUSED')
                    ? 'Cannot connect to Ollama. Make sure Ollama is running (`ollama serve`) and the model is installed (`ollama pull llama3.2`).'
                    : `Ollama error: ${msg}`;
                yield { type: 'error', message: friendly };
                return;
            }
            if (hasText)
                yield { type: 'text_done' };
            // No tool calls → conversation turn complete
            if (finalToolCalls.length === 0) {
                this.history.push({ role: 'assistant', content: accContent });
                this.trimHistory();
                yield { type: 'done', inputTokens: totalInputTokens, outputTokens: totalOutputTokens };
                return;
            }
            // Add assistant message with tool_calls to history
            this.history.push({ role: 'assistant', content: accContent, tool_calls: finalToolCalls });
            // Execute each tool call
            for (let j = 0; j < finalToolCalls.length; j++) {
                const toolCall = finalToolCalls[j];
                const name = toolCall.function.name;
                const input = toolCall.function.arguments;
                const summary = summarizeTool(name, input);
                const toolId = `${name}_${i}_${j}`;
                yield { type: 'tool_start', id: toolId, name, summary };
                let result;
                let isError = false;
                try {
                    this.validateToolInput(name, input);
                    if (toolDefinitions_1.REQUIRES_CONFIRMATION.has(name)) {
                        const approved = await this.confirmFn(toolId, name, summary);
                        if (!approved) {
                            result = 'User denied this action.';
                            this.history.push({ role: 'tool', content: result });
                            yield { type: 'tool_done', id: toolId, result, isError: false };
                            continue;
                        }
                    }
                    result = await this.executeTool(name, input);
                }
                catch (err) {
                    result = err instanceof Error ? err.message : String(err);
                    isError = true;
                }
                this.history.push({ role: 'tool', content: result });
                yield { type: 'tool_done', id: toolId, result, isError };
            }
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