import http from 'http';
import type {
  AIProvider,
  ProviderCompletionRequest,
  ProviderStreamChunk,
} from './AIProvider';

interface OllamaChunk {
  message?: { content?: string };
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider implements AIProvider {
  readonly name = 'Ollama (Local)';
  readonly id = 'ollama';
  availableModels: string[] = ['llama3.2', 'mistral', 'phi3', 'gemma2', 'qwen2.5'];

  constructor(private readonly host = 'localhost', private readonly port = 11434) {}

  isConfigured(): boolean {
    return true;
  }

  async validateApiKey(_key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(
        { hostname: this.host, port: this.port, path: '/api/tags' },
        (res) => {
          if (res.statusCode === 200) {
            let data = '';
            res.on('data', (c: Buffer) => { data += c.toString(); });
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data) as { models?: Array<{ name: string }> };
                this.availableModels = (parsed.models ?? []).map((m) => m.name);
              } catch { /* ignore */ }
              resolve(true);
            });
          } else {
            resolve(false);
          }
        }
      );
      req.on('error', () => resolve(false));
      req.setTimeout(5_000, () => { req.destroy(); resolve(false); });
    });
  }

  async streamCompletion(
    request: ProviderCompletionRequest,
    model: string,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<void> {
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
      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: '/api/chat',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let buffer = '';
          res.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.trim()) { continue; }
              try {
                const parsed = JSON.parse(line) as OllamaChunk;
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
              } catch { /* skip */ }
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
