import Anthropic from '@anthropic-ai/sdk';
import type {
  AIProvider,
  ProviderCompletionRequest,
  ProviderStreamChunk,
  ProviderToolDefinition,
} from './AIProvider';

export class AnthropicProvider implements AIProvider {
  readonly name = 'Anthropic (Claude)';
  readonly id = 'anthropic';
  readonly availableModels = [
    'claude-sonnet-4-6',
    'claude-opus-4-8',
    'claude-haiku-4-5-20251001',
  ];

  private client: Anthropic | null = null;

  constructor(private apiKey: string) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  updateApiKey(key: string): void {
    this.apiKey = key;
    this.client = key ? new Anthropic({ apiKey: key }) : null;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.client);
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const testClient = new Anthropic({ apiKey: key });
      await testClient.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async streamCompletion(
    request: ProviderCompletionRequest,
    model: string,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    const tools = request.tools?.map(this.toAnthropicTool) ?? [];

    const stream = this.client.messages.stream({
      model,
      max_tokens: request.maxTokens,
      system: request.systemPrompt,
      messages: request.messages,
      tools: tools.length > 0 ? tools : undefined,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          onChunk({ type: 'text', text: event.delta.text });
        } else if (event.delta.type === 'input_json_delta') {
          // tool input streaming — handled in tool_use block
        }
      } else if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          onChunk({
            type: 'tool_call',
            toolCall: {
              id: event.content_block.id,
              name: event.content_block.name,
              input: {},
            },
          });
        }
      } else if (event.type === 'message_delta') {
        const usage = event.usage;
        onChunk({
          type: 'done',
          stopReason: event.delta.stop_reason ?? 'end_turn',
          outputTokens: usage?.output_tokens,
        });
      }
    }

    const final = await stream.finalMessage();
    onChunk({
      type: 'done',
      stopReason: final.stop_reason ?? 'end_turn',
      inputTokens: final.usage.input_tokens,
      outputTokens: final.usage.output_tokens,
    });
  }

  private toAnthropicTool(tool: ProviderToolDefinition): Anthropic.Tool {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: { type: 'object', ...tool.parameters } as Anthropic.Tool['input_schema'],
    };
  }
}
