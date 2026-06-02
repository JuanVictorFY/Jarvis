export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ProviderToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ProviderStreamChunk {
  type: 'text' | 'tool_call' | 'done';
  text?: string;
  toolCall?: ProviderToolCall;
  stopReason?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ProviderCompletionRequest {
  messages: ProviderMessage[];
  tools?: ProviderToolDefinition[];
  maxTokens: number;
  systemPrompt?: string;
}

export interface AIProvider {
  readonly name: string;
  readonly id: string;
  readonly availableModels: string[];

  streamCompletion(
    request: ProviderCompletionRequest,
    model: string,
    onChunk: (chunk: ProviderStreamChunk) => void
  ): Promise<void>;

  validateApiKey(key: string): Promise<boolean>;
  isConfigured(): boolean;
}
