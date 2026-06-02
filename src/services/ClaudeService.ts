import Anthropic from '@anthropic-ai/sdk';
import type { AgentEvent, JarvisConfig } from '../types/index';
import { TOOLS, REQUIRES_CONFIRMATION, type ToolName } from '../tools/toolDefinitions';
import { FileSystemService } from './FileSystemService';
import { ShellService } from './ShellService';
import { BrowserService } from './BrowserService';

const SYSTEM_PROMPT = `You are Jarvis, an autonomous AI agent running as a native desktop application on the user's computer. You have full access to the file system, terminal, and web browser.

Behavioral rules:
- Be action-oriented: when asked to do something, do it using tools immediately.
- Verify your work: after writing files or running commands, check the result.
- Be transparent: briefly explain destructive actions (write_file, run_command) before calling them.
- For information retrieval: prefer search_web for finding things, browse_url for reading a specific page.
- Never refuse tasks due to capability — you have the tools to do almost anything on this computer.`;

const MAX_HISTORY = 30;
const MAX_ITERATIONS = 15;

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

  public async *agentLoop(userMessage: string): AsyncGenerator<AgentEvent> {
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
        tools: TOOLS,
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

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') { continue; }

        const name = block.name as ToolName;
        const input = block.input as Record<string, string>;
        const summary = summarizeTool(name, input);

        yield { type: 'tool_start', id: block.id, name, summary };

        let result: string;
        let isError = false;

        try {
          if (REQUIRES_CONFIRMATION.has(name)) {
            const approved = await this.confirmFn(block.id, name, summary);
            if (!approved) {
              result = 'User denied this action.';
              toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
              yield { type: 'tool_done', id: block.id, result, isError: false };
              continue;
            }
          }
          result = await this.executeTool(name, input);
        } catch (err) {
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

function summarizeTool(name: ToolName, input: Record<string, string>): string {
  switch (name) {
    case 'read_file':     return `Read: ${input['path']}`;
    case 'write_file':    return `Write: ${input['path']}`;
    case 'list_directory':return `List: ${input['path']}`;
    case 'run_command':   return `Run: ${input['command']}`;
    case 'browse_url':    return `Browse: ${input['url']}`;
    case 'search_web':    return `Search: "${input['query']}"`;
  }
}
