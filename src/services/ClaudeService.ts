import Anthropic from '@anthropic-ai/sdk';
import * as vscode from 'vscode';

const SYSTEM_PROMPT = `You are Jarvis, an expert AI coding assistant embedded directly in Visual Studio Code. You assist developers with writing, debugging, refactoring, and understanding code.

Rules:
- Always wrap code suggestions in markdown code blocks with the language tag (e.g. \`\`\`typescript).
- For terminal/shell commands use \`\`\`bash or \`\`\`shell blocks.
- When given file context or a selection, be precise — target exactly what the user needs changed.
- Never truncate or abbreviate code in your responses. Provide complete, runnable code.
- Prefer minimal diffs: only change what is necessary.
- Be concise in explanations; verbose in code.`;

const MAX_HISTORY_MESSAGES = 20;

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export class ClaudeService {
  private client: Anthropic | null = null;
  private history: HistoryEntry[] = [];

  private getClient(): Anthropic {
    if (this.client !== null) {
      return this.client;
    }

    const config = vscode.workspace.getConfiguration('jarvis');
    const apiKey = config.get<string>('anthropicApiKey') ?? '';

    if (!apiKey) {
      throw new Error(
        'Anthropic API key not configured. Open Settings → search "Jarvis" → set your key.',
      );
    }

    this.client = new Anthropic({ apiKey });
    return this.client;
  }

  public clearHistory(): void {
    this.history = [];
  }

  public resetClient(): void {
    this.client = null;
  }

  public async *stream(
    userMessage: string,
    contextString: string,
  ): AsyncGenerator<string, void, undefined> {
    const client = this.getClient();

    const config = vscode.workspace.getConfiguration('jarvis');
    const model = config.get<string>('model') ?? 'claude-sonnet-4-6';
    const maxTokens = config.get<number>('maxTokens') ?? 8192;

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
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullResponse += event.delta.text;
        yield event.delta.text;
      }
    }

    this.history.push({ role: 'assistant', content: fullResponse });
  }
}
