import type { JarvisConfig } from './index';

export interface SendMessagePayload {
  message: string;
  conversationId?: string;
}

export interface AgentTextEvent {
  type: 'text';
  text: string;
}

export interface AgentToolStartEvent {
  type: 'tool_start';
  toolName: string;
  toolUseId: string;
  input: Record<string, unknown>;
}

export interface AgentToolDoneEvent {
  type: 'tool_done';
  toolUseId: string;
  result: string;
  isError: boolean;
}

export interface AgentDoneEvent {
  type: 'done';
  stopReason: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AgentErrorEvent {
  type: 'error';
  message: string;
}

export type AgentEvent =
  | AgentTextEvent
  | AgentToolStartEvent
  | AgentToolDoneEvent
  | AgentDoneEvent
  | AgentErrorEvent;

export interface ConfirmActionPayload {
  toolUseId: string;
  toolName: string;
  description: string;
  details: string;
}

export interface ActionResponsePayload {
  toolUseId: string;
  approved: boolean;
}

export interface ConfigResponse {
  config: JarvisConfig;
}

export interface VersionResponse {
  version: string;
  electron: string;
  node: string;
}
