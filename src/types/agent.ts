import type Anthropic from '@anthropic-ai/sdk';

export type MessageRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: MessageRole;
  content: string | Anthropic.ContentBlock[];
}

export interface AgentRunResult {
  success: boolean;
  iterationsUsed: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  stopReason: string;
  error?: string;
}

export interface ToolCallRecord {
  toolName: string;
  toolUseId: string;
  input: Record<string, unknown>;
  result: string;
  isError: boolean;
  durationMs: number;
  timestamp: Date;
}

export interface AgentSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  toolCalls: ToolCallRecord[];
  totalTokens: number;
}
