import https from 'https';
import type {
  AIProvider,
  ProviderCompletionRequest,
  ProviderStreamChunk,
} from './AIProvider';

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiStreamResponse {
  candidates?: Array<{
    content?: { parts: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
  };
}

export class GeminiProvider implements AIProvider {
  readonly name = 'Google Gemini';
  readonly id = 'gemini';
  readonly availableModels = [
    'gemini-2.0-flash',
    'gemini-2.0-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
  private readonly baseHost = 'generativelanguage.googleapis.com';

  constructor(private apiKey: string) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  updateApiKey(key: string): void {
    this.apiKey = key;
  }

  async validateApiKey(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = https.get(
        `https://${this.baseHost}/v1beta/models?key=${key}`,
        (res) => resolve(res.statusCode === 200)
      );
      req.on('error', () => resolve(false));
      req.setTimeout(8_000, () => { req.destroy(); resolve(false); });
    });
  }

  async streamCompletion(
    request: ProviderCompletionRequest,
    model: string,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<void> {
    const contents: GeminiContent[] = request.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const body = JSON.stringify({
      contents,
      systemInstruction: request.systemPrompt
        ? { parts: [{ text: request.systemPrompt }] }
        : undefined,
      generationConfig: { maxOutputTokens: request.maxTokens },
    });

    const path = `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: this.baseHost,
          path,
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
              if (!line.startsWith('data: ')) { continue; }
              const raw = line.slice(6).trim();
              try {
                const parsed = JSON.parse(raw) as GeminiStreamResponse;
                const text = parsed.candidates?.[0]?.content?.parts[0]?.text;
                if (text) { onChunk({ type: 'text', text }); }
                const finishReason = parsed.candidates?.[0]?.finishReason;
                if (finishReason) {
                  onChunk({
                    type: 'done',
                    stopReason: finishReason,
                    inputTokens: parsed.usageMetadata?.promptTokenCount,
                    outputTokens: parsed.usageMetadata?.candidatesTokenCount,
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
