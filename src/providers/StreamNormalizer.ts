import type { ProviderStreamChunk } from './AIProvider';

export interface NormalizedStreamEvent {
  type: 'text' | 'tool_start' | 'tool_done' | 'done' | 'error';
  text?: string;
  toolName?: string;
  toolUseId?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: string;
  stopReason?: string;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}

export class StreamNormalizer {
  private readonly pendingToolCalls = new Map<string, {
    name: string;
    inputBuffer: string;
  }>();

  normalize(chunk: ProviderStreamChunk): NormalizedStreamEvent | null {
    switch (chunk.type) {
      case 'text':
        return { type: 'text', text: chunk.text };

      case 'tool_call': {
        const call = chunk.toolCall;
        if (!call) { return null; }
        this.pendingToolCalls.set(call.id, { name: call.name, inputBuffer: '' });
        return {
          type: 'tool_start',
          toolName: call.name,
          toolUseId: call.id,
          toolInput: call.input,
        };
      }

      case 'done':
        return {
          type: 'done',
          stopReason: chunk.stopReason,
          inputTokens: chunk.inputTokens,
          outputTokens: chunk.outputTokens,
        };

      default:
        return null;
    }
  }

  appendToolInput(toolId: string, jsonDelta: string): void {
    const call = this.pendingToolCalls.get(toolId);
    if (call) {
      call.inputBuffer += jsonDelta;
    }
  }

  finalizeToolCall(toolId: string): Record<string, unknown> | null {
    const call = this.pendingToolCalls.get(toolId);
    if (!call) { return null; }
    try {
      const input = JSON.parse(call.inputBuffer) as Record<string, unknown>;
      this.pendingToolCalls.delete(toolId);
      return input;
    } catch {
      this.pendingToolCalls.delete(toolId);
      return {};
    }
  }

  reset(): void {
    this.pendingToolCalls.clear();
  }
}
