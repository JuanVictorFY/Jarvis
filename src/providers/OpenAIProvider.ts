import https from 'https';
import type {
  AIProvider,
  ProviderCompletionRequest,
  ProviderStreamChunk,
} from './AIProvider';

interface OpenAIStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAI';
  readonly id = 'openai';
  readonly availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  private readonly baseUrl = 'api.openai.com';

  constructor(private apiKey: string) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  updateApiKey(key: string): void {
    this.apiKey = key;
  }

  async validateApiKey(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: this.baseUrl,
          path: '/v1/models',
          method: 'GET',
          headers: { Authorization: `Bearer ${key}` },
        },
        (res) => resolve(res.statusCode === 200)
      );
      req.on('error', () => resolve(false));
      req.setTimeout(8_000, () => { req.destroy(); resolve(false); });
      req.end();
    });
  }

  async streamCompletion(
    request: ProviderCompletionRequest,
    model: string,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<void> {
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
      const req = https.request(
        {
          hostname: this.baseUrl,
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
        },
        (res) => {
          let buffer = '';
          res.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) { continue; }
              const data = line.slice(6).trim();
              if (data === '[DONE]') { onChunk({ type: 'done', stopReason: 'stop' }); continue; }
              try {
                const parsed = JSON.parse(data) as OpenAIStreamChunk;
                const delta = parsed.choices[0]?.delta;
                if (delta?.content) { onChunk({ type: 'text', text: delta.content }); }
              } catch { /* skip malformed */ }
            }
          });
          res.on('end', resolve);
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
