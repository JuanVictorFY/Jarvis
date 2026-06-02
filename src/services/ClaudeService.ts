import Anthropic from '@anthropic-ai/sdk';
import type { AgentEvent, JarvisConfig } from '../types/index';
import { TOOLS, TOOLS_WITH_CACHE, REQUIRES_CONFIRMATION, type ToolName } from '../tools/toolDefinitions';
import { FileSystemService } from './FileSystemService';
import { ShellService } from './ShellService';
import { BrowserService } from './BrowserService';
import { estimateTokens } from '../utils/tokenUtils';

const SYSTEM_PROMPT = `You are Jarvis, an autonomous AI agent running as a native desktop application on the user's computer. You have full access to the file system, terminal, and web browser.

Behavioral rules:
- Be action-oriented: when asked to do something, do it using tools immediately.
- Verify your work: after writing files or running commands, check the result.
- Be transparent: briefly explain destructive actions (write_file, run_command) before calling them.
- For information retrieval: prefer search_web for finding things, browse_url for reading a specific page.
- Never refuse tasks due to capability — you have the tools to do almost anything on this computer.`;

const SYSTEM_BLOCK: Anthropic.TextBlockParam = {
  type: 'text',
  text: SYSTEM_PROMPT,
  cache_control: { type: 'ephemeral' },
};

const MAX_ITERATIONS = 15;
const HISTORY_TOKEN_BUDGET = 80_000;

type ConfirmFn = (id: string, action: string, detail: string) => Promise<boolean>;

export class ClaudeService {
  private history: Anthropic.MessageParam[] = [];
  private cachedClient: Anthropic | null = null;
  private cachedKey = '';
  private readonly fsService = new FileSystemService();
  private readonly shellService = new ShellService();
  private readonly browserService = new BrowserService();

  constructor(
    private readonly getConfig: () => JarvisConfig,
    private readonly confirmFn: ConfirmFn,
  ) {}

  private getClient(): Anthropic {
    const { anthropicApiKey } = this.getConfig();
    if (!anthropicApiKey) {
      throw new Error(
        'API key not configured. Open Settings (⚙) and enter your Anthropic API key.',
      );
    }
    if (this.cachedClient && this.cachedKey === anthropicApiKey) {
      return this.cachedClient;
    }
    this.cachedClient = new Anthropic({ apiKey: anthropicApiKey });
    this.cachedKey = anthropicApiKey;
    return this.cachedClient;
  }

  public clearHistory(): void {
    this.history = [];
  }

  private estimateHistoryTokens(): number {
    return this.history.reduce((sum, msg) => {
      if (typeof msg.content === 'string') {
        return sum + estimateTokens(msg.content);
      }
      if (Array.isArray(msg.content)) {
        return sum + msg.content.reduce((s, block) => {
          if ('text' in block && typeof block.text === 'string') return s + estimateTokens(block.text);
          if ('content' in block && typeof block.content === 'string') return s + estimateTokens(block.content as string);
          return s + 50;
        }, 0);
      }
      return sum;
    }, 0);
  }

  private trimHistory(): void {
    while (this.history.length > 2 && this.estimateHistoryTokens() > HISTORY_TOKEN_BUDGET) {
      this.history.splice(0, 2);
    }
  }

  private validateToolInput(name: ToolName, input: Record<string, unknown>): void {
    const tool = TOOLS.find(t => t.name === name);
    if (!tool) return;
    const required = (tool.input_schema.required ?? []) as string[];
    for (const field of required) {
      if (!(field in input) || input[field] === undefined || input[field] === '') {
        throw new Error(`Tool "${name}": missing required field "${field}"`);
      }
    }
  }

  public async *agentLoop(userMessage: string): AsyncGenerator<AgentEvent> {
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
        tools: TOOLS_WITH_CACHE,
        messages: this.history,
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta' &&
          chunk.delta.text
        ) {
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

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        const name = block.name as ToolName;
        const input = block.input as Record<string, unknown>;
        const summary = summarizeTool(name, input);

        yield { type: 'tool_start', id: block.id, name, summary };

        let result: string;
        let isError = false;

        try {
          this.validateToolInput(name, input);

          if (REQUIRES_CONFIRMATION.has(name)) {
            const approved = await this.confirmFn(block.id, name, summary);
            if (!approved) {
              result = 'User denied this action.';
              toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
              yield { type: 'tool_done', id: block.id, result, isError: false };
              continue;
            }
          }

          result = await this.executeTool(name, input as Record<string, string>);
        } catch (err) {
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

  private async executeTool(name: ToolName, input: Record<string, string>): Promise<string> {
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

  public async closeBrowser(): Promise<void> {
    await this.browserService.close();
  }
}

function summarizeTool(name: ToolName, input: Record<string, unknown>): string {
  switch (name) {
    case 'read_file':      return `Read: ${String(input['path'] ?? '')}`;
    case 'write_file':     return `Write: ${String(input['path'] ?? '')}`;
    case 'list_directory': return `List: ${String(input['path'] ?? '')}`;
    case 'run_command':    return `Run: ${String(input['command'] ?? '')}`;
    case 'browse_url':     return `Browse: ${String(input['url'] ?? '')}`;
    case 'search_web':     return `Search: "${String(input['query'] ?? '')}"`;
  }
}
